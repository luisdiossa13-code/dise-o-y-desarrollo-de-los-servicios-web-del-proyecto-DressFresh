# Servicio de Ofertas

Módulo de **descuentos y promociones**. Permite al administrador crear ofertas
globales, por categoría o por producto, con vigencias por fechas. El front las usa
en la sección **Ofertas** y para resaltar precios rebajados en el catálogo.

**Ruta base:** `/api/offers`

---

## 1. Listar ofertas vigentes — `GET /offers` (público)

Devuelve solo ofertas **activas** y dentro de su rango de fechas. Cada una incluye
`activeNow` (calculado en el momento) para que el front sepa si aplica.

```json
{
  "success": true,
  "data": [
    { "id": "off-...", "title": "Liquidación Jeans", "discountPercent": 30, "scopeType": "category", "scopeValue": "pantalones", "startsAt": "...", "endsAt": "...", "active": true, "activeNow": true }
  ]
}
```

---

## 2. Todas las ofertas — `GET /offers/admin-offers` 🔒admin

Incluye ofertas programadas, vencidas o inactivas (gestión del panel).

---

## 3. Calcular descuentos — `POST /offers/calculate`

Simula el precio final de varios productos aplicando la mejor oferta vigente. Útil
para que el carrito/front muestre el descuento antes de confirmar.

**Cuerpo:** `{ "productIds": ["prd-...", "prd-..."] }`

**Respuesta:** por cada producto → `originalPrice`, `discountPercent`, `finalPrice`.

---

## 4. Crear oferta — `POST /offers` 🔒admin

**Cuerpo:**
```json
{
  "title": "Cyber Day 2026",
  "description": "20% en toda la tienda",
  "discountPercent": 20,
  "scopeType": "global",
  "startsAt": "2026-06-01T00:00:00.000Z",
  "endsAt": "2026-06-30T23:59:59.000Z",
  "active": true
}
```

- `scopeType`: `global` (toda la tienda), `category` (por categoría), `product` (por producto).
- Para `category`/`product`, `scopeValue` es el ID de la categoría o producto.
- `discountPercent`: entero entre 1 y 100.
- Las fechas son opcionales (sin fechas = vigente siempre).

---

## 5. Actualizar oferta — `PATCH /offers/:id` 🔒admin

**Cuerpo (parcial):** cualquiera de los campos.

---

## 6. Eliminar oferta — `DELETE /offers/:id` 🔒admin

---

## Alcance de las ofertas

| scopeType | scopeValue | Aplica a |
|-----------|------------|----------|
| `global` | — | Todos los productos |
| `category` | ID de categoría | Productos de esa categoría |
| `product` | ID de producto | Ese producto únicamente |

Cuando un producto coincide con varias ofertas, se aplica automáticamente **la de
mayor porcentaje**.