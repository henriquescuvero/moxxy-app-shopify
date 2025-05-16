import { Request, Response, NextFunction } from "express";
import { redis } from "../services/cache.server";
import { promisify } from "util";

// Tempo de expiração do cache em segundos
const DEFAULT_CACHE_TTL = 300; // 5 minutos

/**
 * Middleware de cache para rotas GET
 * @param ttl Tempo de vida do cache em segundos
 */
export const cacheMiddleware = (ttl: number = DEFAULT_CACHE_TTL) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Apenas cache para requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl || req.url}`;
      
      // Tenta obter o cache
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        // Se encontrou no cache, retorna os dados em cache
        const result = JSON.parse(cachedData);
        
        // Verifica se o cache está expirado (stale-while-revalidate)
        const now = Math.floor(Date.now() / 1000);
        const cacheInfo = await redis.hgetall(`cache:info:${key}`);
        
        if (cacheInfo && (now - parseInt(cacheInfo.timestamp || '0', 10)) > ttl / 2) {
          // Se o cache está velho, atualiza em segundo plano
          next(); // A próxima requisição irá atualizar o cache
        }
        
        return res.json(JSON.parse(cachedData));
      }
      
      // Se não encontrou no cache, continua para o próximo middleware
      const originalJson = res.json.bind(res);
      
      // Sobrescreve o método json para capturar a resposta
      res.json = (body: any) => {
        // Armazena no cache
        if (res.statusCode === 200) {
          const cacheKey = `cache:${req.originalUrl || req.url}`;
          const cacheInfoKey = `cache:info:${cacheKey}`;
          const timestamp = Math.floor(Date.now() / 1000);
          
          Promise.all([
            redis.set(cacheKey, JSON.stringify(body), 'EX', ttl),
            redis.hmset(cacheInfoKey, {
              timestamp,
              ttl,
              url: req.originalUrl || req.url,
              cachedAt: new Date().toISOString()
            }),
            redis.expire(cacheInfoKey, ttl)
          ]).catch(console.error);
        }
        
        return originalJson(body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalida o cache para uma determinada chave
 */
export const invalidateCache = async (key: string) => {
  try {
    await Promise.all([
      redis.del(`cache:${key}`),
      redis.del(`cache:info:${key}`)
    ]);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

/**
 * Invalida o cache com base em um padrão
 */
export const invalidateCacheByPattern = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}*`);
    const infoKeys = await redis.keys(`cache:info:${pattern}*`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    if (infoKeys.length > 0) {
      await redis.del(...infoKeys);
    }
  } catch (error) {
    console.error('Error invalidating cache by pattern:', error);
  }
};
