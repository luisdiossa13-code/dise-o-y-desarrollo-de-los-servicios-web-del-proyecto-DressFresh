# Servicio de Configuración y Redes Sociales

Módulo que guarda los datos dinámicos de la tienda: nombre, logotipo/slogan,
contacto, **barra de redes sociales**, banners del home y avisos. El front lo
consume para poblar el header, el footer, la **barra social** y los carruseles sin
tener que recompilar la aplicación.

**Ruta base:** `/api/config`

---

## 1. Configuración pública — `GET /config` (público)

Devuelve los datos que cualquier visitante necesita:

```json
{
  "success": true,
  "data": {
    "store": { "storeName": "Moda Trends", "slogan": "Tu estilo, nuestra pasión", "email": "contacto@modatrends.com", "phone": "+57 300 123 4567", "whatsapp": "https://wa.me/573001234567", "address": "...", "city": "...", "currency": "COP", "announcement": "Envío gratis por compras superiores a $200.000" },
    "socialNetworks": [ { "id": "...", "name": "Instagram", "url": "https://instagram.com/modatrends", "icon": "instagram" } ],
    "banners": [ { "id": "...", "title": "Nueva Colección Primavera", "subtitle": "...", "image": "...", "url": "/productos" } ]
  }
}
```

Solo se incluyen **redes sociales y banners activos**. Esto alimenta la **barra de
redes sociales** responsiva del front.

---

## 2. Configuración completa — `GET /config/full` 🔒admin

Devuelve todo, incluidos los inactivos.

---

## 3. Actualizar configuración — `PUT /config/admin` 🔒admin

**Cuerpo (foncional, campos opcionales):**
```json
{
  "storeName": "Moda Trends",
  "slogan": "Tu estilo, nuestra pasión",
  "email": "contacto@modatrends.com",
  "phone": "+57 300 123 4567",
  "whatsapp": "https://wa.me/573001234567",
  "address": "Av. Siempre Viva 123",
  "city": "Bogotá",
  "announcement": "Envío gratis por compras superiores a $200.000",
  "socialNetworks": [ ... ],
  "banners": [ ... ]
}
```

---

## 4. Redes sociales (sub-recurso)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/config/social` | Agregar red social | admin |
| PATCH | `/config/social/:socialId` | Actualizar (nombre, url, icono, activo) | admin |
| DELETE | `/config/social/:socialId` | Eliminar red social | admin |

**Ej. agregar red:**
```json
{ "name": "LinkedIn", "url": "https://linkedin.com/company/modatrends", "icon": "linkedin", "active": true }
```

---

## 5. Banners (sub-recurso)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/config/banners` | Agregar banner (`title`, `image` obligatorios) | admin |
| DELETE | `/config/banners/:bannerId` | Eliminar banner | admin |

---

### Uso en la web responsiva

- **Header / Footer:** `GET /config` → datos de la tienda (teléfono, correo, dirección).
- **Barra de redes sociales:** `GET /config` → `socialNetworks` (los iconos se
  mapean según `icon`).
- **Home / carrusel:** `GET /config` → `banners`.
- **Panel admin:** `GET /config/full` y `PUT /config/admin` para gestionar todo.