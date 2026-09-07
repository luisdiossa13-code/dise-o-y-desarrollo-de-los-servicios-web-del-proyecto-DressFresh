# Servicio de Métodos de Pago (Pasarela integrada)

Módulo que integra la **pasarela de pago** de la tienda con los métodos: tarjeta de
crédito/débito, **PSE**, **Nequi**, **PayPal** y **contra entrega**. En esta entrega
la pasarela se simula, pero su diseño permite conectar una pasarela real (Stripe,
PayU, Wompi, etc.) sin cambiar la interfaz del front.

**Ruta base:** `/api/payments`

---

## 1. Métodos de pago disponibles — `GET /payments/methods` (público)

Devuelve los métodos que el front muestra en la pasarela de checkout:

```json
{ "success": true, "data": [
  { "code": "tarjeta", "name": "Tarjeta de crédito/débito", "description": "Visa, Mastercard y Amex", "requires": ["cardNumber","cardHolder","expiry","cvc"] },
  { "code": "pse", "name": "PSE (Pagos Seguros en Línea)", "description": "Débito desde tu cuenta bancaria", "requires": ["bank"] },
  { "code": "nequi", "name": "Nequi", "description": "Paga desde tu billetera digital Nequi", "requires": ["phone"] },
  { "code": "paypal", "name": "PayPal", "description": "Paga con tu cuenta PayPal", "requires": [] },
  { "code": "contraentrega", "name": "Contra entrega", "description": "Paga al recibir tu pedido", "requires": [] }
] }
```

---

## 2. Procesar pago — `POST /payments` 🔒usuario

**Cuerpo:**

**Tarjeta:**
```json
{ "orderId": "ord-...", "method": "tarjeta", "cardNumber": "4111111111111111", "cardHolder": "Cliente Demo", "expiry": "12/28", "cvc": "123" }
```
**PSE:** `{ "orderId": "...", "method": "pse", "bank": "Bancolombia" }`
**Nequi:** `{ "orderId": "...", "method": "nequi", "phone": "3001234567" }`
**PayPal:** `{ "orderId": "...", "method": "paypal" }`
**Contra entrega:** `{ "orderId": "...", "method": "contraentrega" }`

**Comportamiento:**
- Solo se paga un pedido **no pagado/cancelado** (`409` si ya tiene pago).
- Si la pasarela aprueba → el pago queda `aprobado` y el pedido pasa a `pagado`.
- Si es contra entrega → pago `pendiente`, pedido sigue `pendiente` hasta confirmación.
- Si se rechaza → pago `rechazado`.

**Respuesta 201:** pago con `number` (`PAY-2026-000001`), `status`, `transactionId`
y `gatewayResponse`.

> **Simulación:** para aprobar tarjeta usa un número que **inicie en 4**
> (ej. `4111111111111111`). Cualquier otro se rechaza.

---

## 3. Listar mis pagos — `GET /payments` 🔒usuario

Historial de pagos del cliente.

---

## 4. Listar todos los pagos — `GET /payments/admin-payments` 🔒admin

**Parámetros (query):** `status`, `method`, `userId`.

---

## 5. Obtener pago — `GET /payments/:id` 🔒usuario

El cliente solo ve sus pagos; el admin ve todos.

---

## 6. Confirmar pago — `POST /payments/:id/confirm` 🔒admin

Convierte un pago `pendiente` en `aprobado` y, si el pedido está `pendiente`, lo
pasa a `pagado`. Se usa para **contra entrega** o aprobaciones manuales.

---

## 7. Reembolsar pago — `POST /payments/:id/refund` 🔒admin

Cambia un pago `aprobado` a `reembolsado`.

---

### Conectar una pasarela real (producción)

En `src/controllers/paymentsController.js`, la función `simulateGateway()` es el
único punto a reemplazar para delegar en la pasarela contratada usando las llaves de
`.env`:

```
PAYMENT_GATEWAY=stripe
PAYMENT_GATEWAY_KEY=tus_llaves
```

El resto del servicio (persistencia, estados, confirmación) no cambia.