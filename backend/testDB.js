// backend/testDB.js
const db = require('./config/db');

(async () => {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa. Resultado:', rows[0].result);
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  }
})();
