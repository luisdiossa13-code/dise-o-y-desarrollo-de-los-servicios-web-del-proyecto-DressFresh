const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const productsRoutes = require('./routes/productsRoutes');
const offersRoutes = require('./routes/offersRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const pqrsfRoutes = require('./routes/pqrsfRoutes');
const configRoutes = require('./routes/configRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación interactiva Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Tienda de Ropa - Documentación',
  swaggerOptions: { persistAuthorization: true }
}));

app.get(`${config.apiPrefix}/health`, (req, res) => {
  res.json({ success: true, service: 'tienda-ropa-api', status: 'ok', time: new Date().toISOString() });
});

app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/users`, usersRoutes);
app.use(`${config.apiPrefix}/categories`, categoriesRoutes);
app.use(`${config.apiPrefix}/products`, productsRoutes);
app.use(`${config.apiPrefix}/offers`, offersRoutes);
app.use(`${config.apiPrefix}/cart`, cartRoutes);
app.use(`${config.apiPrefix}/orders`, ordersRoutes);
app.use(`${config.apiPrefix}/payments`, paymentsRoutes);
app.use(`${config.apiPrefix}/pqrsf`, pqrsfRoutes);
app.use(`${config.apiPrefix}/config`, configRoutes);
app.use(`${config.apiPrefix}/dashboard`, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;