const db = require('../db/Database');
const { effectivePricing } = require('../services/pricing');
const { ApiError, uid, now, round } = require('../utils/helpers');
const config = require('../config/env');

function cartOf(userId) {
  const carts = db.collection('carts');
  let cart = carts.findOne((c) => c.userId === userId);
  if (!cart) {
    cart = carts.create({ id: uid('car'), userId, items: [], updatedAt: now() });
  }
  return cart;
}

function normalizeItems(items) {
  const rows = items.map((item) => {
    const product = db.collection('products').findById(item.productId);
    if (!product || product.active === false) return null;
    const pricing = effectivePricing(product);
    return {
      productId: item.productId,
      name: product.name,
      slug: product.slug,
      image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
      brand: product.brand,
      size: item.size || 'Única',
      color: item.color || 'Único',
      quantity: item.quantity,
      unitPrice: pricing.price,
      originalPrice: product.price,
      discountPercent: pricing.discountPercent,
      subtotal: round(pricing.price * item.quantity)
    };
  });
  return rows.filter(Boolean);
}

function buildSummary(userId) {
  const cart = cartOf(userId);
  const items = normalizeItems(cart.items);
  const subtotal = round(items.reduce((sum, i) => sum + i.subtotal, 0));
  const discountTotal = round(
    items.reduce((sum, i) => sum + (i.originalPrice - i.unitPrice) * i.quantity, 0)
  );
  const shipping = subtotal === 0 || subtotal >= config.freeShippingThreshold ? 0 : config.shippingCost;
  const total = round(subtotal + shipping);

  return { cart, items, subtotal, discountTotal, shipping, total, itemsCount: items.reduce((s, i) => s + i.quantity, 0) };
}

function getCart(req, res) {
  res.json({ success: true, data: buildSummary(req.user.id) });
}

function addItem(req, res) {
  const { productId, quantity = 1, size, color } = req.body;

  const product = db.collection('products').findById(productId);
  if (!product || product.active === false) throw new ApiError(404, 'Producto no encontrado.');

  const qty = Math.max(1, Number(quantity) || 1);
  const carts = db.collection('carts');
  const cart = cartOf(req.user.id);

  const existing = cart.items.find(
    (i) => i.productId === productId && i.size === size && i.color === color
  );
  const currentQty = existing ? existing.quantity : 0;
  const newQty = currentQty + qty;

  if (newQty > product.stock) {
    throw new ApiError(400, `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles.`);
  }

  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.items.push({ productId, quantity: qty, size: size || 'Única', color: color || 'Único' });
  }
  cart.updatedAt = now();
  carts.update(cart.id, { items: cart.items, updatedAt: cart.updatedAt });

  res.json({ success: true, message: 'Producto agregado al carrito.', data: buildSummary(req.user.id) });
}

function updateItem(req, res) {
  const { quantity } = req.body;
  const carts = db.collection('carts');
  const cart = cartOf(req.user.id);
  const item = cart.items.find((i) => i.productId === req.params.productId);

  if (!item) throw new ApiError(404, 'El producto no está en el carrito.');

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    throw new ApiError(400, 'La cantidad debe ser un número entero mayor o igual a 0.');
  }

  if (qty === 0) {
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  } else {
    const product = db.collection('products').findById(req.params.productId);
    if (product && qty > product.stock) {
      throw new ApiError(400, `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles.`);
    }
    item.quantity = qty;
  }
  cart.updatedAt = now();
  carts.update(cart.id, { items: cart.items, updatedAt: cart.updatedAt });

  res.json({ success: true, message: 'Carrito actualizado.', data: buildSummary(req.user.id) });
}

function removeItem(req, res) {
  const carts = db.collection('carts');
  const cart = cartOf(req.user.id);
  cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  cart.updatedAt = now();
  carts.update(cart.id, { items: cart.items, updatedAt: cart.updatedAt });
  res.json({ success: true, message: 'Producto eliminado del carrito.', data: buildSummary(req.user.id) });
}

function clearCart(req, res) {
  const carts = db.collection('carts');
  const cart = cartOf(req.user.id);
  cart.items = [];
  cart.updatedAt = now();
  carts.update(cart.id, { items: cart.items, updatedAt: cart.updatedAt });
  res.json({ success: true, message: 'Carrito vaciado.', data: buildSummary(req.user.id) });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, buildSummary, cartOf, normalizeItems };