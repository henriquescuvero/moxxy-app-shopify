import { 
  json, 
  LoaderFunctionArgs, 
  ActionFunctionArgs, 
  TypedResponse 
} from "@remix-run/node";
import { Popup, popupSchema } from "./types";
import prisma from "../../db.server";
import { authenticate } from "../../shopify.server";
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { validateInput, securityProtection, apiRateLimiter } from "../../middleware/security";
import { cacheMiddleware, invalidateCacheByPattern } from "../../middleware/cache";
import { performanceMonitor } from "../../middleware/performance";
import { logger } from "../../services/logger.server";

// Função auxiliar para converter o Request do Remix em um formato compatível com o Shopify
function createShopifyCompatibleRequest(originalRequest: Request): any {
  // Cria um objeto de requisição simples com as propriedades necessárias
  const requestData: any = {
    method: originalRequest.method,
    headers: {},
    url: originalRequest.url,
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    originalUrl: originalRequest.url,
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    protocol: 'https:',
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    secure: true,
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    hostname: new URL(originalRequest.url).hostname,
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    cookies: {},
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    signedCookies: {},
    // @ts-ignore - Adiciona propriedades necessárias para o Shopify
    secret: process.env.SHOPIFY_API_SECRET,
  };

  // Copia os cabeçalhos
  if (originalRequest.headers) {
    requestData.headers = {};
    // @ts-ignore - Itera sobre os cabeçalhos do Request do Remix
    for (const [key, value] of originalRequest.headers.entries()) {
      requestData.headers[key] = value;
    }
  }

  return requestData;
}

// Tipos personalizados para compatibilidade
interface CustomRequest extends Omit<ExpressRequest, 'headers'> {
  logger: typeof logger;
  validatedData?: any;
  shop?: {
    id: string;
    shopifyDomain: string;
  };
  // Adiciona a propriedade headers como um objeto simples
  headers: Record<string, string | string[] | undefined>;
}

type Request = CustomRequest;
type Response = ExpressResponse;

// Tipos para as respostas da API
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
};

type PaginatedResponse<T> = ApiResponse<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

// Tipos para o contexto da requisição
import type { DataFunctionArgs } from '@remix-run/node';

type AppRequest = DataFunctionArgs['request'] & {
  logger: typeof logger;
  validatedData?: any;
  shop?: {
    id: string;
    shopifyDomain: string;
  };
};

// Middleware para autenticação e obtenção da loja
async function getShopFromRequest(remixRequest: Request) {
  try {
    // Cria um objeto de requisição simples com as propriedades necessárias
    const requestData: any = {
      method: remixRequest.method,
      headers: {},
      url: remixRequest.url,
      originalUrl: remixRequest.url,
      protocol: 'https:',
      secure: true,
      hostname: new URL(remixRequest.url).hostname,
      cookies: {},
      signedCookies: {},
      secret: process.env.SHOPIFY_API_SECRET,
    };

    // Copia os cabeçalhos
    if (remixRequest.headers) {
      // @ts-ignore - Itera sobre os cabeçalhos do Request do Remix
      for (const [key, value] of remixRequest.headers.entries()) {
        if (Array.isArray(value)) {
          requestData.headers[key] = value.join(', ');
        } else if (value) {
          requestData.headers[key] = value;
        }
      }
    }

    // Usa o helper de autenticação do Remix para obter a sessão
    const { session } = await authenticate.admin(requestData);
    
    // Verifica se a sessão é válida
    if (!session) {
      throw new Error('Não autenticado');
    }
    
    // Extrai o domínio da loja da sessão
    const shopDomain = session.shop;
    
    // Usa o ID da sessão como ID da loja
    const shopId = session.id;
    
    return {
      id: shopId,
      shopifyDomain: shopDomain,
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw new Error('Falha na autenticação da loja');
  }
}

type ActionData = {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
};

type LoaderData = {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  details?: string;
};

// Aplica middlewares de segurança e desempenho
export const apiMiddlewares = [
  // Adiciona o logger à requisição
  (req: AppRequest, _res: Response, next: NextFunction) => {
    req.logger = logger;
    next();
  },
  // Middlewares de segurança
  securityProtection,
  apiRateLimiter,
  // Middleware de desempenho
  performanceMonitor,
  // Middleware de cache (5 minutos)
  cacheMiddleware(300)
];

// Action para criar um novo popup
export async function action({ request }: ActionFunctionArgs) {
  // Usa o logger global já que não temos mais acesso ao req.logger do Express
  const logger = console;
  
  logger.info('Iniciando criação de popup');
  
  try {
    // Obtém a loja autenticada - fazendo type assertion para o tipo Request
    const shop = await getShopFromRequest(request as unknown as Request);
    
    // Valida e processa os dados do formulário
    const formData = await request.json();
    const validatedData = popupSchema.parse(formData);
    
    logger.debug('Dados validados com sucesso', { shopId: shop.id });
    
    // Inicia transação para garantir consistência
    const popup = await prisma.$transaction(async (tx: any) => {
      const newPopup = await tx.popup.create({
        data: {
          ...validatedData,
          shopId: shop.id,
          metrics: {
            impressions: 0,
            clicks: 0,
            conversionRate: 0,
            lastUpdated: new Date(),
          },
        },
      });
      
      // Invalida o cache para a lista de popups
      await invalidateCacheByPattern(`/api/popups?shop=${shop.shopifyDomain}`);
      
      return newPopup;
    });
    
    logger.info('Popup criado com sucesso', { popupId: popup.id });
    
    // Usa 'as const' para garantir que o tipo seja inferido corretamente
    return json({
      success: true as const,
      data: popup
    }) as unknown as Response;
  } catch (error: any) {
    logger.error('Erro ao criar popup', { 
      error: error.message, 
      stack: error.stack,
      url: request.url 
    });
    
    // Usa 'as const' para garantir que o tipo seja inferido corretamente
    return json({
      success: false as const,
      error: 'Falha ao criar popup',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 400 }) as unknown as Response;
  }
}

// Função para listar popups com suporte a cache e paginação
export async function loader({ request }: LoaderFunctionArgs) {
  // Usa o logger global já que não temos mais acesso ao req.logger do Express
  const logger = console;
  
  try {
    // Obtém a loja autenticada - fazendo type assertion para o tipo Request
    const shop = await getShopFromRequest(request as unknown as Request);
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    
    // Parâmetros de paginação e filtro
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    
    // Filtros adicionais
    const status = searchParams.get("status") as 'draft' | 'active' | 'archived' | null;
    const search = searchParams.get("search");
    
    // Construir a query
    const where: any = { shopId: shop.id };
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    
    // Consulta para obter o total de registros
    const totalCount = await prisma.popup.count({ where });
    const totalPages = Math.ceil(totalCount / limit);
    
    // Consulta para obter os dados paginados
    const popupsList = await prisma.popup.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' as const },
    });
    
    logger.debug('Popups recuperados com sucesso', { 
      total: totalCount, 
      page, 
      limit, 
      totalPages 
    });
    
    // Usa 'as const' para garantir que o tipo seja inferido corretamente
    return json({
      success: true as const,
      data: popupsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    }) as unknown as Response;
    
  } catch (error: any) {
    logger.error('Erro ao listar popups', { 
      error: error.message, 
      stack: error.stack,
      url: request.url 
    });
    
    // Usa 'as const' para garantir que o tipo seja inferido corretamente
    return json({
      success: false as const,
      error: 'Falha ao buscar popups',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 }) as unknown as Response;
  }
}
