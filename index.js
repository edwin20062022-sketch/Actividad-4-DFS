const express = require('express');
const { pool } = require('./src/db');
const { router: productosRouter } = require('./src/routes/productos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/productos', productosRouter);

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
});