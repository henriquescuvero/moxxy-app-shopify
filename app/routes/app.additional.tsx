import { Page, Layout, Card, Text } from "@shopify/polaris";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Importe a função authenticate do seu utilitário do Shopify
// import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Descomente a linha abaixo para autenticar a loja
  // await authenticate.admin(request);

  // Seus dados de loader aqui
  return json({ message: "Esta é a página adicional!" });
};

export default function AdditionalPage() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <Page title="Página Adicional">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Conteúdo da Página Adicional
            </Text>
            <Text as="p" variant="bodyMd">
              {message}
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}