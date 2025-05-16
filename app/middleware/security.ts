import { json } from "@remix-run/node";
import { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import prisma from "../db.server";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import { verify } from "jsonwebtoken";
import { promisify } from "util";

// Configuração de segurança de headers HTTP
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", process.env.API_URL || ""],
    },
  },
  hsts: true,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

// Configuração de CORS
const allowedOrigins = [
  'https://*.shopify.com',
  'https://*.myshopify.com',
  process.env.APP_URL || 'http://localhost:3000',
];

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowedOrigin => origin.endsWith(new URL(allowedOrigin).hostname))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Middleware para validação de inputs com limite de tamanho
export const validateInput = (schema: z.ZodSchema, maxJsonSize: number = 1024 * 100) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Verifica o tamanho do conteúdo
      const contentLength = parseInt(request.headers['content-length'] || '0');
      if (contentLength > maxJsonSize) {
        return response.status(413).json({
          error: "Payload too large",
          message: `Request body exceeds ${maxJsonSize} bytes`
        });
      }

      // Limita o tamanho do corpo da requisição
      const rawBody = await new Promise<string>((resolve, reject) => {
        let data = '';
        request.on('data', chunk => {
          data += chunk;
          if (data.length > maxJsonSize) {
            request.destroy();
            reject(new Error('Request body too large'));
          }
        });
        request.on('end', () => resolve(data));
        request.on('error', reject);
      });

      // Verifica se o corpo é um JSON válido
      let parsedData;
      try {
        parsedData = JSON.parse(rawBody);
      } catch (e) {
        return response.status(400).json({
          error: "Invalid JSON",
          message: "The request body must be a valid JSON"
        });
      }

      // Valida o schema
      const result = schema.safeParse(parsedData);
      if (!result.success) {
        return response.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
      }

      // Adiciona os dados validados ao request para uso posterior
      (request as any).validatedData = result.data;
      next();
    } catch (error: any) {
      if (error.message === 'Request body too large') {
        return response.status(413).json({
          error: "Payload too large",
          message: `Request body exceeds ${maxJsonSize} bytes`
        });
      }
      next(error);
    }
  };
};

// Configuração de rate limiting por rota e método
const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Too many requests, please try again later.",
    },
    keyGenerator: (req) => {
      // Gera uma chave única baseada no IP, rota e método HTTP
      return `${req.ip}:${req.method}:${req.path}`;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests",
        message: `You have exceeded the ${max} requests in ${windowMs/60000} minutes limit`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiters para diferentes tipos de rotas
export const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests por 15min para API
export const authRateLimiter = createRateLimiter(60 * 60 * 1000, 10); // 10 tentativas de login por hora
export const publicRateLimiter = createRateLimiter(60 * 60 * 1000, 1000); // 1000 requests por hora para rotas públicas

// Proteção contra injeção SQL e XSS
export const securityProtection = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Verifica se há tentativas de injeção SQL
    const sqlInjectionPatterns = [
      /\b(SELECT|UPDATE|DELETE|DROP|INSERT|ALTER|TRUNCATE|UNION|EXEC|EXECUTE|DECLARE|XP_|sp_|--|#|\/\*|\*\/|;|\b(OR|AND)\s+\d+=\d+)\b/gi,
      /(\%27|\'|\"\")/g,
      /(\%3D|=)[^\n]*(\%27|\'|\"\")/g,
      /\w*((\%27)|(\'\s*\+\s*\'?)|(\"\s*\+\s*\"?)|(\%3D\s*\%27))\s*\w*/g,
      /(\%27|\'|\"\")\s*\bor\b\s*\d+\s*\-\s*\d+/g,
      /(\%27|\'|\"\")\s*\b(AND|OR)\b\s*[\w\s=\-\+]+(\%27|\'|\"\")/g,
    ];

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*\s(src|href)=\s*(?:"|')((?:javascript:|data:).*?)(?:"|')/gi,
      /<[^>]*\sstyle\s*=\s*[\w\s:]*\s*expression\s*\(/gi,
    ];

    // Verifica os parâmetros da URL
    const urlParams = request.query;
    const hasSqlInjection = Object.values(urlParams).some((param) => {
      if (typeof param === 'string') {
        return sqlInjectionPatterns.some(pattern => pattern.test(param));
      } else if (Array.isArray(param)) {
        return param.some(p => 
          typeof p === 'string' && sqlInjectionPatterns.some(pattern => pattern.test(p))
        );
      }
      return false;
    });

    if (hasSqlInjection) {
      return response.status(400).json({
        error: "Invalid input detected",
        message: "Potential SQL injection attempt detected"
      });
    }


    // Verifica o corpo da requisição se for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = request.body;
      if (body) {
        const bodyString = JSON.stringify(body).toLowerCase();
        const hasMaliciousContent = [
          ...sqlInjectionPatterns,
          ...xssPatterns
        ].some(pattern => pattern.test(bodyString));

        if (hasMaliciousContent) {
          return response.status(400).json({
            error: "Invalid input detected",
            message: "Potential security threat detected in request body"
          });
        }
      }
    }


    // Verifica headers para XSS
    const headers = request.headers;
    const hasXssInHeaders = Object.entries(headers).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.some(v => xssPatterns.some(pattern => 
          pattern.test(v)
        ));
      } else if (typeof value === 'string') {
        return xssPatterns.some(pattern => pattern.test(value));
      }
      return false;
    });

    if (hasXssInHeaders) {
      return response.status(400).json({
        error: "Invalid input detected",
        message: "Potential XSS attempt detected in headers"
      });
    }

    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    next(error);
  }
};

// Middleware de logging de segurança
export const securityLogger = async (
  request: Request,
  response: Response,
  next: Function
) => {
  try {
    // Log básico
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);

    // Log de headers importantes
    console.log({
      userAgent: request.headers["user-agent"],
      ip: request.ip,
      referrer: request.headers.referer,
    });

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para monitoramento de erros
export const errorMonitor = async (
  error: Error,
  request: Request,
  response: Response,
  next: Function
) => {
  try {
    // Log do erro
    console.error(`Error in ${request.method} ${request.url}:`, error);

    // Monitoramento de erros específicos
    if (error instanceof Error) {
      // Aqui poderíamos integrar com um serviço de monitoramento como Sentry
      // ou enviar emails para a equipe de suporte
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    // Resposta padrão para erros
    response.status(500).json({
      error: "Internal server error",
    });
  } catch (monitorError) {
    console.error("Error in error monitoring:", monitorError);
    response.status(500).json({
      error: "Internal server error",
    });
  }
};
