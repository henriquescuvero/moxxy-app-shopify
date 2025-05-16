import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { performance } from 'perf_hooks';

// Níveis de log
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Interface para o contexto do log
export interface LogContext {
  [key: string]: any;
  requestId?: string;
  userId?: string;
  shopDomain?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
}

// Configuração do logger
interface LoggerConfig {
  level: LogLevel;
  prettyPrint: boolean;
  redact: string[];
}

// Mapeamento de níveis de log para prioridade
const LOG_LEVELS: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
  [LogLevel.TRACE]: 4
};

// Classe de logger estruturado
export class Logger {
  private config: LoggerConfig;
  private requestId: string;
  private startTime: number;
  private context: LogContext;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      prettyPrint: process.env.NODE_ENV !== 'production',
      redact: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'apiKey'],
      ...config
    };
    
    this.requestId = '';
    this.startTime = 0;
    this.context = {};
  }

  // Cria um novo logger com um contexto compartilhado
  public child(context: LogContext = {}): Logger {
    const child = new Logger(this.config);
    child.requestId = this.requestId;
    child.startTime = this.startTime;
    child.context = { ...this.context, ...context };
    return child;
  }

  // Inicia o rastreamento de uma requisição
  public startRequest(req: Request, res: Response): void {
    this.requestId = uuidv4();
    this.startTime = performance.now();
    
    this.context = {
      requestId: this.requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.ips[0] || req.connection.remoteAddress,
      shopDomain: (req as any).shop?.shopifyDomain
    };

    // Adiciona o ID da requisição ao objeto de resposta
    res.setHeader('X-Request-ID', this.requestId);

    // Registra o início da requisição
    this.info('Request started', {
      method: req.method,
      url: req.originalUrl,
      headers: this.redactSensitiveData(req.headers)
    });

    // Registra o fim da requisição quando terminar
    const originalEnd = res.end;
    res.end = ((...args: any[]) => {
      const responseTime = performance.now() - this.startTime;
      
      this.context = {
        ...this.context,
        statusCode: res.statusCode,
        responseTime
      };

      this.info('Request completed', {
        statusCode: res.statusCode,
        responseTime: `${responseTime.toFixed(2)}ms`,
        headers: this.redactSensitiveData(res.getHeaders())
      });

      return originalEnd.apply(res, args);
    }) as any;
  }

  // Registra uma mensagem de erro
  public error(message: string, context: LogContext = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }

  // Registra uma mensagem de aviso
  public warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  // Registra uma mensagem informativa
  public info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  // Registra uma mensagem de depuração
  public debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Registra uma mensagem de rastreamento
  public trace(message: string, context: LogContext = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  // Registra uma mensagem com o nível especificado
  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    if (LOG_LEVELS[level] > LOG_LEVELS[this.config.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...this.redactSensitiveData(this.context),
      ...this.redactSensitiveData(context)
    };

    // Formata a saída
    if (this.config.prettyPrint) {
      console[level === 'info' ? 'log' : level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData);
    } else {
      console[level === 'info' ? 'log' : level](JSON.stringify(logData));
    }
  }

  // Remove dados sensíveis do contexto
  private redactSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactSensitiveData(item));
    }

    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (this.config.redact.includes(key.toLowerCase())) {
        acc[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        acc[key] = this.redactSensitiveData(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }
}

// Instância global do logger
export const logger = new Logger({
  level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  prettyPrint: process.env.NODE_ENV !== 'production',
  redact: [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'apiKey',
    'cookie',
    'set-cookie'
  ]
});

// Middleware para adicionar o logger à requisição
export function loggerMiddleware(req: Request, res: Response, next: () => void): void {
  const requestLogger = logger.child({});
  requestLogger.startRequest(req, res);
  
  // Adiciona o logger ao objeto de requisição
  (req as any).logger = requestLogger;
  
  next();
}
