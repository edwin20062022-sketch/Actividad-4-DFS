const { pool } = require('../db');

class ProductosRepository {

  async getAll() {
    const result = await pool.query(
      'select id, nombre, precio from productos;'
    );
    return result.rows;
  }

  async getAllActive() {
    const result = await pool.query(
      'select id, nombre, precio from productos where activo = true;'
    );
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      'select id, nombre, precio, stock, descripcion from productos where activo = true and id = $1;', [id]
    );
    return result.rows[0];
  }

  async create(nombre, precio) {
    const result = await pool.query(
      'insert into productos (nombre, precio) values ($1,$2) returning id, nombre, precio;',[nombre, precio] 
    );
    return result.rows[0];
  }

  async update(id, data) {
    const result = await pool.query(
      'UPDATE productos SET nombre = coalesce($1, nombre), precio = coalesce($2, precio) WHERE id = $3 returning id, nombre, precio',
      [data.nombre ?? null, data.precio ?? null, id]
    )
    return result.rows[0] || null
  }

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM productos WHERE id = $1 returning id', [id]
    )
    return result.rows[0] || null
  }

  async search(filtros) {
    const condiciones = [];
    const valores = [];
    let parametroIndex = 1;

    if (filtros.nombre) {
      condiciones.push(`nombre ILIKE $${parametroIndex}`);
      valores.push(`%${filtros.nombre}%`);
      parametroIndex++;
    }

    if (filtros.minPrecio !== null) {
      condiciones.push(`precio >= $${parametroIndex}`);
      valores.push(filtros.minPrecio);
      parametroIndex++;
    }

    if (filtros.maxPrecio !== null) {
      condiciones.push(`precio <= $${parametroIndex}`);
      valores.push(filtros.maxPrecio);
      parametroIndex++;
    }

    const whereClause = condiciones.length > 0 
      ? `WHERE ${condiciones.join(' AND ')}`
      : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM productos
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, valores);
    const total = parseInt(countResult.rows[0].total);

    const offset = (filtros.page - 1) * filtros.limit;

    valores.push(filtros.limit);
    const limitParam = parametroIndex;
    parametroIndex++;

    valores.push(offset);
    const offsetParam = parametroIndex;

    const dataQuery = `
      SELECT id, nombre, precio, stock, descripcion
      FROM productos
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const dataResult = await pool.query(dataQuery, valores);

    return {
      data: dataResult.rows,
      total: total
    };
  }
}

module.exports = { ProductosRepository }
