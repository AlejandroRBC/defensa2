import { pool } from "../db/conexion.js";

export const clientesController = {
  async listar(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          p.ci as id,
          p.nombre,
          p.apellido_p as apellido,
          p.telefono,
          p.fechanaci,
          p.sexo,
          p.nacionalidad,
          c.categoria,
          c.email
        FROM persona p
        JOIN cliente c ON p.ci = c.ci_cliente
        ORDER BY p.ci
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al listar clientes:", error);
      res.status(500).json({ error: "Error al listar clientes" });
    }
  },

  async crear(req, res) {
    const { ci, nombre, apellido, telefono, fechanaci, sexo, nacionalidad, categoria, email } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar persona usando el ci manual (CI)
      await client.query(
        `INSERT INTO persona (ci, nombre, apellido_p, telefono, fechanaci, sexo, nacionalidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ci, nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad]
      );

      // Insertar cliente con mismo ci
      await client.query(
        `INSERT INTO cliente (ci_cliente, categoria, email)
         VALUES ($1, $2, $3)`,
        [ci, categoria, email]
      );

      await client.query('COMMIT');
      res.json({ mensaje: "Cliente agregado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al crear cliente:", error);
      
      if (error.code === '23505') { // Violación de unique constraint
        res.status(400).json({ error: "El CI ya existe" });
      } else {
        res.status(500).json({ error: "Error al crear cliente" });
      }
    } finally {
      client.release();
    }
  },

  async actualizar(req, res) {
    const { ci } = req.params;
    const { nombre, apellido, telefono, fechanaci, sexo, nacionalidad, categoria, email } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE persona
         SET nombre=$1, apellido_p=$2, telefono=$3, fechanaci=$4, sexo=$5, nacionalidad=$6
         WHERE ci=$7`,
        [nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad, ci]
      );

      await client.query(
        `UPDATE cliente SET categoria=$1, email=$2 WHERE ci_cliente=$3`,
        [categoria, email, ci]
      );

      await client.query('COMMIT');
      res.json({ mensaje: "Cliente actualizado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al actualizar cliente:", error);
      res.status(500).json({ error: "Error al actualizar cliente" });
    } finally {
      client.release();
    }
  },

  async eliminar(req, res) {
    const { ci } = req.params;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar si el cliente tiene reservas antes de eliminar
      const tieneReservas = await client.query(
        `SELECT 1 FROM reserva WHERE ci_cliente = $1 LIMIT 1`,
        [ci]
      );

      if (tieneReservas.rows.length > 0) {
        return res.status(400).json({ 
          error: "No se puede eliminar el cliente porque tiene reservas asociadas" 
        });
      }

      await client.query("DELETE FROM cliente WHERE ci_cliente=$1", [ci]);
      await client.query("DELETE FROM persona WHERE ci=$1", [ci]);

      await client.query('COMMIT');
      res.json({ mensaje: "Cliente eliminado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al eliminar cliente:", error);
      res.status(500).json({ error: "Error al eliminar cliente" });
    } finally {
      client.release();
    }
  }
};