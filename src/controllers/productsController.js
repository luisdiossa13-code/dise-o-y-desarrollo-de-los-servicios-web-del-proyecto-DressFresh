const db = require('../db/Database');
const { publicProduct, effectivePricing } = require('../services/pricing');
const { ApiError, uid, now, buildMeta } = require('../utils/helpers');

function productsCountByCategory(categoryId) {
  return db.collection('products').find((p) => p.categoryId === categoryId && p.active !== false).length;
}

function applyFilters(products, query) {
  let rows = [...products];
  const { q, categoryId, brand, minPrice, maxPrice, sizes, colors } = query;

  if (q) {
    const search = String(q).toLowerCase().trim();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.brand && p.brand.toLowerCase().includes(search))
    );
  }
  if (categoryId) rows = rows.filter((p) => p.categoryId === categoryId);
  if (brand) rows = rows.filter((p) => p.brand === brand);
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    rows = rows.filter((p) => effectivePricing(p).price >= min);
  }
  if (maxPrice !== undefined) {
    const max = Number(maxPrice);
    rows = rows.filter((p) => effectivePricing(p).price <= max);
  }
  if (sizes) {
    const wanted = String(sizes).split(',').map((s) => s.trim());
    rows = rows.filter((p) => wanted.every((w) => (p.sizes || []).includes(w)));
  }
  if (colors) {
    const wanted = String(colors).split(',').map((c) => c.trim());
    rows = rows.filter((p) => wanted.every((w) => (p.colors || []).some((c) => c.toLowerCase() === w.toLowerCase())));
  }
  return rows;
}

function applySort(rows, sort) {
  switch (sort) {
    case 'priceAsc':
      return rows.sort((a, b) => effectivePricing(a).price - effectivePricing(b).price);
    case 'priceDesc':
      return rows.sort((a, b) => effectivePricing(b).price - effectivePricing(a).price);
    case 'newest':
      return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'name':
      return rows.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return rows;
  }
}

function listProducts(req, res, { adminOnly = false } = {}) {
  const { page = 1, limit = 12 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 12));

  let products = db.collection('products').all();
  if (!adminOnly) products = products.filter((pr) => pr.active !== false);

  let rows = applyFilters(products, req.query);
  rows = applySort(rows, req.query.sort);

  const total = rows.length;
  const start = (p - 1) * l;
  const data = rows.slice(start, start + l).map(publicProduct);

  res.json({ success: true, data, meta: buildMeta(p, l, total) });
}

function listAllProductsAdmin(req, res) {
  listProducts(req, res, { adminOnly: true });
}

function getProduct(req, res) {
  const product = db.collection('products').findById(req.params.id);
  if (!product) throw new ApiError(404, 'Producto no encontrado.');
  if (product.active === false && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(404, 'Producto no encontrado.');
  }
  res.json({ success: true, data: publicProduct(product) });
}

function getProductBySlug(req, res) {
  const product = db.collection('products').findOne((p) => p.slug === req.params.slug);
  if (!product) throw new ApiError(404, 'Producto no encontrado.');
  if (product.active === false && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(404, 'Producto no encontrado.');
  }
  res.json({ success: true, data: publicProduct(product) });
}

function relatedProducts(req, res) {
  const product = db.collection('products').findById(req.params.id);
  if (!product) throw new ApiError(404, 'Producto no encontrado.');
  const related = db
    .collection('products')
    .find(
      (p) =>
        p.categoryId === product.categoryId &&
        p.id !== product.id &&
        p.active !== false
    )
    .slice(0, 4)
    .map(publicProduct);
  res.json({ success: true, data: related });
}

function listBrands(req, res) {
  const brands = [...new Set(db.collection('products').find((p) => p.brand).map((p) => p.brand))].sort();
  res.json({ success: true, data: brands });
}

function createProduct(req, res) {
  const products = db.collection('products');
  const data = req.body;

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (products.findOne((p) => p.slug === slug)) {
    throw new ApiError(409, 'Ya existe un producto con este slug.');
  }
  if (data.categoryId && !db.collection('categories').findById(data.categoryId)) {
    throw new ApiError(400, 'La categoría indicada no existe.');
  }

  const product = products.create({
    id: uid('prd'),
    slug,
    name: data.name,
    description: data.description || '',
    brand: data.brand || 'Moda Trends',
    price: Number(data.price),
    oldPrice: data.oldPrice !== undefined ? Number(data.oldPrice) : null,
    stock: Number(data.stock) || 0,
    sizes: data.sizes || ['Única'],
    colors: data.colors || ['Único'],
    categoryId: data.categoryId || null,
    images: Array.isArray(data.images) && data.images.length ? data.images : [],
    active: data.active !== false,
    rating: 0,
    numReviews: 0,
    createdAt: now(),
    updatedAt: now()
  });

  res.status(201).json({ success: true, message: 'Producto creado.', data: publicProduct(product) });
}

function updateProduct(req, res) {
  const products = db.collection('products');
  let product = products.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Producto no encontrado.');

  const patch = {};
  if (req.body.name) patch.name = req.body.name;
  if (req.body.description !== undefined) patch.description = req.body.description;
  if (req.body.brand !== undefined) patch.brand = req.body.brand;
  if (req.body.price !== undefined) patch.price = Number(req.body.price);
  if (req.body.oldPrice !== undefined) patch.oldPrice = req.body.oldPrice === null ? null : Number(req.body.oldPrice);
  if (req.body.stock !== undefined) patch.stock = Number(req.body.stock);
  if (req.body.sizes !== undefined) patch.sizes = req.body.sizes;
  if (req.body.colors !== undefined) patch.colors = req.body.colors;
  if (req.body.images !== undefined) patch.images = req.body.images;
  if ('active' in req.body) patch.active = Boolean(req.body.active);
  if ('categoryId' in req.body) {
    if (req.body.categoryId && !db.collection('categories').findById(req.body.categoryId)) {
      throw new ApiError(400, 'La categoría indicada no existe.');
    }
    patch.categoryId = req.body.categoryId;
  }
  patch.updatedAt = now();

  product = products.update(product.id, patch);
  res.json({ success: true, message: 'Producto actualizado.', data: publicProduct(product) });
}

function deleteProduct(req, res) {
  const removed = db.collection('products').remove(req.params.id);
  if (!removed) throw new ApiError(404, 'Producto no encontrado.');
  res.json({ success: true, message: 'Producto eliminado.' });
}

module.exports = {
  productsCountByCategory,
  listProducts,
  listAllProductsAdmin,
  getProduct,
  getProductBySlug,
  relatedProducts,
  listBrands,
  createProduct,
  updateProduct,
  deleteProduct
};