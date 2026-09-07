# Servicio de Pedidos

Módulo del **checkout y gestión de pedidos**. Convierte el carrito en un pedido,
congela precios, descuenta stock y controla la **máquina de estados** desde la
creación hasta la entrega. Sustenta el histórico de compras del cliente y la
gestión del panel administrativo.

**Ruta base:** `/api/orders` · 🔒 Requiere sesión.

---

## 1. Crear pedido (checkout) — `POST /orders`

Toma los ítems del carrito actual del usuario:

1. Valida que el carrito **no esté vacío**.
2. Valida **stock** de cada producto.
3. Crea el pedido con un **número correlativo** (`ORD-2026-000001`) y congela los
   precios (con oferta) al momento de la compra.
4. **Descuenta el stock** de cada producto.
5. **Vacía el carrito** automáticamente.

**Cuerpo:**
```json
{ "shippingAddress": "Calle 15 # 20-30, Bogotá", "phone": "3001234567", "note": "Entregar en la tarde" }
```

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Pedido creado correctamente.",
  "data": { "id": "ord-...", "number": "ORD-2026-000001", "status": "pendiente", "items": [ ... ], "subtotal": 79840, "discountTotal": 19960, "shipping": 12000, "total": 91840, "payment": null }
}
```

**Errores:** `400` carrito vacío o stock insuficiente.

---

## 2. Listar mis pedidos — `GET /orders`

Devuelve los pedidos del usuario autenticado (más recientes primero).

---

## 3. Listar todos los pedidos — `GET /orders/admin-orders` 🔒admin

**Parámetros (query):** `status`, `userId`, `page`, `limit`.

---

## 4. Obtener pedido — `GET /orders/:id`

- El **cliente** solo ve sus propios pedidos (`403` si no es suyo).
- El **admin** ve cualquier pedido.

---

## 5. Actualizar estado — `PATCH /orders/:id/status` 🔒admin

**Cuerpo:** `{ "status": "enviado" }`

### Máquina de estados

```
pendiente ──► pagado ──► enviado ──► entregado
     │          │           │
     └──────────┴───────────┴──► cancelado
```

- `pendiente` → `pagado` | `cancelado`
- `pagado` → `enviado` | `cancelado`
- `enviado` → `entregado` | `cancelado`
- `entregado` → (terminal)
- `cancelado` → (terminal)

> Si se cancela un pedido **pendiente** se **restaura el stock** automáticamente.

---

### Estados

| Estado | Significado |
|--------|-------------|
| `pendiente` | Creado, esperando pago |
| `pagado` | Pasarela o confirmación aprobó el pago |
| `enviado` | En ruta de entrega |
| `entregado` | Entregado al cliente |
| `cancelado` | Cancelado (restaura stock si no fue pagado) |