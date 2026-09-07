# Servicio de Dashboard (Estadísticas del Administrador)

Módulo que alimenta el panel de administración de la tienda con **indicadores
globales** en tiempo real: usuarios, productos, pedidos, ventas, PQRSF y avisos.

**Ruta base:** `/api/dashboard` · 🔒 Requiere rol `admin`.

---

## Estadísticas generales — `GET /dashboard/stats`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "users": 1,
      "admins": 1,
      "products": 8,
      "activeProducts": 8,
      "categories": 6,
      "orders": 1,
      "revenue": 211600,
      "unitsSold": 5
    },
    "ordersByStatus": { "pendiente": 0, "pagado": 1, "enviado": 0, "entregado": 0, "cancelado": 0 },
    "pqrsfByEstado": { "recibida": 0, "en_proceso": 0, "resuelta": 1 },
    "lowStock": [ { "id": "prd-...", "name": "...", "stock": 5 } ],
    "recentOrders": [ { ... } ],
    "recentPQRSF": [ { ... } ]
  }
}
```

### Campos que devuelve

| Campo | Uso en el panel |
|-------|-----------------|
| `totals.users` / `admins` | Tarjetas de clientes y administradores |
| `totals.products` / `activeProducts` | Tarjeta de catálogo |
| `totals.orders` / `revenue` / `unitsSold` | Tarjetas de ventas |
| `ordersByStatus` | Gráfico de pedidos por estado |
| `pqrsfByEstado` | Resumen del módulo PQRSF |
| `lowStock` | Alerta de productos con stock < 10 |
| `recentOrders` / `recentPQRSF` | Actividad reciente en la cabecera del panel |

---

### Integración con los demás módulos

- **Usuarios:** cuenta clientes y administradores.
- **Productos / Ofertas:** total de ítems y alerta de stock bajo.
- **Pedidos / Pagos:** ventas totales y unidades vendidas (solo pedidos pagados).
- **PQRSF:** pendientes por resolver.
- **Configuración:** afina el panel con los datos de la tienda.