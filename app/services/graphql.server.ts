import { shopify } from '~/shopify.server';
import { prisma } from '~/db.server';

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function shopifyGraphQLQuery<T = any>(
  shop: string,
  query: string,
  variables: Record<string, any> = {}
): Promise<{ data?: T; errors?: any }> {
  try {
    // Obter a sessão da loja
    const session = await prisma.session.findFirst({
      where: { shopDomain: shop },
      orderBy: { expires: 'desc' },
    });

    if (!session) {
      throw new Error(`Nenhuma sessão encontrada para a loja: ${shop}`);
    }

    // Criar cliente GraphQL
    const client = new shopify.clients.Graphql({
      session: {
        shop: session.shopDomain,
        accessToken: session.accessToken,
      },
    });

    // Executar a consulta
    const response = await client.query({
      data: {
        query,
        variables: JSON.stringify(variables),
      },
    });

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      console.error('Erro na consulta GraphQL:', result.errors);
      return { errors: result.errors };
    }

    return { data: result.data };
  } catch (error) {
    console.error('Erro ao executar consulta GraphQL:', error);
    return { errors: [error] };
  }
}

// Consultas GraphQL comuns
export const PRODUCTS_QUERY = `
  query getProducts($first: Int = 10, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          featuredImage {
            url
          }
          variants(first: 1) {
            edges {
              node {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// Funções auxiliares para consultas comuns
export async function getProducts(shop: string, options: { first?: number; query?: string } = {}) {
  const { data, errors } = await shopifyGraphQLQuery<{
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          description: string;
          featuredImage: { url: string } | null;
          variants: {
            edges: Array<{
              node: {
                price: { amount: string; currencyCode: string };
              };
            }>;
          };
        };
      }>;
    };
  }>(shop, PRODUCTS_QUERY, {
    first: options.first || 10,
    query: options.query || '',
  });

  if (errors) {
    throw new Error('Falha ao buscar produtos');
  }

  return data?.products.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    description: edge.node.description,
    image: edge.node.featuredImage?.url || null,
    price: edge.node.variants.edges[0]?.node.price || null,
  }));
}

export async function getProduct(shop: string, productId: string) {
  const { data, errors } = await shopifyGraphQLQuery<{
    product: {
      id: string;
      title: string;
      description: string;
      images: {
        edges: Array<{
          node: { url: string };
        }>;
      };
      variants: {
        edges: Array<{
          node: {
            price: { amount: string; currencyCode: string };
          };
        }>;
      };
    };
  }>(shop, PRODUCT_QUERY, { id: productId });

  if (errors || !data?.product) {
    throw new Error('Produto não encontrado');
  }

  return {
    id: data.product.id,
    title: data.product.title,
    description: data.product.description,
    image: data.product.images.edges[0]?.node.url || null,
    price: data.product.variants.edges[0]?.node.price || null,
  };
}
