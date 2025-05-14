import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data for pop-up metrics
  const MOCK_DATA = {
    activePopups: 5, // Exemplo: 5 pop-ups ativos
    totalViews: 1250, // Exemplo: 1250 visualizações totais
    totalClicks: 300, // Exemplo: 300 cliques totais
  };

  return MOCK_DATA;
};



export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const shopify = useAppBridge(); // Mantido para TitleBar e outras interações futuras

  return (
    <Page>
      <TitleBar title="Moxxy App - Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Banner title="Estatísticas dos Pop-ups" tone="info">
              <Card>
                <BlockStack gap="200">
                  {/* O título "Estatísticas dos Pop-ups" foi movido para a prop title do Banner */}
                <InlineStack gap="400" align="space-around" blockAlign="center">
                  <BlockStack gap="100" inlineAlign="center">
                    <Text as="p" variant="headingLg" alignment="center">
                      {loaderData?.activePopups ?? 0}
                    </Text>
                    <Text as="p" variant="bodyMd" alignment="center">
                      Pop-ups Ativos
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100" inlineAlign="center">
                    <Text as="p" variant="headingLg" alignment="center">
                      {loaderData?.totalViews ?? 0}
                    </Text>
                    <Text as="p" variant="bodyMd" alignment="center">
                      Visualizações
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100" inlineAlign="center">
                    <Text as="p" variant="headingLg" alignment="center">
                      {loaderData?.totalClicks ?? 0}
                    </Text>
                    <Text as="p" variant="bodyMd" alignment="center">
                      Cliques
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>
            </Banner>
          </Layout.Section>
        </Layout>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Recursos Principais do Moxxy App
                  </Text>
                  <Text variant="bodyMd" as="p">
                    O Moxxy App permite que você crie, gerencie e otimize pop-ups para sua loja Shopify. Aumente suas conversões e engaje seus clientes com nossas ferramentas intuitivas. Explore as funcionalidades abaixo para começar.
                  </Text>
                </BlockStack>

              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Próximos Passos com Moxxy
                  </Text>
                  <List>
                    <List.Item>
                      Acesse a seção de <Link url="/app/popups" removeUnderline>Gerenciamento de Pop-ups</Link> para criar e configurar seus pop-ups.
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
