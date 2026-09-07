const bcrypt = require('bcryptjs');
const db = require('../db/Database');
const { publicUser } = require('./authController');
const { ApiError, uid, now, round } = require('../utils/helpers');

function adminUser(user) {
  return publicUser(user);
}

function listUsers(req, res) {
  const { search = '', role = '', page = 1, limit = 20 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));

  let users = db.collection('users').all();
  const q = String(search).toLowerCase().trim();
  if (q) {
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (role) users = users.filter((u) => u.role === role);

  const total = users.length;
  const start = (p - 1) * l;
  const rows = users.slice(start, start + l).map((u) => ({
    ...u,
    totalOrders: db.collection('orders').find((o) => o.userId === u.id).reduce((s, o) => s + 1, 0),
    totalSpent: round(db.collection('orders').find((o) => o.userId === u.id && o.status === 'pagado').reduce((s, o) => s + o.total, 0))
  }));

  res.json({
    success: true,
    data: rows,
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
  });
}

function getUser(req, res) {
  const user = db.collection('users').findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: adminUser(user) });
}

function getUserOrders(req, res) {
  const user = db.collection('users').findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  const orders = db
    .collection('orders')
    .find((o) => o.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: orders });
}

async function createUser(req, res) {
  const { name, email, password, role = 'cliente', phone, address } = req.body;
  const users = db.collection('users');
  const emailNormalized = String(email).toLowerCase().trim();

  if (users.findOne((u) => u.email === emailNormalized)) {
    throw new ApiError(409, 'Ya existe un usuario con este correo.');
  }
  if (!['admin', 'cliente'].includes(role)) {
    throw new ApiError(400, 'El rol debe ser "admin" o "cliente".');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = users.create({
    id: uid('usr'),
    name,
    email: emailNormalized,
    password: hash,
    role,
    phone: phone || null,
    address: address || null,
    active: true,
    createdAt: now(),
    updatedAt: now()
  });

  res.status(201).json({ success: true, message: 'Usuario creado.', data: adminUser(user) });
}

async function updateUser(req, res) {
  const users = db.collection('users');
  let user = users.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  if (req.body.email) {
    const emailNormalized = String(req.body.email).toLowerCase().trim();
    const existing = users.findOne((u) => u.email === emailNormalized);
    if (existing && existing.id !== user.id) {
      throw new ApiError(409, 'Ya existe un usuario con este correo.');
    }
  }

  const patch = {};
  if (req.body.name) patch.name = req.body.name;
  if (req.body.email) patch.email = String(req.body.email).toLowerCase().trim();
  if (req.body.phone !== undefined) patch.phone = req.body.phone;
  if (req.body.address !== undefined) patch.address = req.body.address;
  if ('active' in req.body) patch.active = Boolean(req.body.active);
  patch.updatedAt = now();

  user = users.update(user.id, patch);
  res.json({ success: true, message: 'Usuario actualizado.', data: adminUser(user) });
}

async function changeRole(req, res) {
  const users = db.collection('users');
  const user = users.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  const { role } = req.body;
  if (!['admin', 'cliente'].includes(role)) {
    throw new ApiError(400, 'El rol debe ser "admin" o "cliente".');
  }
  if (user.id === req.user.id && role !== 'admin') {
    throw new ApiError(400, 'No puedes quitarte el rol de administrador a ti mismo.');
  }

  const updated = users.update(user.id, { role, updatedAt: now() });
  res.json({ success: true, message: 'Rol actualizado.', data: adminUser(updated) });
}

async function resetPassword(req, res) {
  const users = db.collection('users');
  const user = users.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  const hash = await bcrypt.hash(req.body.password, 10);
  const updated = users.update(user.id, { password: hash, updatedAt: now() });
  res.json({ success: true, message: 'Contraseña restablecida.', data: { id: updated.id } });
}

function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'No puedes eliminar tu propia cuenta.');
  }
  const removed = db.collection('users').remove(req.params.id);
  if (!removed) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, message: 'Usuario eliminado.' });
}

module.exports = { listUsers, getUser, getUserOrders, createUser, updateUser, changeRole, resetPassword, deleteUser };