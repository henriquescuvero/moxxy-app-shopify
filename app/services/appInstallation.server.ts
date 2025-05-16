import { registerAllWebhooks } from "./webhooks.server";
import { prisma } from "~/db.server";

/**
 * Função chamada após a instalação do aplicativo
 */
export async function afterAppInstall(shop: string) {
  try {
    console.log(`Configurando webhooks para a loja: ${shop}`);
    
    // Registrar todos os webhooks necessários
    const webhookResults = await registerAllWebhooks(shop);
    
    // Aqui você pode adicionar outras configurações iniciais
    // como criar registros iniciais no banco de dados, etc.
    
    console.log('Instalação do aplicativo concluída com sucesso');
    return { success: true, webhookResults };
  } catch (error) {
    console.error('Erro durante a instalação do aplicativo:', error);
    throw error;
  }
}

/**
 * Função chamada ao desinstalar o aplicativo
 */
export async function onAppUninstall(shopDomain: string) {
  try {
    console.log(`Limpando dados da loja: ${shopDomain}`);
    
    // Aqui você pode adicionar lógica para limpar dados da loja
    // Por exemplo, remover webhooks registrados, limpar dados do banco, etc.
    
    // Exemplo: Remover webhooks da loja
    await prisma.webhookEvent.deleteMany({
      where: { shop: shopDomain }
    });
    
    console.log('Limpeza de dados concluída');
    return { success: true };
  } catch (error) {
    console.error('Erro ao limpar dados da loja:', error);
    throw error;
  }
}
