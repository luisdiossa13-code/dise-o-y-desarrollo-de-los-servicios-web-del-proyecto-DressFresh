/**
 * Rutas (paths) de la especificación OpenAPI de la API.
 * Cada operación documenta su servicio: parámetros, cuerpo y respuestas.
 */
module.exports = {
  '/health': {
    get: {
      tags: ['Salud'],
      summary: 'Estado de la API',
      description: 'Verifica que el servicio esté en línea.',
      responses: {
        200: {
          description: 'API disponible',
          content: { 'application/json': { example: { success: true, service: 'tienda-ropa-api', status: 'ok' } } }
        }
      }
    }
  },

  // ============================ AUTENTICACIÓN ============================
  '/auth/register': {
    post: {
      tags: ['Autenticación'],
      summary: 'Registrar un cliente',
      description: 'Crea una cuenta de cliente y devuelve el token JWT para iniciar sesión automáticamente.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', example: 'María Pérez' },
                email: { type: 'string', format: 'email', example: 'maria@correo.com' },
                password: { type: 'string', format: 'password', minLength: 6, example: 'Secreto123' },
                phone: { type: 'string', example: '+57 310 000 0000' },
                address: { type: 'string', example: 'Calle 5 # 10-20' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Cuenta creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { $ref: '#/components/responses/Validation' },
        409: { description: 'El correo ya está registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Iniciar sesión',
      description: 'Autentica al usuario y devuelve el token JWT. Contraseña demo: cliente@modatrends.com / Cliente123456',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }
      },
      responses: {
        200: { description: 'Inicio de sesión exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Cuenta inactiva', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/me': {
    get: {
      tags: ['Autenticación'],
      summary: 'Perfil del usuario autenticado',
      description: 'Devuelve la información de la sesión actual.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Perfil del usuario', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },

  // ============================ USUARIOS ============================
  '/users': {
    get: {
      tags: ['Usuarios'],
      summary: 'Listar usuarios (admin)',
      description: 'Lista paginada de usuarios con búsqueda y filtro por rol.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Busca por nombre o correo' },
        { in: 'query', name: 'role', schema: { type: 'string', enum: ['admin', 'cliente'] }, description: 'Filtra por rol' },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }
      ],
      responses: {
        200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/User' } }, meta: { $ref: '#/components/schemas/Meta' } } } } } },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      }
    },
    post: {
      tags: ['Usuarios'],
      summary: 'Crear usuario (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
                role: { type: 'string', enum: ['admin', 'cliente'], default: 'cliente' },
                phone: { type: 'string' },
                address: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Usuario creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        400: { $ref: '#/components/responses/Validation' },
        401: { $ref: '#/components/responses/Unauthorized' },
        409: { description: 'Correo ya registrado' }
      }
    }
  },
  '/users/{id}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Datos del usuario', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    patch: {
      tags: ['Usuarios'],
      summary: 'Actualizar datos de usuario (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                address: { type: 'string' },
                active: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Usuarios'],
      summary: 'Eliminar usuario (admin)',
      description: 'No permite eliminar la propia cuenta.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Usuario eliminado' },
        400: { description: 'No puedes eliminar tu propia cuenta' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/users/{id}/orders': {
    get: {
      tags: ['Usuarios'],
      summary: 'Listar pedidos de un usuario (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Pedidos del usuario', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/users/{id}/role': {
    patch: {
      tags: ['Usuarios'],
      summary: 'Cambiar rol de usuario (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['admin', 'cliente'] } } } }
        }
      },
      responses: {
        200: { description: 'Rol actualizado' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/users/{id}/password': {
    patch: {
      tags: ['Usuarios'],
      summary: 'Restablecer contraseña (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object', required: ['password'], properties: { password: { type: 'string', minLength: 6 } } } }
        }
      },
      responses: {
        200: { description: 'Contraseña restablecida' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ CATEGORÍAS ============================
  '/categories': {
    get: {
      tags: ['Categorías'],
      summary: 'Listar categorías',
      description: 'Catálogo de categorías. Usa ?withCount=true para incluir el número de productos.',
      parameters: [{ in: 'query', name: 'withCount', schema: { type: 'boolean' }, description: 'Incluir cantidad de productos' }],
      responses: {
        200: { description: 'Lista de categorías', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } }
      }
    },
    post: {
      tags: ['Categorías'],
      summary: 'Crear categoría (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Camisas' },
                slug: { type: 'string', example: 'camisas' },
                description: { type: 'string' },
                image: { type: 'string' },
                active: { type: 'boolean', default: true }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Categoría creada' },
        401: { $ref: '#/components/responses/Unauthorized' },
        409: { description: 'Slug duplicado' }
      }
    }
  },
  '/categories/{id}': {
    get: {
      tags: ['Categorías'],
      summary: 'Obtener categoría',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Categoría', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Category' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    patch: {
      tags: ['Categorías'],
      summary: 'Actualizar categoría (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string' },
                image: { type: 'string' },
                active: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Categoría actualizada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Categorías'],
      summary: 'Eliminar categoría (admin)',
      description: 'No permite eliminar categorías con productos asociados.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Categoría eliminada' },
        409: { description: 'Categoría en uso' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ PRODUCTOS ============================
  '/products': {
    get: {
      tags: ['Productos'],
      summary: 'Listar productos del catálogo',
      description: 'Solo devuelve productos activos con precios calculados tras aplicar ofertas vigentes.',
      parameters: [
        { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Texto a buscar en nombre, descripción o marca' },
        { in: 'query', name: 'categoryId', schema: { type: 'string' }, description: 'Filtra por categoría' },
        { in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Filtra por marca' },
        { in: 'query', name: 'minPrice', schema: { type: 'number' }, description: 'Precio final mínimo' },
        { in: 'query', name: 'maxPrice', schema: { type: 'number' }, description: 'Precio final máximo' },
        { in: 'query', name: 'sizes', schema: { type: 'string' }, description: 'Talles separados por coma, ej. M,L' },
        { in: 'query', name: 'colors', schema: { type: 'string' }, description: 'Colores separados por coma' },
        { in: 'query', name: 'sort', schema: { type: 'string', enum: ['priceAsc', 'priceDesc', 'newest', 'name'] }, description: 'Ordenamiento' },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } }
      ],
      responses: {
        200: { description: 'Lista paginada de productos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Product' } }, meta: { $ref: '#/components/schemas/Meta' } } } } } }
      }
    },
    post: {
      tags: ['Productos'],
      summary: 'Crear producto (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'price'],
              properties: {
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string' },
                brand: { type: 'string', default: 'Moda Trends' },
                price: { type: 'number' },
                oldPrice: { type: 'number', nullable: true },
                stock: { type: 'integer', default: 0 },
                sizes: { type: 'array', items: { type: 'string' } },
                colors: { type: 'array', items: { type: 'string' } },
                categoryId: { type: 'string', nullable: true },
                images: { type: 'array', items: { type: 'string' } },
                active: { type: 'boolean', default: true }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Producto creado' },
        400: { $ref: '#/components/responses/Validation' },
        401: { $ref: '#/components/responses/Unauthorized' },
        409: { description: 'Slug duplicado' }
      }
    }
  },
  '/products/all/admin': {
    get: {
      tags: ['Productos'],
      summary: 'Listar todos los productos (admin)',
      description: 'Incluye productos inactivos y agotados para su administración.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Todos los productos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } } }
      }
    }
  },
  '/products/brands': {
    get: {
      tags: ['Productos'],
      summary: 'Listar marcas disponibles',
      responses: { 200: { description: 'Marcas ordenadas alfabéticamente' } }
    }
  },
  '/products/related/{id}': {
    get: {
      tags: ['Productos'],
      summary: 'Productos relacionados',
      description: 'Hasta 4 productos de la misma categoría.',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Productos relacionados', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/products/slug/{slug}': {
    get: {
      tags: ['Productos'],
      summary: 'Obtener producto por slug',
      parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Producto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Product' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/products/{id}': {
    get: {
      tags: ['Productos'],
      summary: 'Obtener producto por ID',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Producto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Product' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    patch: {
      tags: ['Productos'],
      summary: 'Actualizar producto (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                brand: { type: 'string' },
                price: { type: 'number' },
                oldPrice: { type: 'number', nullable: true },
                stock: { type: 'integer' },
                sizes: { type: 'array', items: { type: 'string' } },
                colors: { type: 'array', items: { type: 'string' } },
                images: { type: 'array', items: { type: 'string' } },
                categoryId: { type: 'string', nullable: true },
                active: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Producto actualizado' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Productos'],
      summary: 'Eliminar producto (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Producto eliminado' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ OFERTAS ============================
  '/offers': {
    get: {
      tags: ['Ofertas'],
      summary: 'Listar ofertas vigentes',
      description: 'Solo devuelve ofertas activas dentro de su rango de fechas.',
      responses: {
        200: { description: 'Ofertas vigentes', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Offer' } } } } } } }
      }
    },
    post: {
      tags: ['Ofertas'],
      summary: 'Crear oferta (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'discountPercent'],
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                discountPercent: { type: 'integer', minimum: 1, maximum: 100 },
                scopeType: { type: 'string', enum: ['product', 'category', 'global'], default: 'global' },
                scopeValue: { type: 'string', description: 'ID del producto o categoría (según scopeType)' },
                startsAt: { type: 'string', format: 'date-time' },
                endsAt: { type: 'string', format: 'date-time' },
                active: { type: 'boolean', default: true }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Oferta creada' },
        400: { $ref: '#/components/responses/Validation' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/offers/admin-offers': {
    get: {
      tags: ['Ofertas'],
      summary: 'Listar todas las ofertas (admin)',
      description: 'Incluye ofertas programadas, vencidas o inactivas.',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Todas las ofertas' } }
    }
  },
  '/offers/calculate': {
    post: {
      tags: ['Ofertas'],
      summary: 'Calcular descuentos de productos',
      description: 'Simula el precio final de varios productos aplicando la mejor oferta vigente.',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object', required: ['productIds'], properties: { productIds: { type: 'array', items: { type: 'string' } } } } }
        }
      },
      responses: { 200: { description: 'Detalle de precios con descuento' } }
    }
  },
  '/offers/{id}': {
    get: {
      tags: ['Ofertas'],
      summary: 'Obtener oferta',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Oferta', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Offer' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    patch: {
      tags: ['Ofertas'],
      summary: 'Actualizar oferta (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, discountPercent: { type: 'integer', minimum: 1, maximum: 100 }, scopeType: { type: 'string', enum: ['product', 'category', 'global'] }, scopeValue: { type: 'string' }, startsAt: { type: 'string', format: 'date-time' }, endsAt: { type: 'string', format: 'date-time' }, active: { type: 'boolean' } } } } } },
      responses: {
        200: { description: 'Oferta actualizada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Ofertas'],
      summary: 'Eliminar oferta (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Oferta eliminada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ CARRITO ============================
  '/cart': {
    get: {
      tags: ['Carrito'],
      summary: 'Ver mi carrito',
      description: 'Resumen del carrito con precios actualizados (ofertas incluidas) y costo de envío.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Carrito con totales', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Cart' } } } } } },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    },
    delete: {
      tags: ['Carrito'],
      summary: 'Vaciar carrito',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Carrito vaciado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Cart' } } } } } },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/cart/items': {
    post: {
      tags: ['Carrito'],
      summary: 'Agregar producto al carrito',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId'],
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1, default: 1 },
                size: { type: 'string', example: 'M' },
                color: { type: 'string', example: 'Negro' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Producto agregado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Cart' } } } } } },
        400: { description: 'Stock insuficiente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Producto no encontrado' }
      }
    }
  },
  '/cart/items/{productId}': {
    patch: {
      tags: ['Carrito'],
      summary: 'Actualizar cantidad de un ítem',
      description: 'Usa quantity=0 para quitar el ítem.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 0 } } } } }
      },
      responses: {
        200: { description: 'Carrito actualizado' },
        400: { description: 'Stock insuficiente' },
        404: { description: 'Ítem no está en el carrito' }
      }
    },
    delete: {
      tags: ['Carrito'],
      summary: 'Quitar producto del carrito',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Producto eliminado del carrito' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },

  // ============================ PEDIDOS ============================
  '/orders': {
    post: {
      tags: ['Pedidos'],
      summary: 'Crear pedido (checkout del carrito)',
      description: 'Toma los ítems del carrito, valida stock, descuenta inventario y genera el pedido.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                shippingAddress: { type: 'string', example: 'Calle 15 # 20-30, Bogotá' },
                phone: { type: 'string' },
                note: { type: 'string', example: 'Entregar en horas de la tarde' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Pedido creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Order' } } } } } },
        400: { description: 'Carrito vacío o stock insuficiente' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    },
    get: {
      tags: ['Pedidos'],
      summary: 'Listar mis pedidos',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Pedidos del cliente', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/orders/admin-orders': {
    get: {
      tags: ['Pedidos'],
      summary: 'Listar todos los pedidos (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'status', schema: { type: 'string', enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'] }, description: 'Filtra por estado' },
        { in: 'query', name: 'userId', schema: { type: 'string' }, description: 'Filtra por usuario' },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }
      ],
      responses: {
        200: { description: 'Pedidos paginados', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Order' } }, meta: { $ref: '#/components/schemas/Meta' } } } } } }
      }
    }
  },
  '/orders/{id}': {
    get: {
      tags: ['Pedidos'],
      summary: 'Obtener pedido',
      description: 'El cliente solo puede ver sus propios pedidos; el admin puede ver todos.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Pedido', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Order' } } } } } },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/orders/{id}/status': {
    patch: {
      tags: ['Pedidos'],
      summary: 'Actualizar estado del pedido (admin)',
      description: 'Transiciones válidas: pendiente→pagado|cancelado, pagado→enviado|cancelado, enviado→entregado|cancelado.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'] } } } } }
      },
      responses: {
        200: { description: 'Estado actualizado' },
        400: { description: 'Transición no permitida' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ PAGOS ============================
  '/payments/methods': {
    get: {
      tags: ['Pagos'],
      summary: 'Listar métodos de pago disponibles',
      description: 'Tarjeta, PSE, Nequi, PayPal y contra entrega (integración simulada de pasarela).',
      responses: {
        200: { description: 'Métodos de pago', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/PaymentMethod' } } } } } } }
      }
    }
  },
  '/payments': {
    post: {
      tags: ['Pagos'],
      summary: 'Procesar pago de un pedido',
      description: 'Simula la pasarela. Para tarjeta usa un número que inicie en 4 (ej. 4111111111111111) para aprobar.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId', 'method'],
              properties: {
                orderId: { type: 'string' },
                method: { type: 'string', enum: ['tarjeta', 'pse', 'nequi', 'paypal', 'contraentrega'] },
                cardNumber: { type: 'string', example: '4111111111111111' },
                cardHolder: { type: 'string' },
                expiry: { type: 'string', example: '12/28' },
                cvc: { type: 'string' },
                bank: { type: 'string', example: 'Bancolombia' },
                phone: { type: 'string', example: '3001234567' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Pago procesado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Payment' } } } } } },
        400: { description: 'Datos de pago inválidos' },
        409: { description: 'El pedido ya tiene un pago' }
      }
    },
    get: {
      tags: ['Pagos'],
      summary: 'Listar mis pagos',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Pagos del cliente', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } } } } }
      }
    }
  },
  '/payments/admin-payments': {
    get: {
      tags: ['Pagos'],
      summary: 'Listar todos los pagos (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'status', schema: { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'reembolsado'] } },
        { in: 'query', name: 'method', schema: { type: 'string', enum: ['tarjeta', 'pse', 'nequi', 'paypal', 'contraentrega'] } },
        { in: 'query', name: 'userId', schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'Lista de pagos' } }
    }
  },
  '/payments/{id}': {
    get: {
      tags: ['Pagos'],
      summary: 'Obtener pago',
      description: 'El cliente solo ve sus pagos; el admin puede ver todos.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Pago', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Payment' } } } } } },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/payments/{id}/confirm': {
    post: {
      tags: ['Pagos'],
      summary: 'Confirmar pago pendiente (admin)',
      description: 'Utilizado para pagos contra entrega o aprobaciones manuales.',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Pago confirmado' },
        400: { description: 'Solo se confirman pagos pendientes' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/payments/{id}/refund': {
    post: {
      tags: ['Pagos'],
      summary: 'Reembolsar pago (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Reembolso procesado' },
        400: { description: 'Solo pagos aprobados' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ PQRSF ============================
  '/pqrsf': {
    post: {
      tags: ['PQRSF'],
      summary: 'Crear una solicitud PQRSF',
      description: 'Genera un número de radicado para dar seguimiento desde el front.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tipo', 'asunto', 'descripcion'],
              properties: {
                tipo: { type: 'string', enum: ['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'] },
                asunto: { type: 'string', example: 'Cambio de talla' },
                descripcion: { type: 'string', example: 'Recibí una talla equivocada en mi pedido...' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Solicitud creada con radicado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PQRSF' } } } } } },
        400: { $ref: '#/components/responses/Validation' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    },
    get: {
      tags: ['PQRSF'],
      summary: 'Listar mis solicitudes',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Solicitudes del cliente', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/PQRSF' } } } } } } }
      }
    }
  },
  '/pqrsf/admin-pqrsf': {
    get: {
      tags: ['PQRSF'],
      summary: 'Listar todas las solicitudes (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'estado', schema: { type: 'string', enum: ['recibida', 'en_proceso', 'resuelta'] } },
        { in: 'query', name: 'tipo', schema: { type: 'string', enum: ['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'] } },
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }
      ],
      responses: { 200: { description: 'Solicitudes paginadas' } }
    }
  },
  '/pqrsf/radicado/{radicado}': {
    get: {
      tags: ['PQRSF'],
      summary: 'Consultar solicitud por radicado',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'radicado', required: true, schema: { type: 'string', example: 'PQR-2026-000001' } }],
      responses: {
        200: { description: 'Solicitud' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/pqrsf/{id}': {
    get: {
      tags: ['PQRSF'],
      summary: 'Obtener solicitud',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Solicitud', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PQRSF' } } } } } },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/pqrsf/{id}/respond': {
    patch: {
      tags: ['PQRSF'],
      summary: 'Responder solicitud (admin)',
      description: 'Al responder, el estado de la solicitud pasa a "resuelta".',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['respuesta'], properties: { respuesta: { type: 'string', example: 'Estimado cliente, procedemos con el cambio de talla...' } } } } }
      },
      responses: {
        200: { description: 'Respuesta registrada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/pqrsf/{id}/estado': {
    patch: {
      tags: ['PQRSF'],
      summary: 'Cambiar estado de solicitud (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['estado'], properties: { estado: { type: 'string', enum: ['recibida', 'en_proceso', 'resuelta'] } } } } }
      },
      responses: {
        200: { description: 'Estado actualizado' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ CONFIGURACIÓN ============================
  '/config': {
    get: {
      tags: ['Configuración'],
      summary: 'Información pública de la tienda',
      description: 'Datos de la tienda, barra de redes sociales y banners (solo activos). El front la usa para el footer, header y barra social.',
      responses: {
        200: { description: 'Configuración pública' }
      }
    }
  },
  '/config/full': {
    get: {
      tags: ['Configuración'],
      summary: 'Configuración completa (admin)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Configuración completa' } }
    }
  },
  '/config/admin': {
    put: {
      tags: ['Configuración'],
      summary: 'Actualizar configuración de la tienda (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                storeName: { type: 'string' },
                slogan: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                whatsapp: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                announcement: { type: 'string' },
                socialNetworks: { type: 'array', items: { $ref: '#/components/schemas/SocialNetwork' } },
                banners: { type: 'array', items: { $ref: '#/components/schemas/Banner' } }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Configuración actualizada' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/config/social': {
    post: {
      tags: ['Configuración'],
      summary: 'Agregar red social (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'url'],
              properties: {
                name: { type: 'string', example: 'LinkedIn' },
                url: { type: 'string', example: 'https://linkedin.com/company/modatrends' },
                icon: { type: 'string', example: 'linkedin' },
                active: { type: 'boolean', default: true }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Red social agregada' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/config/social/{socialId}': {
    patch: {
      tags: ['Configuración'],
      summary: 'Actualizar red social (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'socialId', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                url: { type: 'string' },
                icon: { type: 'string' },
                active: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Red social actualizada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Configuración'],
      summary: 'Eliminar red social (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'socialId', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Red social eliminada' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/config/banners': {
    post: {
      tags: ['Configuración'],
      summary: 'Agregar banner (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'image'],
              properties: {
                title: { type: 'string' },
                subtitle: { type: 'string' },
                image: { type: 'string' },
                url: { type: 'string' },
                active: { type: 'boolean', default: true }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Banner agregado' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/config/banners/{bannerId}': {
    delete: {
      tags: ['Configuración'],
      summary: 'Eliminar banner (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ in: 'path', name: 'bannerId', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Banner eliminado' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ============================ DASHBOARD ============================
  '/dashboard/stats': {
    get: {
      tags: ['Dashboard'],
      summary: 'Estadísticas generales (admin)',
      description: 'Totales de usuarios, productos, pedidos, ventas, PQRSF, stock bajo y actividad reciente.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Estadísticas del panel' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  }
};