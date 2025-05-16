import { Request, Response, NextFunction } from "express";
import { redis } from "../services/cache.server";
import { performance } from 'perf_hooks';

// Limite de tempo para considerar uma requisição lenta (em ms)
const SLOW_REQUEST_THRESHOLD = 1000;

// Número máximo de requisições lentas para armazenar
const MAX_SLOW_REQUESTS = 100;

export interface PerformanceMetrics {
  method: string;
  path: string;
  duration: number;
  timestamp: number;
  statusCode: number;
  query: Record<string, any>;
  params: Record<string, any>;
}

/**
 * Middleware para monitorar o desempenho das requisições
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const startHrTime = process.hrtime();

  // Captura o tempo de resposta
  res.on('finish', async () => {
    const duration = performance.now() - start;
    const [seconds, nanoseconds] = process.hrtime(startHrTime);
    const hrDuration = (seconds * 1000) + (nanoseconds / 1e6);

    const metrics: PerformanceMetrics = {
      method: req.method,
      path: req.path,
      duration: hrDuration,
      timestamp: Date.now(),
      statusCode: res.statusCode,
      query: req.query,
      params: req.params,
    };

    // Registra métricas de desempenho
    await recordMetrics(metrics);

    // Log de requisições lentas
    if (hrDuration > SLOW_REQUEST_THRESHOLD) {
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${hrDuration.toFixed(2)}ms`);
      await recordSlowRequest(metrics);
    }
  });

  next();
};

/**
 * Registra métricas de desempenho
 */
async function recordMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    const key = `perf:${metrics.method}:${metrics.path}`;
    const now = Date.now();
    const pipeline = redis.pipeline();

    // Incrementa o contador de requisições
    pipeline.incr(`${key}:count`);
    
    // Adiciona ao total de tempo de resposta
    pipeline.incrbyfloat(`${key}:total_time`, metrics.duration);
    
    // Atualiza o tempo máximo de resposta
    pipeline.set(`${key}:max`, metrics.duration, 'KEEPTTL', 'GT');
    
    // Atualiza o tempo mínimo de resposta
    pipeline.set(`${key}:min`, metrics.duration, 'KEEPTTL', 'LT');
    
    // Adiciona ao histórico de tempos de resposta (rolling window de 1 hora)
    pipeline.zadd(`${key}:response_times`, now, `${metrics.duration}:${now}`);
    pipeline.zremrangebyscore(`${key}:response_times`, '-inf', now - 3600000);
    
    // Define TTL para as chaves (1 dia)
    pipeline.expire(`${key}:count`, 86400);
    pipeline.expire(`${key}:total_time`, 86400);
    pipeline.expire(`${key}:max`, 86400);
    pipeline.expire(`${key}:min`, 86400);
    pipeline.expire(`${key}:response_times`, 86400);
    
    await pipeline.exec();
  } catch (error) {
    console.error('Error recording performance metrics:', error);
  }
}

/**
 * Registra uma requisição lenta
 */
async function recordSlowRequest(metrics: PerformanceMetrics): Promise<void> {
  try {
    const key = 'slow_requests';
    const data = JSON.stringify(metrics);
    
    // Adiciona à lista de requisições lentas
    await redis.lpush(key, data);
    
    // Mantém apenas as N requisições mais recentes
    await redis.ltrim(key, 0, MAX_SLOW_REQUESTS - 1);
    
    // Define TTL para a lista (7 dias)
    await redis.expire(key, 7 * 24 * 60 * 60);
  } catch (error) {
    console.error('Error recording slow request:', error);
  }
}

/**
 * Obtém estatísticas de desempenho para uma rota
 */
export async function getRouteStats(method: string, path: string) {
  try {
    const key = `perf:${method}:${path}`;
    const [
      count,
      totalTime,
      max,
      min,
      responseTimes
    ] = await Promise.all([
      redis.get(`${key}:count`),
      redis.get(`${key}:total_time`),
      redis.get(`${key}:max`),
      redis.get(`${key}:min`),
      redis.zrange(`${key}:response_times`, 0, -1, 'WITHSCORES')
    ]);

    if (!count || !totalTime) {
      return null;
    }

    const avg = parseFloat(totalTime) / parseInt(count);
    
    // Calcula percentis
    const percentiles = [50, 75, 90, 95, 99];
    const percentileValues: Record<number, number> = {};
    
    for (const p of percentiles) {
      const index = Math.floor((p / 100) * responseTimes.length / 2) * 2;
      if (responseTimes[index]) {
        percentileValues[p] = parseFloat(responseTimes[index].split(':')[0]);
      }
    }

    return {
      count: parseInt(count),
      average: avg,
      max: parseFloat(max || '0'),
      min: parseFloat(min || '0'),
      percentiles: percentileValues,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting route stats:', error);
    return null;
  }
}
