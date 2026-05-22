export const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "thejadeandbloom.myshopify.com";
export const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "";

const endpoint = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

async function shopifyFetch(query: string, variables: any = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }
  
  const json = await response.json();
  if (json.errors) {
    throw new Error(`Shopify API errors: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }
  
  return json.data;
}

export async function getProduct(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id title description
        variants(first: 1) {
          edges { node { id availableForSale priceV2 { amount currencyCode } } }
        }
        images(first: 1) {
          edges { node { url altText } }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { handle });
  return data.product;
}

export async function cartCreate() {
  const query = `
    mutation cartCreate {
      cartCreate(input: {}) {
        cart { id checkoutUrl }
      }
    }
  `;
  const data = await shopifyFetch(query);
  return data.cartCreate.cart;
}

export async function cartLinesAdd(cartId: string, variantId: string, quantity: number) {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id checkoutUrl
          lines(first: 20) {
            edges {
              node {
                id quantity
                merchandise { ... on ProductVariant { id title product { title } priceV2 { amount currencyCode } } }
              }
            }
          }
          cost { totalAmount { amount currencyCode } }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lines: [{ merchandiseId: variantId, quantity }] });
  return data.cartLinesAdd.cart;
}

export async function cartLinesRemove(cartId: string, lineIds: string[]) {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id checkoutUrl
          lines(first: 20) {
            edges {
              node {
                id quantity
                merchandise { ... on ProductVariant { id title product { title } priceV2 { amount currencyCode } } }
              }
            }
          }
          cost { totalAmount { amount currencyCode } }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id checkoutUrl
        lines(first: 20) {
          edges {
            node {
              id quantity
              merchandise { ... on ProductVariant { id title product { title } priceV2 { amount currencyCode } } }
            }
          }
        }
        cost { totalAmount { amount currencyCode } }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId });
  return data.cart;
}
