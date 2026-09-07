# Resumen de servicios de la API

La API de la tienda de ropa expone un total de los siguientes servicios (REST).
Todos devuelven respuestas en **JSON** con la forma:

```json
{ "success": true, "data": { ... } }
```

Y los errores como:

```json
{ "success": false, "message": "Descripción del error" }
```

## Listado de servicios

| # | Método | Ruta | Descripción | Acceso |
|---|--------|------|-------------|--------|
| 1 | GET | `/api/health` | Estado de la API | público |
| 2 | POST | `/api/auth/register` | Registrar cliente | público |
| 3 | POST | `/api/auth/login` | Iniciar sesión | público |
| 4 | GET | `/api/auth/me` | Perfil autenticado | usuario |
| 5 | GET | `/api/users` | Listar usuarios | admin |
| 6 | POST | `/api/users` | Crear usuario | admin |
| 7 | GET | `/api/users/:id` | Obtener usuario | admin |
| 8 | PATCH | `/api/users/:id` | Actualizar usuario | admin |
| 9 | DELETE | `/api/users/:id` | Eliminar usuario | admin |
| 10 | GET | `/api/users/:id/orders` | Pedidos de un usuario | admin |
| 11 | PATCH | `/api/users/:id/role` | Cambiar rol | admin |
| 12 | PATCH | `/api/users/:id/password` | Restablecer contraseña | admin |
| 13 | GET | `/api/categories` | Listar categorías | público |
| 14 | POST | `/api/categories` | Crear categoría | admin |
| 15 | GET | `/api/categories/:id` | Obtener categoría | público |
| 16 | PATCH | `/api/categories/:id` | Actualizar categoría | admin |
| 17 | DELETE | `/api/categories/:id` | Eliminar categoría | admin |
| 18 | GET | `/api/products` | Listar productos | público |
| 19 | POST | `/api/products` | Crear producto | admin |
| 20 | GET | `/api/products/all/admin` | Todos los productos | admin |
| 21 | GET | `/api/products/brands` | Listar marcas | público |
| 22 | GET | `/api/products/slug/:slug` | Producto por slug | público |
| 23 | GET | `/api/products/:id` | Obtener producto | público |
| 24 | PATCH | `/api/products/:id` | Actualizar producto | admin |
| 25 | DELETE | `/api/products/:id` | Eliminar producto | admin |
| 26 | GET | `/api/products/related/:id` | Productos relacionados | público |
| 27 | GET | `/api/offers` | Listar ofertas vigentes | público |
| 28 | POST | `/api/offers` | Crear oferta | admin |
| 29 | GET | `/api/offers/admin-offers` | Todas las ofertas | admin |
| 30 | POST | `/api/offers/calculate` | Calcular descuentos | público |
| 31 | GET | `/api/offers/:id` | Obtener oferta | público |
| 32 | PATCH | `/api/offers/:id` | Actualizar oferta | admin |
| 33 | DELETE | `/api/offers/:id` | Eliminar oferta | admin |
| 34 | GET | `/api/cart` | Ver carrito | usuario |
| 35 | POST | `/api/cart/items` | Agregar al carrito | usuario |
| 36 | PATCH | `/api/cart/items/:productId` | Actualizar cantidad | usuario |
| 37 | DELETE | `/api/cart/items/:productId` | Quitar del carrito | usuario |
| 38 | DELETE | `/api/cart` | Vaciar carrito | usuario |
| 39 | POST | `/api/orders` | Crear pedido (checkout) | usuario |
| 40 | GET | `/api/orders` | Listar mis pedidos | usuario |
| 41 | GET | `/api/orders/admin-orders` | Listar todos los pedidos | admin |
| 42 | GET | `/api/orders/:id` | Obtener pedido | usuario/admin |
| 43 | PATCH | `/api/orders/:id/status` | Actualizar estado | admin |
| 44 | GET | `/api/payments/methods` | Métodos de pago | público |
| 45 | POST | `/api/payments` | Procesar pago | usuario |
| 46 | GET | `/api/payments` | Listar mis pagos | usuario |
| 47 | GET | `/api/payments/admin-payments` | Todos los pagos | admin |
| 48 | GET | `/api/payments/:id` | Obtener pago | usuario/admin |
| 49 | POST | `/api/payments/:id/confirm` | Confirmar pago | admin |
| 50 | POST | `/api/payments/:id/refund` | Reembolsar pago | admin |
| 51 | POST | `/api/pqrsf` | Crear PQRSF | usuario |
| 52 | GET | `/api/pqrsf` | Mis solicitudes | usuario |
| 53 | GET | `/api/pqrsf/admin-pqrsf` | Todas las solicitudes | admin |
| 54 | GET | `/api/pqrsf/radicado/:radicado` | Consultar por radicado | usuario/admin |
| 55 | GET | `/api/pqrsf/:id` | Obtener solicitud | usuario/admin |
| 56 | PATCH | `/api/pqrsf/:id/respond` | Responder solicitud | admin |
| 57 | PATCH | `/api/pqrsf/:id/estado` | Cambiar estado | admin |
| 58 | GET | `/api/config` | Configuración pública | público |
| 59 | GET | `/api/config/full` | Configuración completa | admin |
| 60 | PUT | `/api/config/admin` | Actualizar configuración | admin |
| 61 | POST | `/api/config/social` | Agregar red social | admin |
| 62 | PATCH | `/api/config/social/:socialId` | Actualizar red social | admin |
| 63 | DELETE | `/api/config/social/:socialId` | Eliminar red social | admin |
| 64 | POST | `/api/config/banners` | Agregar banner | admin |
| 65 | DELETE | `/api/config/banners/:bannerId` | Eliminar banner | admin |
| 66 | GET | `/api/dashboard/stats` | Estadísticas del panel | admin |

## Paquetes de pruebas listos para usar (Postman / Thunder Client)

Importa la colección **`docs/tienda-ropa-api.postman_collection.json`** para tener
todos los servicios preconfigurados. Contiene variables de entorno para:

- `host` → `http://localhost:3000/api`
- `tokenCliente` → se obtiene automáticamente en el paso "Login Cliente"
- `tokenAdmin` → se obtiene automáticamente en el paso "Login Admin"
- `productoId`, `carritoId`, `pedidoId`, `pagoId`, `pqrsfId` → se autoasignan en cadena

> Nota: si tu API corre en el puerto 3001, cambia la variable `host` en Postman
> a `http://localhost:3001/api`.