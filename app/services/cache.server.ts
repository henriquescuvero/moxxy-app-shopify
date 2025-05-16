import { Redis } from "ioredis";

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
});

// Cache para dados de popups
export const cachePopups = async (shopId: string, popups: any[], ttl: number = 3600) => {
  try {
    await redis.set(`popups:${shopId}`, JSON.stringify(popups), "EX", ttl);
  } catch (error) {
    console.error("Error caching popups:", error);
  }
};

// Recupera popups do cache
export const getCachedPopups = async (shopId: string) => {
  try {
    const cached = await redis.get(`popups:${shopId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error retrieving cached popups:", error);
    return null;
  }
};

// Cache para métricas
export const cacheMetrics = async (popupId: string, metrics: any, ttl: number = 3600) => {
  try {
    await redis.set(`metrics:${popupId}`, JSON.stringify(metrics), "EX", ttl);
  } catch (error) {
    console.error("Error caching metrics:", error);
  }
};

// Recupera métricas do cache
export const getCachedMetrics = async (popupId: string) => {
  try {
    const cached = await redis.get(`metrics:${popupId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error retrieving cached metrics:", error);
    return null;
  }
};

// Limpa o cache de um popup específico
export const clearPopupCache = async (popupId: string) => {
  try {
    await redis.del(`metrics:${popupId}`);
    await redis.del(`popups:${popupId}`);
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

// Limpa todo o cache de popups de uma loja
export const clearShopCache = async (shopId: string) => {
  try {
    const keys = await redis.keys(`popups:${shopId}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("Error clearing shop cache:", error);
  }
};
