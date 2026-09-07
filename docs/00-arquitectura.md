# Arquitectura de la API Tienda de Ropa

## 1. Patrón de arquitectura de software

La API se desarrolla siguiendo el patrón **MVC (Modelo-Vista-Controlador)** en su
vertiente REST/API, con una **arquitectura en capas**:

```
┌─────────────────────────────────────────────────────────────┐
│                 Capa de Presentación (Web/App)               │
│      Front responsivo (React, Vue, HTML/CSS/JS, etc.)        │
└───────────────▲──────────────────────────▲───────────────────┘
                │ HTTP / JSON (REST)        │ JWT bearer
┌───────────────┴──────────────────────────┴───────────────────┐
│               Capa de Rutas (Routes)                         │
│   Define endpoints, validación (express-validator) y auth    │
└───────────────▲──────────────────────────────────────────────┘
└───────────────┴──────────────────────────────────────────────┐
│               Capa de Controladores (Controllers)            │
│   Lógica de negocio de cada módulo (auth, cart, orders...)   │
├───────────────┬──────────────────────────────────────────────┤
│        Servicios (services/pricing.js)                       │
│        Cálculo de precios y ofertas                          │
├───────────────┴──────────────────────────────────────────────┤
│               Capa de Datos (Database)                       │
│   Persistencia en archivos JSON (src/data/*.json)            │
└──────────────────────────────────────────────────────────────┘
```

- **Rutas** definen el contrato público y las validaciones.
- **Controladores** contienen la lógica de negocio.
- **Servicios** encapsulan reglas transversales (precios/ofertas).
- **Base de datos JSON** garantiza persistencia sin requerir un servidor de BD.

## 2. Base de datos (persistencia)

Las colecciones se guardan en archivos JSON dentro de `src/data/`:

| Archivo | Colección | Contenido |
|---------|-----------|-----------|
| `users.json` | users | Clientes y administradores |
| `categories.json` | categories | Categorías de ropa |
| `products.json` | products | Catálogo de productos |
| `offers.json` | offers | Descuentos y promociones |
| `carts.json` | carts | Carritos por usuario |
| `orders.json` | orders | Pedidos |
| `payments.json` | payments | Pagos y transacciones |
| `pqrsf.json` | pqrsf | Solicitudes PQRSF |
| `config.json` | config | Configuración, redes y banners |

La clase `Collection` del módulo `src/db/Database.js` ofrece operaciones CRUD
(`find`, `findById`, `create`, `update`, `remove`, ...) que abstraen la lectura y
escritura de los archivos.

## 3. Seguridad

- **Autenticación JWT:** el login devuelve un token que se envía como
  `Authorization: Bearer <token>` para acceder a rutas protegidas.
- **Autorización por roles:** middleware `requireAdmin` restringe el panel de
  administración.
- **Contraseñas cifradas:** se almacenan con **bcrypt**.
- **Validación de entradas** con `express-validator` para prevenir datos malformados.

## 4. Flujo de una compra típica

```
Cliente                          API
   │  login (JWT)                  │
   ├──────────────────────────────►│  POST /auth/login
   │  ver productos                │
   ├──────────────────────────────►│  GET /products
   │  agregar al carrito           │
   ├──────────────────────────────►│  POST /cart/items
   │  ver carrito                  │
   ├──────────────────────────────►│  GET /cart
   │  check out                    │
   ├──────────────────────────────►│  POST /orders  (descuenta stock)
   │  pagar (pasarela)             │
   ├──────────────────────────────►│  POST /payments (aprueba/rechaza)
   │  confirmación                 │
   ◄───────────────────────────────┤  estado pedido → 'pagado'
```

## 5. Organización de carpetas

```
src/
├── server.js            # Punto de entrada (arranca el servidor)
├── app.js               # Aplicación Express y montaje de rutas
├── swagger.js           # Especificación OpenAPI
├── swaggerPaths.js      # Endpoints OpenAPI
├── config/env.js        # Variables de entorno
├── db/
│   ├── Database.js      # Persistencia JSON
│   └── seed.js          # Datos de demostración
├── data/                # Archivos JSON (BD)
├── services/pricing.js  # Reglas de precios y ofertas
├── middleware/          # Auth, validación, errores, async
├── controllers/         # Lógica de negocio por módulo
└── routes/              # Endpoints + validaciones por módulo
```