import { prisma } from '~/db.server';
import { getProducts, shopifyGraphQLQuery } from './graphql.server';

interface SyncProductsOptions {
  shop: string;
  batchSize?: number;
  maxProducts?: number;
}

export async function syncShopifyProducts({
  shop,
  batchSize = 10,
  maxProducts = 100,
}: SyncProductsOptions) {
  try {
    console.log(`Iniciando sincronização de produtos para a loja: ${shop}`);
    
    let hasNextPage = true;
    let cursor: string | null = null;
    let syncedCount = 0;
    
    while (hasNextPage && syncedCount < maxProducts) {
      const query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                description
                handle
                featuredImage {
                  url
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
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
      
      const variables = {
        first: Math.min(batchSize, maxProducts - syncedCount),
        after: cursor || null,
      };
      
      const { data, errors } = await shopifyGraphQLQuery<{
        products: {
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          edges: Array<{
            node: {
              id: string;
              title: string;
              description: string;
              handle: string;
              featuredImage: { url: string } | null;
              variants: {
                edges: Array<{
                  node: {
                    id: string;
                    price: { amount: string; currencyCode: string };
                  };
                }>;
              };
            };
          }>;
        };
      }>(shop, query, variables);
      
      if (errors) {
        throw new Error(`Erro ao buscar produtos: ${JSON.stringify(errors)}`);
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado da consulta de produtos');
      }
      
      // Processar produtos do lote atual
      const { products } = data;
      const productEdges = products.edges || [];
      
      for (const { node: product } of productEdges) {
        if (syncedCount >= maxProducts) break;
        
        try {
          await prisma.product.upsert({
            where: { shopifyId: product.id },
            update: {
              title: product.title,
              description: product.description || '',
              handle: product.handle,
              imageUrl: product.featuredImage?.url || null,
              price: product.variants.edges[0]?.node.price.amount || '0',
              currency: product.variants.edges[0]?.node.price.currencyCode || 'USD',
              updatedAt: new Date(),
            },
            create: {
              shopifyId: product.id,
              title: product.title,
              description: product.description || '',
              handle: product.handle,
              imageUrl: product.featuredImage?.url || null,
              price: product.variants.edges[0]?.node.price.amount || '0',
              currency: product.variants.edges[0]?.node.price.currencyCode || 'USD',
              shop: { connect: { shopify_domain: shop } },
            },
          });
          
          syncedCount++;
          console.log(`Produto sincronizado: ${product.title} (${syncedCount}/${maxProducts})`);
          
        } catch (error) {
          console.error(`Erro ao sincronizar produto ${product.id}:`, error);
          // Continuar com o próximo produto mesmo em caso de erro
        }
      }
      
      // Atualizar cursor e verificar se há mais páginas
      hasNextPage = products.pageInfo?.hasNextPage || false;
      cursor = products.pageInfo?.endCursor || null;
      
      if (!hasNextPage || !cursor) {
        break;
      }
    }
    
    console.log(`Sincronização concluída. Total de produtos sincronizados: ${syncedCount}`);
    return { success: true, syncedCount };
    
  } catch (error) {
    console.error('Erro durante a sincronização de produtos:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar produtos'
    };
  }
}

// Função para buscar um produto específico do Shopify e salvar/atualizar localmente
export async function syncSingleProduct(shop: string, productId: string) {
  try {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          handle
          featuredImage {
            url
          }
          variants(first: 1) {
            edges {
              node {
                id
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
    
    const { data, errors } = await shopifyGraphQLQuery<{
      product: {
        id: string;
        title: string;
        description: string;
        handle: string;
        featuredImage: { url: string } | null;
        variants: {
          edges: Array<{
            node: {
              id: string;
              price: { amount: string; currencyCode: string };
            };
          }>;
        };
      };
    }>(shop, query, { id: productId });
    
    if (errors || !data?.product) {
      throw new Error(errors ? JSON.stringify(errors) : 'Produto não encontrado');
    }
    
    const product = data.product;
    
    // Verificar se o modelo Product já existe no schema
    const productModel = prisma.product;
    
    if (!productModel) {
      throw new Error('Modelo de Produto não está disponível no Prisma');
    }
    
    // Salvar ou atualizar o produto no banco de dados
    const savedProduct = await productModel.upsert({
      where: { shopifyId: product.id },
      update: {
        title: product.title,
        description: product.description || '',
        handle: product.handle,
        imageUrl: product.featuredImage?.url || null,
        price: product.variants.edges[0]?.node.price.amount || '0',
        currency: product.variants.edges[0]?.node.price.currencyCode || 'USD',
        updatedAt: new Date(),
      },
      create: {
        shopifyId: product.id,
        title: product.title,
        description: product.description || '',
        handle: product.handle,
        imageUrl: product.featuredImage?.url || null,
        price: product.variants.edges[0]?.node.price.amount || '0',
        currency: product.variants.edges[0]?.node.price.currencyCode || 'USD',
        shop: { connect: { shopify_domain: shop } },
      },
    });
    
    console.log(`Produto sincronizado: ${savedProduct.title}`);
    return { success: true, product: savedProduct };
    
  } catch (error) {
    console.error(`Erro ao sincronizar o produto ${productId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar o produto'
    };
  }
}
