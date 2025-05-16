import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { registerAllWebhooks } from '../app/services/webhooks.server';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const shopDomain = process.argv[2];
    
    if (!shopDomain) {
      console.error('Por favor, forneça o domínio da loja como argumento');
      console.log('Uso: ts-node scripts/register-webhooks.ts seudominio.myshopify.com');
      process.exit(1);
    }
    
    console.log(`Registrando webhooks para a loja: ${shopDomain}`);
    
    // Registrar webhooks
    const results = await registerAllWebhooks(shopDomain);
    
    console.log('Webhooks registrados com sucesso!');
    console.log('Resultados:', results);
    
  } catch (error) {
    console.error('Erro ao registrar webhooks:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
