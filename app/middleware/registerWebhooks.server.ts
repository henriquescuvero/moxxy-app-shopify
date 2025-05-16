import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerAllWebhooks } from '~/services/webhooks.server';

// Middleware para registrar webhooks após a instalação do app
export async function registerWebhooksMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // Verificar se é uma requisição de callback de instalação
  if (url.pathname === '/auth/callback' && request.method === 'GET') {
    try {
      const shop = url.searchParams.get('shop');
      if (shop) {
        console.log(`Registrando webhooks para a loja: ${shop}`);
        await registerAllWebhooks(shop);
      }
    } catch (error) {
      console.error('Erro ao registrar webhooks:', error);
    }
  }
  
  return NextResponse.next();
}
