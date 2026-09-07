const db = require('../db/Database');
const { productsCountByCategory } = require('./productsController');
const { ApiError, uid, now } = require('../utils/helpers');

function toDTO(cat) {
  if (!cat) return null;
  return { ...cat, productsCount: productsCountByCategory(cat.id) };
}

function listCategories(req, res) {
  const categories = db.collection('categories').all();
  const includeCount = req.query.withCount === 'true';
  const rows = includeCount ? categories.map(toDTO) : categories;
  res.json({ success: true, data: rows });
}

function getCategory(req, res) {
  const cat = db.collection('categories').findById(req.params.id);
  if (!cat) throw new ApiError(404, 'Categoría no encontrada.');
  res.json({ success: true, data: toDTO(cat) });
}

function createCategory(req, res) {
  const { name, slug, description, image, active = true } = req.body;
  const categories = db.collection('categories');
  const slugNormalized = String(slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (categories.findOne((c) => c.slug === slugNormalized)) {
    throw new ApiError(409, 'Ya existe una categoría con este slug.');
  }

  const cat = categories.create({
    id: uid('cat'),
    name,
    slug: slugNormalized,
    description: description || '',
    image: image || null,
    active: Boolean(active),
    createdAt: now(),
    updatedAt: now()
  });
  res.status(201).json({ success: true, message: 'Categoría creada.', data: cat });
}

function updateCategory(req, res) {
  const categories = db.collection('categories');
  let cat = categories.findById(req.params.id);
  if (!cat) throw new ApiError(404, 'Categoría no encontrada.');

  const patch = {};
  if (req.body.name) patch.name = req.body.name;
  if (req.body.description !== undefined) patch.description = req.body.description;
  if (req.body.image !== undefined) patch.image = req.body.image;
  if ('active' in req.body) patch.active = Boolean(req.body.active);
  if (req.body.slug) {
    const slugNormalized = String(req.body.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (categories.findOne((c) => c.slug === slugNormalized && c.id !== cat.id)) {
      throw new ApiError(409, 'Ya existe una categoría con este slug.');
    }
    patch.slug = slugNormalized;
  }
  patch.updatedAt = now();

  cat = categories.update(cat.id, patch);
  res.json({ success: true, message: 'Categoría actualizada.', data: cat });
}

function deleteCategory(req, res) {
  const categories = db.collection('categories');
  const cat = categories.findById(req.params.id);
  if (!cat) throw new ApiError(404, 'Categoría no encontrada.');

  const used = db.collection('products').find((p) => p.categoryId === cat.id);
  if (used.length > 0) {
    throw new ApiError(409, 'No se puede eliminar la categoría porque tiene productos asociados.');
  }
  categories.remove(cat.id);
  res.json({ success: true, message: 'Categoría eliminada.' });
}

module.exports = { toDTO, listCategories, getCategory, createCategory, updateCategory, deleteCategory };