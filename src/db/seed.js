/**
 * Script de datos semilla.
 * Uso:
 *   npm run seed          -> siembra los datos de demostración (no borra lo existente por usuario)
 *   npm run reset         -> borra las colecciones e inserta los datos de demostración de nuevo
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./Database');
const { uid, now } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', 'data');
const COLLECTIONS = ['users', 'categories', 'products', 'offers', 'carts', 'orders', 'payments', 'pqrsf', 'config'];

function resetFiles() {
  for (const name of COLLECTIONS) {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8');
  }
}

const categories = [
  { name: 'Camisetas', slug: 'camisetas', description: 'Camisetas básicas y de moda para toda la familia', image: 'https://picsum.photos/seed/camiseta/600/400', active: true },
  { name: 'Pantalones', slug: 'pantalones', description: 'Jeans, pantalones de vestir y casuales', image: 'https://picsum.photos/seed/pantalon/600/400', active: true },
  { name: 'Vestidos', slug: 'vestidos', description: 'Vestidos para todas las ocasiones', image: 'https://picsum.photos/seed/vestido/600/400', active: true },
  { name: 'Chaquetas', slug: 'chaquetas', description: 'Chaquetas y abrigos para cualquier clima', image: 'https://picsum.photos/seed/chaqueta/600/400', active: true },
  { name: 'Zapatos', slug: 'zapatos', description: 'Calzado deportivo, formal y casual', image: 'https://picsum.photos/seed/zapato/600/400', active: true },
  { name: 'Accesorios', slug: 'accesorios', description: 'Gorras, gafas, cinturones y más', image: 'https://picsum.photos/seed/accesorio/600/400', active: true }
];

const products = [
  {
    name: 'Camiseta Básica Algodón', brand: 'Moda Trends', price: 49900, oldPrice: 59900, stock: 50,
    description: 'Camiseta de algodón peinado 100%, corte clásico y cómodo. Ideal para el uso diario.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Blanco', 'Negro', 'Gris'], categoryId: null, active: true
  },
  {
    name: 'Camiseta Deportiva Dry Fit', brand: 'SportLine', price: 65900, oldPrice: 79900, stock: 35,
    description: 'Tejido transpirable de secado rápido, perfecta para entrenar.',
    sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Azul', 'Rojo', 'Negro'], categoryId: null, active: true
  },
  {
    name: 'Jeans Cónico Hombre', brand: 'Urban', price: 129900, oldPrice: 159900, stock: 40,
    description: 'Jeans de corte cónico con ajuste perfecto y tela stretch.',
    sizes: ['28', '30', '32', '34', '36'], colors: ['Azul Claro', 'Azul Oscuro', 'Negro'], categoryId: null, active: true
  },
  {
    name: 'Vestido Floral Verano', brand: 'Bella Moda', price: 149900, oldPrice: 179900, stock: 25,
    description: 'Vestido largo con estampado floral, tela ligera ideal para el verano.',
    sizes: ['S', 'M', 'L'], colors: ['Multicolor', 'Rosado'], categoryId: null, active: true
  },
  {
    name: 'Chaqueta Jean Clásica', brand: 'Urban', price: 199900, oldPrice: 239900, stock: 20,
    description: 'Chaqueta en jean desgastado, un clásico que nunca pasa de moda.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Azul', 'Gris'], categoryId: null, active: true
  },
  {
    name: 'Tenis Urbanos Unisex', brand: 'Step', price: 219900, oldPrice: 249900, stock: 30,
    description: 'Tenis casuales con suela antideslizante y diseño moderno.',
    sizes: ['36', '37', '38', '39', '40', '41'], colors: ['Blanco', 'Negro', 'Gris'], categoryId: null, active: true
  },
  {
    name: 'Gorra Trucker', brand: 'Moda Trends', price: 39900, oldPrice: 49900, stock: 60,
    description: 'Gorra estilo trucker con cierre ajustable y bordado frontal.',
    sizes: ['Única'], colors: ['Negro', 'Rojo', 'Azul'], categoryId: null, active: true
  },
  {
    name: 'Blusa Manga Larga', brand: 'Bella Moda', price: 89900, oldPrice: 109900, stock: 28,
    description: 'Blusa de manga larga con diseño elegante para oficina o salidas.',
    sizes: ['S', 'M', 'L'], colors: ['Blanca', 'Beige', 'Negra'], categoryId: null, active: true
  }
];

const offers = [
  {
    title: 'Semana de la Moda - 20% OFF', description: '20% de descuento en toda la tienda por tiempo limitado.',
    discountPercent: 20, scopeType: 'global', scopeValue: null, active: true, startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2026-12-31T23:59:59.999Z'
  },
  {
    title: 'Liquidación Jeans', description: '30% de descuento en todos los jeans.',
    discountPercent: 30, scopeType: 'category', scopeValue: 'pantalones', active: true, startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2026-12-31T23:59:59.999Z'
  }
];

const defaultConfig = {
  id: 'config',
  storeName: 'Moda Trends',
  slogan: 'Tu estilo, nuestra pasión',
  email: 'contacto@modatrends.com',
  phone: '+57 300 123 4567',
  whatsapp: 'https://wa.me/573001234567',
  address: 'Av. Siempre Viva 123, Bogotá',
  city: 'Bogotá',
  currency: 'COP',
  announcement: 'Envío gratis por compras superiores a $200.000',
  socialNetworks: [
    { id: uid(), name: 'Facebook', url: 'https://facebook.com/modatrends', icon: 'facebook', active: true },
    { id: uid(), name: 'Instagram', url: 'https://instagram.com/modatrends', icon: 'instagram', active: true },
    { id: uid(), name: 'X (Twitter)', url: 'https://x.com/modatrends', icon: 'twitter', active: true },
    { id: uid(), name: 'TikTok', url: 'https://tiktok.com/@modatrends', icon: 'tiktok', active: true },
    { id: uid(), name: 'YouTube', url: 'https://youtube.com/@modatrends', icon: 'youtube', active: true },
    { id: uid(), name: 'WhatsApp', url: 'https://wa.me/573001234567', icon: 'whatsapp', active: true }
  ],
  banners: [
    { id: uid(), title: 'Nueva Colección Primavera', subtitle: 'Descubre las últimas tendencias', image: 'https://picsum.photos/seed/banner1/1200/400', url: '/productos', active: true },
    { id: uid(), title: 'Liquidación de Temporada', subtitle: 'Hasta 30% de descuento', image: 'https://picsum.photos/seed/banner2/1200/400', url: '/ofertas', active: true }
  ]
};

async function seed() {
  const users = db.collection('users');
  const categoriesCol = db.collection('categories');
  const productsCol = db.collection('products');
  const offersCol = db.collection('offers');
  const configCol = db.collection('config');

  const adminHash = await bcrypt.hash('Admin123456', 10);
  const clientHash = await bcrypt.hash('Cliente123456', 10);

  if (!users.findOne((u) => u.email === 'admin@modatrends.com')) {
    users.create({
      id: uid('usr'),
      name: 'Administrador',
      email: 'admin@modatrends.com',
      password: adminHash,
      role: 'admin',
      phone: '+57 300 000 0000',
      address: 'Oficina principal',
      active: true,
      createdAt: now(),
      updatedAt: now()
    });
  }

  if (!users.findOne((u) => u.email === 'cliente@modatrends.com')) {
    users.create({
      id: uid('usr'),
      name: 'Cliente Demo',
      email: 'cliente@modatrends.com',
      password: clientHash,
      role: 'cliente',
      phone: '+57 311 111 1111',
      address: 'Calle 10 # 5-20',
      active: true,
      createdAt: now(),
      updatedAt: now()
    });
  }

  const byDate = (slug) => categoriesCol.findOne((c) => c.slug === slug);
  for (const cat of categories) {
    if (categoriesCol.findOne((c) => c.slug === cat.slug)) continue;
    const c = { id: uid('cat'), createdAt: now(), updatedAt: now(), ...cat };
    categoriesCol.create(c);
  }

  const catOfName = (name) => {
    if (/camiseta/i.test(name)) return byDate('camisetas');
    if (/jeans|pantalon/i.test(name)) return byDate('pantalones');
    if (/vestido|blusa/i.test(name)) return byDate('vestidos');
    if (/chaqueta/i.test(name)) return byDate('chaquetas');
    if (/tenis|zapatos/i.test(name)) return byDate('zapatos');
    return byDate('accesorios');
  };

  for (const p of products) {
    if (productsCol.findOne((prod) => prod.slug === p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) continue;
    const cat = catOfName(p.name);
    productsCol.create({
      id: uid('prd'),
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: cat ? cat.id : null,
      images: [`https://picsum.photos/seed/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/600/800`],
      rating: 4.5,
      numReviews: 0,
      createdAt: now(),
      updatedAt: now(),
      ...p
    });
  }

  for (const offer of offers) {
    if (offersCol.findOne((o) => o.title === offer.title)) continue;
    offersCol.create({ id: uid('off'), createdAt: now(), updatedAt: now(), ...offer });
  }

  const current = configCol.findById('config');
  if (!current) {
    configCol.create(defaultConfig);
  }

  console.log('✅ Datos semilla listos.');
  console.log('   👤 Admin   -> admin@modatrends.com / Admin123456');
  console.log('   👤 Cliente -> cliente@modatrends.com / Cliente123456');
}

async function run() {
  const isReset = process.argv.includes('--reset');
  if (isReset) resetFiles();
  await seed();
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Error al sembrar los datos:', err);
    process.exit(1);
  });
}

module.exports = { seed, resetFiles, run };