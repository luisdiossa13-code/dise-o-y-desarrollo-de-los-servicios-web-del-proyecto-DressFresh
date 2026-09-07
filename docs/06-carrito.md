# Servicio de Carrito de Compras

Módulo del **carrito** del cliente. Almacena los ítems por usuario, aplica ofertas
en cada línea y calcula subtotal, descuento total, envío y total general. El carrito
es **persistente por usuario** autenticado.

**Ruta base:** `/api/cart` · 🔒 Requiere sesión (rol cliente o admin).

> El carrito pertenece al usuario del token: el cliente siempre trabaja sobre su
> propio carrito, de forma segura.

---

## 1. Ver mi carrito — `GET /cart`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "productId": "prd-...", "name": "Camiseta Básica Algodón", "image": "...", "brand": "Moda Trends", "size": "M", "color": "Negro", "quantity": 2, "unitPrice": 39920, "originalPrice": 49900, "discountPercent": 20, "subtotal": 79840 }
    ],
    "itemsCount": 2,
    "subtotal": 79840,
    "discountTotal": 19960,
    "shipping": 12000,
    "total": 91840
  }
}
```

- `unitPrice` ya incluye la oferta vigente.
- `shipping` es `0` si el subtotal es `0` o supera el **umbral de envío gratis** ($200.000 por defecto).

---

## 2. Agregar producto — `POST /cart/items`

**Cuerpo:**
```json
{ "productId": "prd-...", "quantity": 2, "size": "M", "color": "Negro" }
```
- Si el mismo producto + talla + color ya existe, se **incrementa** la cantidad.
- Valida stock disponible (`400` si se excede).
- Devuelve el resumen completo del carrito.

---

## 3. Actualizar cantidad — `PATCH /cart/items/:productId`

**Cuerpo:** `{ "quantity": 1 }`
- `quantity: 0` **elimina** el ítem del carrito.
- Valida stock.

---

## 4. Quitar producto — `DELETE /cart/items/:productId`

Elimina el ítem indicado.

---

## 5. Vaciar carrito — `DELETE /cart`

Elimina todos los ítems del carrito.

---

### Flujo de compra (front)

1. El cliente ve la vista de producto y presiona "Agregar al carrito" → `POST /cart/items`.
2. El contador del carrito se actualiza con `itemsCount`.
3. En la vista de carrito consulta `GET /cart` para mostrar líneas y totales.
4. Al finalizar presiona "Finalizar compra" → `POST /orders` (checkout), que toma los ítems del carrito y lo vacía.