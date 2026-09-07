# Servicio de Autenticación

Módulo encargado del **registro, inicio de sesión** (con token JWT) y la consulta
del **perfil del usuario autenticado** de la tienda. Toda la tienda usa el token
JWT devuelto para proteger las operaciones que requieren sesión.

**Ruta base:** `/api/auth`

---

## 1. Registrar un cliente — `POST /auth/register`

Crea una cuenta de cliente y devuelve automáticamente el token y el usuario (para
que el front redirija al inicio sin pedir login de nuevo).

**Cuerpo de la petición (JSON):**

```json
{
  "name": "María Pérez",
  "email": "maria@correo.com",
  "password": "Secreto123",
  "phone": "+57 310 000 0000",
  "address": "Calle 5 # 10-20"
}
```

**Respuesta 201:**

```json
{
  "success": true,
  "message": "Cuenta creada correctamente.",
  "data": { "token": "eyJhbGciOi...", "user": { "id": "usr-...", "name": "María Pérez", "role": "cliente", "email": "maria@correo.com", ... } }
}
```

**Errores:** `409` si el correo ya existe · `400` por validación.

---

## 2. Iniciar sesión — `POST /auth/login`

Autentica las credenciales y devuelve el **token JWT** con el que se protegerán las
demás rutas.

**Cuerpo:** `{ "email": "cliente@modatrends.com", "password": "Cliente123456" }`

**Respuesta 200:** igual al registro (`data.token` + `data.user`).

**Errores:** `401` credenciales incorrectas · `403` cuenta inactiva.

> **Uso:** enviar el token como header `Authorization: Bearer <token>`.

---

## 3. Perfil autenticado — `GET /auth/me` 🔒

Devuelve los datos del usuario asociado al token.

**Requiere:** token de cualquier usuario autenticado.

**Respuesta 200:** `{ "success": true, "data": { "id": "...", "role": "cliente", ... } }`

**Errores:** `401` sin token o token inválido.

---

### Credenciales de demostración

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `admin@modatrends.com` | `Admin123456` |
| Cliente | `cliente@modatrends.com` | `Cliente123456` |

### Diagrama de flujo del front

1. El usuario ingresa en `POST /auth/login` (o se registra en `POST /auth/register`).
2. La API devuelve `token` y `user.role` (`admin` / `cliente`).
3. El front guarda el token (localStorage) y lo adjunta en cada petición protegida.
4. El panel (header, botones de cuenta, carrito) cambia según el rol.