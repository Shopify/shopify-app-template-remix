export default {
name: 'app',
  scopes: 'read_products,write_products',
  gdpr: true,
  apiVersion: '2023-01',
  webhooks: {
    topics: ['PRODUCTS_CREATE'],
    topics: ['PRODUCTS_CREATE'],
  },
}
