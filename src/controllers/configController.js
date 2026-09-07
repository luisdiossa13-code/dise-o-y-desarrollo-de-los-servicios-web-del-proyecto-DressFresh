const db = require('../db/Database');
const { ApiError, uid, now } = require('../utils/helpers');

function current() {
  return db.collection('config').findById('config');
}

function publicConfig(req, res) {
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración de la tienda no disponible.');
  const { socialNetworks, banners, ...store } = cfg;
  res.json({
    success: true,
    data: {
      store: { ...store },
      socialNetworks: socialNetworks.filter((s) => s.active).map(({ id, name, url, icon }) => ({ id, name, url, icon })),
      banners: banners.filter((b) => b.active)
    }
  });
}

function fullConfig(req, res) {
  res.json({ success: true, data: current() });
}

function updateConfig(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');

  const allowed = ['storeName', 'slogan', 'email', 'phone', 'whatsapp', 'address', 'city', 'announcement'];
  const patch = { updatedAt: now() };
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  if (req.body.socialNetworks !== undefined) {
    patch.socialNetworks = req.body.socialNetworks.map((s) => ({
      id: s.id || uid(),
      name: s.name,
      url: s.url,
      icon: s.icon || '',
      active: s.active !== false
    }));
  }
  if (req.body.banners !== undefined) {
    patch.banners = req.body.banners.map((b) => ({
      id: b.id || uid(),
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      url: b.url || null,
      active: b.active !== false
    }));
  }

  const updated = config.update('config', patch);
  res.json({ success: true, message: 'Configuración actualizada.', data: updated });
}

function addSocial(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');
  const { name, url, icon = '', active = true } = req.body;
  if (!name || !url) throw new ApiError(400, 'name y url son obligatorios.');

  const social = { id: uid(), name, url, icon, active: Boolean(active) };
  config.update('config', { socialNetworks: [...cfg.socialNetworks, social], updatedAt: now() });
  res.status(201).json({ success: true, message: 'Red social agregada.', data: social });
}

function updateSocial(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');

  const list = cfg.socialNetworks;
  const index = list.findIndex((s) => s.id === req.params.socialId);
  if (index === -1) throw new ApiError(404, 'Red social no encontrada.');

  const updated = { ...list[index] };
  if (req.body.name) updated.name = req.body.name;
  if (req.body.url) updated.url = req.body.url;
  if (req.body.icon !== undefined) updated.icon = req.body.icon;
  if ('active' in req.body) updated.active = Boolean(req.body.active);

  list[index] = updated;
  config.update('config', { socialNetworks: list, updatedAt: now() });
  res.json({ success: true, message: 'Red social actualizada.', data: updated });
}

function deleteSocial(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');

  const list = cfg.socialNetworks.filter((s) => s.id !== req.params.socialId);
  if (list.length === cfg.socialNetworks.length) throw new ApiError(404, 'Red social no encontrada.');
  config.update('config', { socialNetworks: list, updatedAt: now() });
  res.json({ success: true, message: 'Red social eliminada.' });
}

function addBanner(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');
  const { title, image, subtitle = '', url = null, active = true } = req.body;
  if (!title || !image) throw new ApiError(400, 'title e image son obligatorios.');

  const banner = { id: uid(), title, subtitle, image, url, active: Boolean(active) };
  config.update('config', { banners: [...cfg.banners, banner], updatedAt: now() });
  res.status(201).json({ success: true, message: 'Banner agregado.', data: banner });
}

function deleteBanner(req, res) {
  const config = db.collection('config');
  const cfg = current();
  if (!cfg) throw new ApiError(404, 'Configuración no encontrada.');

  const list = cfg.banners.filter((b) => b.id !== req.params.bannerId);
  if (list.length === cfg.banners.length) throw new ApiError(404, 'Banner no encontrado.');
  config.update('config', { banners: list, updatedAt: now() });
  res.json({ success: true, message: 'Banner eliminado.' });
}

module.exports = { publicConfig, fullConfig, updateConfig, addSocial, updateSocial, deleteSocial, addBanner, deleteBanner };