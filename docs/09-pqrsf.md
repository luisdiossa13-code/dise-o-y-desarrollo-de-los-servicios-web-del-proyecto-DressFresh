# Servicio PQRSF

Módulo del **botón de Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones**
de la tienda. Los clientes envían su solicitud y obtienen un **número de radicado**
para darle seguimiento; el administrador las gestiona, cambia su estado y responde.

**Ruta base:** `/api/pqrsf` · Crear y consultar propias requiere sesión.

---

## 1. Crear solicitud — `POST /pqrsf` 🔒usuario

**Cuerpo:**
```json
{ "tipo": "reclamo", "asunto": "Producto llegó con falla", "descripcion": "El producto llegó con un defecto de fábrica." }
```

**Tipos válidos (`tipo`):**

| Código | Significado |
|--------|-------------|
| `peticion` | Solicitud de información o trámite |
| `queja` | Inconformidad con el servicio |
| `reclamo` | Inconformidad con un producto/servicio ya adquirido |
| `sugerencia` | Propuesta de mejora |
| `felicitacion` | Comentario positivo |

**Respuesta 201:** se genera un `radicado` consecutivo (`PQR-2026-000001`):
```json
{
  "success": true,
  "message": "¡Solicitud recibida! Conserva tu número de radicado para dar seguimiento.",
  "data": { "id": "pqr-...", "radicado": "PQR-2026-000001", "tipo": "reclamo", "asunto": "...", "descripcion": "...", "estado": "recibida", "respuesta": null }
}
```

---

## 2. Listar mis solicitudes — `GET /pqrsf` 🔒usuario

Historial de solicitudes del cliente autenticado (con `user` embebido).

---

## 3. Consultar por radicado — `GET /pqrsf/radicado/:radicado` 🔒usuario

El cliente consulta el estado de una solicitud por su radicado (permite al front
el "consultar mi trámite").

---

## 4. Obtener solicitud — `GET /pqrsf/:id` 🔒usuario/admin

El cliente solo ve sus solicitudes; el admin ve todas.

---

## 5. Responder solicitud — `PATCH /pqrsf/:id/respond` 🔒admin

**Cuerpo:** `{ "respuesta": "Estimado cliente, procedemos con el cambio del producto." }`

Al responder, el estado pasa automáticamente a `resuelta` y se registra
`fechaRespuesta`.

---

## 6. Cambiar estado — `PATCH /pqrsf/:id/estado` 🔒admin

**Cuerpo:** `{ "estado": "en_proceso" }`

**Estados:**

| Estado | Significado |
|--------|-------------|
| `recibida` | Recién creada, sin gestionar |
| `en_proceso` | En trámite por el equipo |
| `resuelta` | Atendida y respondida |

---

## 7. Listar todas — `GET /pqrsf/admin-pqrsf` 🔒admin

**Parámetros (query):** `estado`, `tipo`, `page`, `limit`.

---

### Flujo del botón PQRSF (front)

1. El cliente presiona el botón **PQRSF** en la web.
2. Diligencia el formulario (`tipo`, `asunto`, descripción) → `POST /pqrsf`.
3. La API devuelve el **radicado**, que el front le muestra al cliente.
4. El cliente puede consultar su trámite por radicado, y el admin administra desde
   el panel respondiendo y actualizando estados.