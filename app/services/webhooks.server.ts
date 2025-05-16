import { shopify } from "~/shopify.server";
import { prisma } from "~/db.server";

export const WEBHOOK_TOPICS = [
  'PRODUCTS_CREATE',
  'PRODUCTS_UPDATE',
  'PRODUCTS_DELETE',
  'ORDERS_CREATE',
  'ORDERS_UPDATED',
  'CUSTOMERS_CREATE',
  'CUSTOMERS_UPDATE',
] as const;

type WebhookTopic = typeof WEBHOOK_TOPICS[number];

interface RegisterWebhookOptions {
  topic: WebhookTopic;
  address: string;
  format?: 'json' | 'xml';
}

export async function registerWebhook({
  topic,
  address,
  format = 'json',
}: RegisterWebhookOptions) {
  const webhooks = new shopify.api.rest.Webhooks({ session: shopify.session });
  
  try {
    await webhooks.save({
      topic,
      address,
      format,
    });
    console.log(`Webhook registrado para o tópico: ${topic}`);
    return true;
  } catch (error) {
    console.error(`Erro ao registrar webhook para ${topic}:`, error);
    return false;
  }
}

export async function registerAllWebhooks(shop: string) {
  const webhookBaseUrl = process.env.SHOPIFY_APP_URL;
  
  if (!webhookBaseUrl) {
    throw new Error('SHOPIFY_APP_URL não está definido no ambiente');
  }

  const webhookPromises = WEBHOOK_TOPICS.map((topic) => {
    const topicPath = topic.toLowerCase().replace(/_/g, '-');
    const address = `${webhookBaseUrl}/webhooks/${topicPath}`;
    
    return registerWebhook({
      topic,
      address,
    });
  });

  const results = await Promise.allSettled(webhookPromises);
  
  // Log dos resultados
  results.forEach((result, index) => {
    const topic = WEBHOOK_TOPICS[index];
    if (result.status === 'fulfilled') {
      console.log(`Webhook ${topic} registrado com sucesso`);
    } else {
      console.error(`Falha ao registrar webhook ${topic}:`, result.reason);
    }
  });

  return results;
}

// Função para processar webhooks recebidos
export async function processWebhook(topic: string, shop: string, body: any) {
  console.log(`Processando webhook: ${topic} para a loja: ${shop}`);
  
  // Registrar o webhook no banco de dados
  try {
    await prisma.webhookEvent.create({
      data: {
        topic,
        shop,
        payload: JSON.stringify(body),
        processed: false,
      },
    });

    // Aqui você pode adicionar lógica específica para cada tipo de webhook
    switch (topic) {
      case 'PRODUCTS_CREATE':
        await handleProductCreated(body);
        break;
      case 'PRODUCTS_UPDATE':
        await handleProductUpdated(body);
        break;
      case 'PRODUCTS_DELETE':
        await handleProductDeleted(body);
        break;
      case 'ORDERS_CREATE':
        await handleOrderCreated(body);
        break;
      // Adicione mais casos conforme necessário
    }

    // Marcar o webhook como processado
    await prisma.webhookEvent.updateMany({
      where: { topic, shop, processed: false },
      data: { processed: true },
    });

    return true;
  } catch (error) {
    console.error(`Erro ao processar webhook ${topic}:`, error);
    return false;
  }
}

// Funções de manipulação de eventos específicos
async function handleProductCreated(productData: any) {
  console.log('Novo produto criado:', productData.id);
  // Implemente a lógica para lidar com produtos criados
}

async function handleProductUpdated(productData: any) {
  console.log('Produto atualizado:', productData.id);
  // Implemente a lógica para lidar com produtos atualizados
}

async function handleProductDeleted(productData: any) {
  console.log('Produto excluído:', productData.id);
  // Implemente a lógica para lidar com produtos excluídos
}

async function handleOrderCreated(orderData: any) {
  console.log('Novo pedido criado:', orderData.id);
  // Implemente a lógica para lidar com novos pedidos
}
