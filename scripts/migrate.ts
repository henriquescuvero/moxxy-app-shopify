import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando migração do banco de dados...');
    
    // Executar migrações pendentes
    console.log('Executando migrações...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
