import { ActionFunctionArgs, json } from "@remix-run/node";
import { processWebhook } from "~/services/webhooks.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const topic = params['*']?.replace(/\//g, '_').toUpperCase();
  
  if (!topic) {
    return json({ error: 'Tópico do webhook não especificado' }, { status: 400 });
  }

  const shop = request.headers.get('X-Shopify-Shop-Domain');
  if (!shop) {
    return json({ error: 'Cabeçalho X-Shopify-Shop-Domain ausente' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await processWebhook(topic, shop, body);
    return json({ success: true });
  } catch (error) {
    console.error(`Erro ao processar webhook ${topic}:`, error);
    return json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

export async function loader() {
  return json({ error: 'Método não permitido' }, { status: 405 });
}
