# Servicio de Categorías

Módulo que organiza los productos de la tienda en **categorías** (Camisetas,
Pantalones, Vestidos, Chaquetas, Zapatos, Accesorios, etc.). El front las usa en el
menú de navegación y los filtros.

**Ruta base:** `/api/categories` · Las escrituras requieren rol `admin`.

---

## 1. Listar categorías — `GET /categories`

**Parámetro (query):** `withCount=true` para incluir `productsCount` (nº de productos activos de cada categoría) en cada elemento.

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    { "id": "cat-...", "name": "Camisetas", "slug": "camisetas", "description": "...", "image": "...", "active": true, "productsCount": 3 }
  ]
}
```

---

## 2. Obtener categoría — `GET /categories/:id`

**Respuesta 200:** datos de la categoría (incluye `productsCount`).

---

## 3. Crear categoría — `POST /categories` 🔒admin

**Cuerpo:**
```json
{ "name": "Camisas", "slug": "camisas", "description": "Camisas formales y casuales", "image": "https://...", "active": true }
```
- `slug` es opcional (se genera del nombre si se omite). No se permiten slugs duplicados.

---

## 4. Actualizar categoría — `PATCH /categories/:id` 🔒admin

**Cuerpo (parcial):** `name`, `slug`, `description`, `image`, `active`.

---

## 5. Eliminar categoría — `DELETE /categories/:id` 🔒admin

> **409** si la categoría tiene productos asociados (primero se deben reasignar o
> eliminar los productos). Esto protege la integridad del catálogo.