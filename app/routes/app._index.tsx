import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const loaderData = useLoaderData<typeof loader>(); // Adicionado esta linha

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Pop-up de exemplo (Produto) criado com sucesso!");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Moxxy App - Dashboard">
        <button variant="primary" onClick={generateProduct}>
          Criar Pop-up (Demo)
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Banner title="Estatísticas dos Pop-ups" tone="success">
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
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Criar Pop-up (Demo)
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      Dados do Exemplo (productCreate)
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      Detalhes da Variante do Exemplo (productVariantsBulkUpdate)
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
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
