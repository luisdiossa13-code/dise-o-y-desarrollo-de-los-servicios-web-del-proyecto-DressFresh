require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'tienda-ropa-super-secreto-cambiar',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  apiPrefix: process.env.API_PREFIX || '/api',
  currency: process.env.CURRENCY || 'COP',
  paymentGateway: {
    name: process.env.PAYMENT_GATEWAY || 'simulador',
    key: process.env.PAYMENT_GATEWAY_KEY || ''
  },
  shippingCost: 12000,
  freeShippingThreshold: 200000
};