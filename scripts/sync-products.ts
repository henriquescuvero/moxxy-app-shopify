import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { syncShopifyProducts } from '../app/services/productSync.server';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const shopDomain = process.argv[2];
    const maxProducts = process.argv[3] ? parseInt(process.argv[3], 10) : 50;
    
    if (!shopDomain) {
      console.error('Por favor, forneça o domínio da loja como argumento');
      console.log('Uso: ts-node scripts/sync-products.ts seudominio.myshopify.com [maxProducts]');
      process.exit(1);
    }
    
    console.log(`Iniciando sincronização de produtos para a loja: ${shopDomain}`);
    console.log(`Número máximo de produtos a serem sincronizados: ${maxProducts}`);
    
    // Sincronizar produtos
    const result = await syncShopifyProducts({
      shop: shopDomain,
      maxProducts,
    });
    
    if (result.success) {
      console.log(`Sincronização concluída. ${result.syncedCount} produtos sincronizados.`);
    } else {
      console.error('Erro durante a sincronização:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Erro ao sincronizar produtos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
