const bcrypt = require('bcryptjs');
const db = require('../db/Database');
const { signToken } = require('../middleware/auth');
const { ApiError, uid, now } = require('../utils/helpers');

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function register(req, res) {
  const { name, email, password, phone, address } = req.body;
  const users = db.collection('users');

  const emailNormalized = String(email).toLowerCase().trim();
  if (users.findOne((u) => u.email === emailNormalized)) {
    throw new ApiError(409, 'Ya existe una cuenta con este correo electrónico.');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = users.create({
    id: uid('usr'),
    name,
    email: emailNormalized,
    password: hash,
    role: 'cliente',
    phone: phone || null,
    address: address || null,
    active: true,
    createdAt: now(),
    updatedAt: now()
  });

  const token = signToken(user);
  res.status(201).json({ success: true, message: 'Cuenta creada correctamente.', data: { token, user: publicUser(user) } });
}

async function login(req, res) {
  const { email, password } = req.body;
  const users = db.collection('users');
  const user = users.findOne((u) => u.email === String(email).toLowerCase().trim());

  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    throw new ApiError(401, 'Credenciales incorrectas.');
  }
  if (!user.active) {
    throw new ApiError(403, 'Tu cuenta se encuentra inactiva. Contacta al administrador.');
  }

  const token = signToken(user);
  res.json({ success: true, message: 'Inicio de sesión exitoso.', data: { token, user: publicUser(user) } });
}

function me(req, res) {
  const user = db.collection('users').findById(req.user.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ success: true, data: publicUser(user) });
}

module.exports = { register, login, me, publicUser };