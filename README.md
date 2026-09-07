# API Tienda de Ropa - Moda Trends

API REST para una **tienda de ropa en línea** con los módulos de: administración,
inicio de sesión, carrito de compras, ofertas, métodos de pago integrados, botón
PQRSF, barra de redes sociales y demás servicios necesarios para una página web
responsiva.

**Proyecto Formativo AA5 - Construcción de APIs · Evidencia EV03.**
**Autor:** Luis Diossa

---

## 1. Características del software

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Registro, inicio de sesión (JWT) y perfil del usuario |
| **Usuarios** | CRUD de clientes y administradores, roles, estado y restablecer contraseña |
| **Categorías** | Catálogo de categorías de ropa |
| **Productos** | CRUD de productos, búsqueda, filtros, ordenamiento y stock |
| **Ofertas** | Descuentos globales, por categoría o por producto (vigencia por fechas) |
| **Carrito** | Agregar, actualizar y quitar ítems con precios con descuento y envío |
| **Pedidos** | Checkout desde el carrito, máquina de estados del pedido |
| **Pagos** | Pasarela de pago simulada: tarjeta, PSE, Nequi, PayPal y contra entrega |
| **PQRSF** | Peticiones, quejas, reclamos, sugerencias y felicitaciones con radicado |
| **Configuración** | Datos de la tienda, barra de redes sociales y banners |
| **Dashboard** | Estadísticas para el panel del administrador |

---

## 2. Requisitos

- **Node.js** versión 18 o superior (recomendado 20+).
- **Git** para el control de versiones.

---

## 3. Instalación y puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Configurar variables de entorno
#    Copiar .env.example a .env y ajustar si es necesario.

# 3. Sembrar los datos de demostración
npm run seed
#    O para restablecer todos los datos:
npm run reset

# 4. Iniciar la API
npm start
#    modo desarrollo (reinicio automático):
npm run dev
```

---

## 4. Usuarios de demostración

| Rol | Correo | Contraseña | Permisos |
|-----|--------|------------|----------|
| Administrador | `admin@modatrends.com` | `Admin123456` | Todos los módulos administrativos |
| Cliente | `cliente@modatrends.com` | `Cliente123456` | Compra, carrito, pedidos y PQRSF |

---

## 5. Documentación de la API (Swagger / OpenAPI)

La API incluye documentación interactiva generada con **Swagger UI** en:

```
http://localhost:3000/api-docs
```

En esa interfaz puedes **probar cada servicio** directamente (autenticando con el
botón *Authorize* usando un token obtenido en `POST /api/auth/login`).

También dispones de una **documentación detallada por servicio** en la carpeta [`docs/`](docs/):

- [Resumen de servicios y paquetes de pruebas](docs/SERVICIOS.md)
- [Autenticación](docs/01-autenticacion.md)
- [Usuarios](docs/02-usuarios.md)
- [Categorías](docs/03-categorias.md)
- [Productos](docs/04-productos.md)
- [Ofertas](docs/05-ofertas.md)
- [Carrito de compras](docs/06-carrito.md)
- [Pedidos](docs/07-pedidos.md)
- [Métodos de pago](docs/08-pagos.md)
- [PQRSF](docs/09-pqrsf.md)
- [Configuración y redes sociales](docs/10-configuracion.md)
- [Dashboard del administrador](docs/11-dashboard.md)

---

## 6. Endpoints principales

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/health` | Estado de la API | pública |
| POST | `/api/auth/register` | Registrar cliente | pública |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | pública |
| GET | `/api/auth/me` | Perfil del usuario | 🔒 usuario |
| GET | `/api/products` | Listar productos con ofertas | pública |
| GET | `/api/products/:id` | Obtener producto | pública |
| POST | `/api/cart/items` | Agregar al carrito | 🔒 usuario |
| POST | `/api/orders` | Crear pedido (checkout) | 🔒 usuario |
| POST | `/api/payments` | Procesar pago | 🔒 usuario |
| POST | `/api/pqrsf` | Crear solicitud PQRSF | 🔒 usuario |
| GET | `/api/config` | Datos de tienda, redes sociales y banners | pública |
| GET | `/api/dashboard/stats` | Estadísticas | 🔒 admin |

---

## 7. Estructura del proyecto

```
tienda-ropa-api/
├── .env.example           # Plantilla de variables de entorno
├── package.json
├── README.md
├── docs/                  # Documentación detallada de cada servicio
└── src/
    ├── server.js          # Punto de entrada
    ├── app.js             # Configuración de Express y montaje de rutas
    ├── swagger.js         # Documentación OpenAPI (Swagger UI)
    ├── swaggerPaths.js    # Definición de endpoints OpenAPI
    ├── config/env.js      # Variables de entorno
    ├── db/
    │   ├── Database.js    # Persistencia en archivos JSON
    │   └── seed.js        # Datos de demostración
    ├── data/              # Archivos JSON (base de datos)
    ├── middleware/        # Auth, validación, errores, async
    ├── services/pricing.js# Cálculo de precios y ofertas
    ├── controllers/       # Lógica de negocio de cada módulo
    └── routes/            # Definición de rutas y validaciones
```

---

## 8. Notas sobre la pasarela de pago

Los pagos se procesan a través de **una pasarela simulada**. Para aprobar un pago
con tarjeta usa un número que **inicie en 4** (ej. `4111111111111111`). En
producción, `simulateGateway()` en
`src/controllers/paymentsController.js` debe reemplazarse por la llamada real a la
pasarela contratada (Stripe, PayU, Wompi, etc.) usando `PAYMENT_GATEWAY_KEY`.

---

## 9. Control de versiones

Este proyecto se versiona con **Git**. Rama principal: `main`.