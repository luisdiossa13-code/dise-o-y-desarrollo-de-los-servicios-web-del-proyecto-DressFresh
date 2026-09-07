const db = require('../db/Database');
const { round } = require('../utils/helpers');

function getStats(req, res) {
  const users = db.collection('users').all();
  const products = db.collection('products').all();
  const orders = db.collection('orders').all();
  const pqrsfs = db.collection('pqrsf').all();

  const paidOrders = orders.filter((o) => o.status === 'pagado' || o.status === 'enviado' || o.status === 'entregado');
  const revenue = round(paidOrders.reduce((sum, o) => sum + o.total, 0));

  const byStatus = {};
  for (const s of ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']) {
    byStatus[s] = orders.filter((o) => o.status === s).length;
  }

  const lowStock = products.filter((p) => p.stock < 10).map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock
  }));

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentPQRSF = pqrsfs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      totals: {
        users: users.filter((u) => u.role === 'cliente').length,
        admins: users.filter((u) => u.role === 'admin').length,
        products: products.length,
        activeProducts: products.filter((p) => p.active !== false).length,
        categories: db.collection('categories').all().length,
        orders: orders.length,
        revenue,
        unitsSold: orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
      },
      ordersByStatus: byStatus,
      pqrsfByEstado: {
        recibida: pqrsfs.filter((p) => p.estado === 'recibida').length,
        en_proceso: pqrsfs.filter((p) => p.estado === 'en_proceso').length,
        resuelta: pqrsfs.filter((p) => p.estado === 'resuelta').length
      },
      lowStock,
      recentOrders,
      recentPQRSF
    }
  });
}

module.exports = { getStats };