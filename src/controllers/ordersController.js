const db = require('../db/Database');
const { buildSummary, normalizeItems } = require('./cartController');
const { ApiError, uid, now, sequenceCode, nextSequence, round } = require('../utils/helpers');

const STATUSES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const TRANSITIONS = {
  pendiente: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: []
};

function orderDTO(order) {
  if (!order) return null;
  const payment = order.paymentId ? db.collection('payments').findById(order.paymentId) : null;
  return { ...order, payment: payment || null };
}

function createOrder(req, res) {
  const { shippingAddress, phone, note } = req.body;
  const summary = buildSummary(req.user.id);

  if (summary.items.length === 0) {
    throw new ApiError(400, 'Tu carrito está vacío. Agrega productos antes de realizar el pedido.');
  }

  const products = db.collection('products');
  for (const item of summary.items) {
    const product = products.findById(item.productId);
    if (!product || product.active === false) {
      throw new ApiError(400, `El producto "${item.name}" ya no está disponible. Retíralo del carrito.`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Stock insuficiente para "${item.name}". Solo quedan ${product.stock} unidades.`);
    }
  }

  const orders = db.collection('orders');
  const seq = nextSequence(orders.all(), 'sequence');
  const order = orders.create({
    id: uid('ord'),
    sequence: seq,
    number: sequenceCode('ORD', seq),
    userId: req.user.id,
    items: summary.items, // snapshot de precios al momento de la compra
    subtotal: summary.subtotal,
    discountTotal: summary.discountTotal,
    shipping: summary.shipping,
    total: round(summary.subtotal + summary.shipping),
    status: 'pendiente',
    paymentId: null,
    shippingAddress: shippingAddress || null,
    phone: phone || null,
    note: note || null,
    createdAt: now(),
    updatedAt: now()
  });

  // Descontar stock
  for (const item of summary.items) {
    const product = products.findById(item.productId);
    products.update(product.id, { stock: product.stock - item.quantity, updatedAt: now() });
  }

  // Vaciar carrito
  const carts = db.collection('carts');
  const cart = carts.findOne((c) => c.userId === req.user.id);
  if (cart) carts.update(cart.id, { items: [], updatedAt: now() });

  res.status(201).json({ success: true, message: 'Pedido creado correctamente.', data: orderDTO(order) });
}

function listMyOrders(req, res) {
  const orders = db
    .collection('orders')
    .find((o) => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: orders });
}

function listAllOrders(req, res) {
  const { status = '', userId = '', page = 1, limit = 20 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));

  let orders = db.collection('orders').all();
  if (status) orders = orders.filter((o) => o.status === status);
  if (userId) orders = orders.filter((o) => o.userId === userId);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = orders.length;
  const start = (p - 1) * l;
  res.json({
    success: true,
    data: orders.slice(start, start + l).map(orderDTO),
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
  });
}

function getOrder(req, res) {
  const order = db.collection('orders').findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido no encontrado.');
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    throw new ApiError(403, 'No tienes permisos para ver este pedido.');
  }
  res.json({ success: true, data: orderDTO(order) });
}

function updateOrderStatus(req, res) {
  const orders = db.collection('orders');
  const order = orders.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido no encontrado.');

  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `Estado inválido. Estados permitidos: ${STATUSES.join(', ')}.`);
  }
  if (status === order.status) {
    throw new ApiError(400, `El pedido ya se encuentra en estado "${status}".`);
  }
  if (!TRANSITIONS[order.status].includes(status)) {
    throw new ApiError(400, `No se puede pasar de "${order.status}" a "${status}".`);
  }

  // Restaurar stock si se cancela antes de pagar
  if (status === 'cancelado' && order.status === 'pendiente') {
    const products = db.collection('products');
    for (const item of order.items) {
      const product = products.findById(item.productId);
      if (product) products.update(product.id, { stock: product.stock + item.quantity, updatedAt: now() });
    }
  }

  const updated = orders.update(order.id, { status, updatedAt: now() });
  res.json({ success: true, message: 'Estado del pedido actualizado.', data: orderDTO(updated) });
}

module.exports = { createOrder, listMyOrders, listAllOrders, getOrder, updateOrderStatus, STATUSES, TRANSITIONS };