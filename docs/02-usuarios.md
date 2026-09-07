# Servicio de Usuarios (Administrador)

Módulo que permite al **administrador** gestionar a todos los usuarios (clientes y
administradores): listarlos, buscarlos, cambiar su rol y estado, o restablecer su
contraseña. Sustenta el módulo **Administrador** de la tienda.

**Ruta base:** `/api/users` · 🔒 Requiere rol `admin` en todas las rutas.

---

## 1. Listar usuarios — `GET /users`

**Parámetros (query):**
- `search` — filtra por nombre o correo (texto parcial, sin distinguir mayúsculas).
- `role` — `admin` o `cliente`.
- `page` (1), `limit` (20) — paginación.

**Respuesta 200:**
```json
{
  "success": true,
  "data": [ { "id": "usr-...", "name": "...", "email": "...", "role": "cliente", "active": true, "totalOrders": 3, "totalSpent": 500000 } ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

---

## 2. Obtener usuario — `GET /users/:id`

**Respuesta 200:** datos del usuario.

---

## 3. Pedidos de un usuario — `GET /users/:id/orders`

Devuelve las órdenes de compra realizadas por ese usuario. Útil en el panel admin
para ver el historial de compra de cada cliente.

---

## 4. Crear usuario — `POST /users`

**Cuerpo:**
```json
{ "name": "Andrea", "email": "andrea@correo.com", "password": "Clave123", "role": "cliente", "phone": "+57 300 111 2222" }
```

**Respuesta 201:** usuario creado · **409:** correo duplicado.

---

## 5. Actualizar datos — `PATCH /users/:id`

**Cuerpo (parcial):** `name`, `email`, `phone`, `address`, `active`.

Ej.: desactivar/activar una cuenta → `{ "active": false }`.

---

## 6. Cambiar rol — `PATCH /users/:id/role`

**Cuerpo:** `{ "role": "admin" }` o `"cliente"`.

> No se puede quitar el rol de administrador a la propia cuenta.

---

## 7. Restablecer contraseña — `PATCH /users/:id/password`

**Cuerpo:** `{ "password": "NuevaClave123" }` (mínimo 6 caracteres).

---

## 8. Eliminar usuario — `DELETE /users/:id`

No permite eliminar la propia cuenta.

---

### Seguridad
Todas las rutas usan `requireAuth` + `requireAdmin`: se obtiene `403` si el token
no es de un administrador, y `401` si no hay sesión válida.