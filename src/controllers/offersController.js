const db = require('../db/Database');
const { isOfferActive } = require('../services/pricing');
const { ApiError, uid, now } = require('../utils/helpers');

function toDTO(offer) {
  if (!offer) return null;
  return { ...offer, activeNow: isOfferActive(offer) };
}

function listOffers(req, res, { adminOnly = false } = {}) {
  let offers = db.collection('offers').all();
  if (!adminOnly) offers = offers.filter((o) => isOfferActive(o));
  res.json({ success: true, data: offers.map(toDTO) });
}

function listAllOffersAdmin(req, res) {
  listOffers(req, res, { adminOnly: true });
}

function getOffer(req, res) {
  const offer = db.collection('offers').findById(req.params.id);
  if (!offer) throw new ApiError(404, 'Oferta no encontrada.');
  res.json({ success: true, data: toDTO(offer) });
}

function validateScope(scopeType, scopeValue) {
  if (!['product', 'category', 'global'].includes(scopeType)) {
    throw new ApiError(400, 'scopeType debe ser product, category o global.');
  }
  if (scopeType === 'product' && !db.collection('products').findById(scopeValue)) {
    throw new ApiError(400, 'El producto indicado en scopeValue no existe.');
  }
  if (scopeType === 'category' && !db.collection('categories').findById(scopeValue) && !db.collection('categories').findOne((c) => c.slug === scopeValue)) {
    throw new ApiError(400, 'La categoría indicada en scopeValue no existe.');
  }
}

function createOffer(req, res) {
  const { title, description, discountPercent, scopeType = 'global', scopeValue = null, startsAt, endsAt, active = true } = req.body;

  if (discountPercent <= 0 || discountPercent > 100) {
    throw new ApiError(400, 'El descuento debe estar entre 1 y 100.');
  }
  validateScope(scopeType, scopeValue);

  const offer = db.collection('offers').create({
    id: uid('off'),
    title,
    description: description || '',
    discountPercent: Number(discountPercent),
    scopeType,
    scopeValue,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    active: Boolean(active),
    createdAt: now(),
    updatedAt: now()
  });
  res.status(201).json({ success: true, message: 'Oferta creada.', data: toDTO(offer) });
}

function updateOffer(req, res) {
  const offers = db.collection('offers');
  let offer = offers.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'Oferta no encontrada.');

  const patch = {};
  if (req.body.title) patch.title = req.body.title;
  if (req.body.description !== undefined) patch.description = req.body.description;
  if (req.body.discountPercent !== undefined) {
    if (req.body.discountPercent <= 0 || req.body.discountPercent > 100) {
      throw new ApiError(400, 'El descuento debe estar entre 1 y 100.');
    }
    patch.discountPercent = Number(req.body.discountPercent);
  }
  if (req.body.scopeType !== undefined) {
    const scopeType = req.body.scopeType;
    const scopeValue = req.body.scopeValue !== undefined ? req.body.scopeValue : null;
    validateScope(scopeType, scopeValue);
    patch.scopeType = scopeType;
    patch.scopeValue = scopeValue;
  }
  if (req.body.startsAt !== undefined) patch.startsAt = req.body.startsAt;
  if (req.body.endsAt !== undefined) patch.endsAt = req.body.endsAt;
  if ('active' in req.body) patch.active = Boolean(req.body.active);
  patch.updatedAt = now();

  offer = offers.update(offer.id, patch);
  res.json({ success: true, message: 'Oferta actualizada.', data: toDTO(offer) });
}

function deleteOffer(req, res) {
  const removed = db.collection('offers').remove(req.params.id);
  if (!removed) throw new ApiError(404, 'Oferta no encontrada.');
  res.json({ success: true, message: 'Oferta eliminada.' });
}

/**
 * Calcula el precio con oferta para un listado de productos.
 * Permite al front visualizar descuentos antes de confirmar.
 */
function calculateOffer(req, res) {
  const { productIds = [] } = req.body;
  const { publicProduct, effectivePricing } = require('../services/pricing');
  const results = productIds.map((productId) => {
    const product = db.collection('products').findById(productId);
    if (!product) return { productId, product: null, message: 'No encontrado' };
    const pricing = effectivePricing(product);
    return {
      productId,
      product: publicProduct(product),
      originalPrice: product.price,
      discountPercent: pricing.discountPercent,
      finalPrice: pricing.price
    };
  });
  res.json({ success: true, data: results });
}

module.exports = { listOffers, listAllOffersAdmin, getOffer, createOffer, updateOffer, deleteOffer, calculateOffer };