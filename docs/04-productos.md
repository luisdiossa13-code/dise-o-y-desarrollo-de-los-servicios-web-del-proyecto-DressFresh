# Servicio de Productos

Módulo principal del **catálogo** de la tienda. Permite listar, buscar, filtrar y
ordenar productos, gestionar stock y administrar el CRUD completo. Cada producto
devuelto incluye su **precio con el descuento de la mejor oferta vigente aplicada**.

**Ruta base:** `/api/products`

---

## 1. Listar productos — `GET /products` (público)

Solo devuelve productos **activos**. Cada producto trae `priceWithOffer`,
`discountPercent` y `offerTitle` calculados al momento.

**Parámetros (query):**

| Parámetro | Descripción |
|-----------|-------------|
| `q` | Busca en nombre, descripción y marca |
| `categoryId` | Filtra por categoría |
| `brand` | Filtra por marca |
| `minPrice` / `maxPrice` | Filtra por precio **final** (con oferta) |
| `sizes` | Talles separados por coma, ej. `M,L` |
| `colors` | Colores separados por coma |
| `sort` | `priceAsc`, `priceDesc`, `newest`, `name` |
| `page` / `limit` | Paginación (default 12) |

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    { "id": "prd-...", "name": "Camiseta Básica Algodón", "price": 49900, "priceWithOffer": 39920, "discountPercent": 20, "offerTitle": "Semana de la Moda - 20% OFF", "stock": 50, "sizes": ["S","M","L","XL"], "colors": ["Blanco","Negro","Gris"], "categoryId": "cat-...", "images": ["..."], "rating": 4.5, "active": true }
  ],
  "meta": { "page": 1, "limit": 12, "total": 8, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

---

## 2. Todos los productos — `GET /products/all/admin` 🔒admin

Lista también productos **inactivos o agotados** para gestión del panel.

---

## 3. Listar marcas — `GET /products/brands`

Devuelve las marcas únicas del catálogo (para un filtro dropdown).

---

## 4. Producto por ID — `GET /products/:id`

Devuelve un producto con precios calculados.

---

## 5. Producto por slug — `GET /products/slug/:slug`

Útil para URLs amigables (`/producto/camiseta-basica-algodon`).

---

## 6. Productos relacionados — `GET /products/related/:id`

Hasta 4 productos de la misma categoría (para el bloque "También te puede gustar").

---

## 7. Crear producto — `POST /products` 🔒admin

**Cuerpo:**
```json
{
  "name": "Camisa Formal Azul",
  "price": 89900,
  "oldPrice": 105000,
  "stock": 30,
  "sizes": ["S","M","L"],
  "colors": ["Azul"],
  "categoryId": "cat-...",
  "images": ["https://..."],
  "brand": "Elegante",
  "active": true
}
```

---

## 8. Actualizar producto — `PATCH /products/:id` 🔒admin

**Cuerpo (parcial):** cualquiera de los campos anteriores. `oldPrice: null` quita el precio anterior.

---

## 9. Eliminar producto — `DELETE /products/:id` 🔒admin

---

### Precio con oferta
El cálculo se resuelve en `src/services/pricing.js`: para cada producto se buscan
las **ofertas vigentes** (global, de su categoría o específica del producto) y se
aplica el mayor descuento. El campo `priceWithOffer` es el que el front debe
mostrar/cobrar.