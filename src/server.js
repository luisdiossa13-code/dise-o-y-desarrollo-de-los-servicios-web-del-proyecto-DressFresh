const app = require('./app');
const config = require('./config/env');
const { seed } = require('./db/seed');

(async () => {
  try {
    await seed();
  } catch {
    // Si la siembra falla (datos ya existentes), el servidor continúa normalmente.
  }

  app.listen(config.port, () => {
    console.log('');
    console.log('🚀 API Tienda de Ropa en línea');
    console.log(`   ➜ API:          http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`   ➜ Salud:        http://localhost:${config.port}${config.apiPrefix}/health`);
    console.log(`   ➜ Documentación: http://localhost:${config.port}/api-docs`);
    console.log('');
  });
})();