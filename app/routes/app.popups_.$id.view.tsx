import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, LegacyCard, BlockStack, Text, Banner, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { Popup } from "@prisma/client";

// Tipagem para os dados do popup
interface PopupData {
  id: string;
  title: string;
  content: string;
  status: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversionRate: number;
    lastUpdated: string;
  } | null;
  trigger: string;
  duration: number;
  position: string;
  animation: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cookieDuration: number;
  isDismissable: boolean;
  showCloseButton: boolean;
  zIndex: number;
  buttonText?: string;
}

// Loader para buscar os dados do popup
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response("ID do popup não fornecido", { status: 400 });
  }

  const popup = await prisma.popup.findUnique({
    where: { 
      id,
      shopId: session.shop 
    },
  });

  if (!popup) {
    throw new Response("Popup não encontrado", { status: 404 });
  }

  return json({ popup });
}

export default function ViewPopupPage() {
  const { popup } = useLoaderData<typeof loader>();
  const popupData = popup as unknown as Popup & {
    buttonText?: string;
  };

  const metrics = popupData.metrics as {
    impressions: number;
    clicks: number;
    conversionRate: number;
    lastUpdated: string;
  } | null;

  const buttonText = popupData.buttonText || 'Ação';

  return (
    <Page>
      <TitleBar title={`Visualizar Popup - ${popup.title}`} />
      
      <Layout>
        <Layout.Section>
              <LegacyCard>
                <BlockStack gap="500">
                  <Banner title="Visualização do Popup" tone="info">
                    <p>Pré-visualização do seu popup com as configurações atuais.</p>
                  </Banner>
                  
                  <LegacyCard.Section>
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <head>
                          <meta charset="UTF-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1" />
                          <style>
                            body, html { 
                              margin: 0; 
                              padding: 0; 
                              height: 100%; 
                              font-family: Arial, sans-serif; 
                              display: flex; 
                              justify-content: center; 
                              align-items: center; 
                              background: transparent; 
                            }
                            .popup-preview {
                              position: relative;
                              background: ${popup.backgroundColor};
                              color: ${popup.textColor};
                              padding: 20px 30px;
                              border-radius: 8px;
                              max-width: 300px;
                              text-align: center;
                              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                              border: 1px solid #dfe3e8;
                              z-index: ${popup.zIndex};
                            }
                            .popup-preview h2 {
                              margin-top: 0;
                              margin-bottom: 10px;
                              font-size: 18px;
                            }
                            .popup-preview p {
                              margin-bottom: 15px;
                              font-size: 14px;
                              opacity: 0.9;
                            }
                            .popup-preview button.action-button {
                              padding: 8px 20px;
                              background-color: ${popup.buttonColor};
                              color: ${popup.buttonTextColor};
                              border: none;
                              border-radius: 5px;
                              font-size: 14px;
                              cursor: default;
                            }
                            .close-btn {
                              position: absolute;
                              top: 8px;
                              right: 8px;
                              background: transparent;
                              border: none;
                              font-size: 16px;
                              font-weight: bold;
                              cursor: default;
                              color: ${popup.textColor};
                              opacity: 0.7;
                            }
                            .close-btn:hover {
                              opacity: 1;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="popup-preview">
                            ${popup.showCloseButton ? '<button class="close-btn" aria-label="Fechar popup">×</button>' : ''}
                            <h2>{popupData.title}</h2>
                            <p>{popupData.content}</p>
                            <button class="action-button">{buttonText}</button>
                          </div>
                        </body>
                        </html>`}
                      title="Visualização do Popup"
                      style={{
                        width: '100%',
                        height: '400px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                      sandbox="allow-scripts"
                    />
                  </LegacyCard.Section>

                  <LegacyCard.Section>
                    <Text as="h2" variant="headingMd">Métricas</Text>
                    <BlockStack gap="400">
                      <Text as="p">
                        <strong>Impressões:</strong> {metrics?.impressions?.toLocaleString('pt-BR') || '0'}
                      </Text>
                      <Text as="p">
                        <strong>Cliques:</strong> {metrics?.clicks?.toLocaleString('pt-BR') || '0'}
                      </Text>
                      <Text as="p">
                        <strong>Taxa de Conversão:</strong> {metrics?.conversionRate?.toFixed(2) || '0'}%
                      </Text>
                    </BlockStack>
                  </LegacyCard.Section>

                  <LegacyCard.Section>
                    <Button
                      variant="primary"
                      onClick={() => {
                        window.location.href = `/app/popups/${popup.id}/edit`;
                      }}
                    >
                      Editar Configurações
                    </Button>
                  </LegacyCard.Section>
                </BlockStack>
              </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
