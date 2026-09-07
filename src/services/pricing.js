const db = require('../db/Database');
const { round } = require('../utils/helpers');

function isOfferActive(offer, date = new Date()) {
  if (!offer || offer.active !== true) return false;
  const t = date.getTime();
  if (offer.startsAt && new Date(offer.startsAt).getTime() > t) return false;
  if (offer.endsAt && new Date(offer.endsAt).getTime() < t) return false;
  return true;
}

function categorySlugOf(product) {
  if (!product || !product.categoryId) return null;
  const cat = db.collection('categories').findById(product.categoryId);
  return cat ? cat.slug : null;
}

function matchingOffers(product) {
  const offers = db.collection('offers').all();
  const catSlug = categorySlugOf(product);
  const now = new Date();
  return offers.filter((offer) => {
    if (!isOfferActive(offer, now)) return false;
    if (offer.scopeType === 'global') return true;
    if (offer.scopeType === 'category') return offer.scopeValue === catSlug;
    if (offer.scopeType === 'product') return offer.scopeValue === product.id;
    return false;
  });
}

/**
 * Devuelve el precio efectivo de un producto aplicando la oferta más
 * favorable activa en este momento.
 * @returns {{ price: number, discountPercent: number, offer: object|null }}
 */
function effectivePricing(product) {
  const offers = matchingOffers(product);
  const best = offers.reduce((acc, offer) => (offer.discountPercent > acc ? offer.discountPercent : acc), 0);
  const offer = offers.find((o) => o.discountPercent === best) || null;
  const price = round(product.price * (1 - best / 100));
  return { price, discountPercent: best, offer };
}

function publicProduct(product) {
  if (!product) return null;
  const pricing = effectivePricing(product);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    price: product.price,
    priceWithOffer: pricing.price,
    discountPercent: pricing.discountPercent,
    offerTitle: pricing.offer ? pricing.offer.title : null,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    categoryId: product.categoryId,
    images: product.images,
    rating: product.rating || 0,
    numReviews: product.numReviews || 0,
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

module.exports = { isOfferActive, matchingOffers, effectivePricing, publicProduct };