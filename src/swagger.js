/**
 * Documentación OpenAPI 3.0 de la API de Tienda de Ropa.
 * Se expone en Swagger UI en:  GET /api-docs
 */
const swaggerJSDoc = require('swagger-jsdoc');
const paths = require('./swaggerPaths');
const config = require('./config/env');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'API Tienda de Ropa - Moda Trends',
    version: '1.0.0',
    description: [
      'API REST de una tienda de ropa en línea con módulos de administración, autenticación,',
      'catálogo de productos, ofertas, carrito de compras, pedidos, métodos de pago integrados,',
      'PQRSF, redes sociales y estadísticas para el panel de administración.',
      '',
      '**Proyecto Formativo AA5 - Construcción de APIs**  ',
      '**Autor:** Luis Diossa'
    ].join('\n'),
    contact: { name: 'Moda Trends', email: 'contacto@modatrends.com' },
    license: { name: 'MIT' }
  },
  servers: [
    { url: `http://localhost:${config.port}${config.apiPrefix}`, description: 'Servidor local de desarrollo' }
  ],
  tags: [
    { name: 'Salud', description: 'Estado de la API' },
    { name: 'Autenticación', description: 'Registro, inicio de sesión y perfil' },
    { name: 'Usuarios', description: 'Administración de usuarios (admin)' },
    { name: 'Categorías', description: 'Catálogo de categorías' },
    { name: 'Productos', description: 'Catálogo de productos' },
    { name: 'Ofertas', description: 'Descuentos y promociones' },
    { name: 'Carrito', description: 'Carrito de compras del cliente' },
    { name: 'Pedidos', description: 'Órdenes de compra y su estado' },
    { name: 'Pagos', description: 'Métodos de pago y pasarela de pago' },
    { name: 'PQRSF', description: 'Peticiones, quejas, reclamos, sugerencias y felicitaciones' },
    { name: 'Configuración', description: 'Información de la tienda, redes sociales y banners' },
    { name: 'Dashboard', description: 'Estadísticas para el administrador' }
  ],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido al iniciar sesión. Formato: Authorization: Bearer <token>'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Mensaje de error' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: { field: { type: 'string' }, message: { type: 'string' } }
            }
          }
        }
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'cliente@modatrends.com' },
          password: { type: 'string', format: 'password', example: 'Cliente123456' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-...' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['admin', 'cliente'] },
          active: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'Token JWT' },
              user: { $ref: '#/components/schemas/User' }
            }
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          productsCount: { type: 'integer', description: 'Solo al usar ?withCount=true' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          brand: { type: 'string' },
          price: { type: 'number', example: 49900 },
          priceWithOffer: { type: 'number', description: 'Precio tras aplicar la mejor oferta activa' },
          discountPercent: { type: 'number', example: 20 },
          offerTitle: { type: 'string', nullable: true },
          stock: { type: 'integer' },
          sizes: { type: 'array', items: { type: 'string' } },
          colors: { type: 'array', items: { type: 'string' } },
          categoryId: { type: 'string', nullable: true },
          images: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number' },
          active: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Offer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          discountPercent: { type: 'number', example: 20 },
          scopeType: { type: 'string', enum: ['product', 'category', 'global'] },
          scopeValue: { type: 'string', nullable: true },
          startsAt: { type: 'string', format: 'date-time', nullable: true },
          endsAt: { type: 'string', format: 'date-time', nullable: true },
          active: { type: 'boolean' },
          activeNow: { type: 'boolean', description: 'true si la oferta está vigente en este momento' }
        }
      },
      CartItemLine: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          image: { type: 'string', nullable: true },
          brand: { type: 'string' },
          size: { type: 'string' },
          color: { type: 'string' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number', description: 'Precio con oferta aplicada' },
          originalPrice: { type: 'number' },
          discountPercent: { type: 'number' },
          subtotal: { type: 'number' }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItemLine' } },
          itemsCount: { type: 'integer' },
          subtotal: { type: 'number' },
          discountTotal: { type: 'number' },
          shipping: { type: 'number', description: '0 si supera el umbral de envío gratis' },
          total: { type: 'number' }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          image: { type: 'string', nullable: true },
          size: { type: 'string' },
          color: { type: 'string' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number', description: 'Precio congelado al momento de la compra' },
          originalPrice: { type: 'number' },
          discountPercent: { type: 'number' },
          subtotal: { type: 'number' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string', example: 'ORD-2026-000001' },
          userId: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'number' },
          discountTotal: { type: 'number' },
          shipping: { type: 'number' },
          total: { type: 'number' },
          status: { type: 'string', enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'] },
          paymentId: { type: 'string', nullable: true },
          shippingAddress: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          note: { type: 'string', nullable: true },
          payment: { type: 'object', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string', example: 'PAY-2026-000001' },
          orderId: { type: 'string' },
          userId: { type: 'string' },
          method: { type: 'string', enum: ['tarjeta', 'pse', 'nequi', 'paypal', 'contraentrega'] },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'reembolsado'] },
          transactionId: { type: 'string', nullable: true },
          gatewayResponse: { type: 'object' },
          order: { type: 'object', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PaymentMethod: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          requires: { type: 'array', items: { type: 'string' } }
        }
      },
      PQRSF: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          radicado: { type: 'string', example: 'PQR-2026-000001' },
          userId: { type: 'string' },
          tipo: { type: 'string', enum: ['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'] },
          asunto: { type: 'string' },
          descripcion: { type: 'string' },
          estado: { type: 'string', enum: ['recibida', 'en_proceso', 'resuelta'] },
          respuesta: { type: 'string', nullable: true },
          fechaRespuesta: { type: 'string', format: 'date-time', nullable: true },
          user: {
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Meta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
          hasNextPage: { type: 'boolean' },
          hasPrevPage: { type: 'boolean' }
        }
      }
    },
    responses: {
      Unauthorized: { description: 'Token ausente, inválido o expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      Forbidden: { description: 'Sin permisos de administrador', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      NotFound: { description: 'Recurso no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      Validation: { description: 'Error de validación', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
    }
  }
};

module.exports = swaggerJSDoc({ definition, apis: [] });