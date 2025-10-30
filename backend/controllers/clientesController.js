import { pool } from "../db/conexion.js";

export const clientesController = {
  async listar(req, res) {
    try {
      const result = await pool.query(`
        SELECT p.ci, p.nombre, p.apellido, p.telefono, p.fechanaci, p.sexo, p.nacionalidad,
               c.categoria, c.email
        FROM persona p
        JOIN cliente c ON p.ci = c.idcliente
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
    try {
      // Insertar persona usando el ci manual (CI)
      await pool.query(
        `INSERT INTO persona (ci, nombre, apellido, telefono, fechanaci, sexo, nacionalidad)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [ci, nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad]
      );
  
      // Insertar cliente con mismo ci
      await pool.query(
        `INSERT INTO cliente (idcliente, categoria, email)
         VALUES ($1,$2,$3)`,
        [ci, categoria, email]
      );
  
      res.json({ mensaje: "Cliente agregado correctamente" });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      res.status(500).json({ error: "Error al crear cliente" });
    }
  }
  ,

  async actualizar(req, res) {
    const { ci } = req.params;
    const { nombre, apellido, telefono, fechanaci, sexo, nacionalidad, categoria, email } = req.body;
    try {
      await pool.query(
        `UPDATE persona
         SET nombre=$1, apellido=$2, telefono=$3, fechanaci=$4, sexo=$5, nacionalidad=$6
         WHERE ci=$7`,
        [nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad, ci]
      );

      await pool.query(
        `UPDATE cliente SET categoria=$1, email=$2 WHERE idcliente=$3`,
        [categoria, email, ci]
      );
      res.json({ mensaje: "Cliente actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      res.status(500).json({ error: "Error al actualizar cliente" });
    }
  },

  async eliminar(req, res) {
    const { ci } = req.params;
    try {
      await pool.query("DELETE FROM cliente WHERE idcliente=$1", [ci]);
      await pool.query("DELETE FROM persona WHERE ci=$1", [ci]);
      res.json({ mensaje: "Cliente eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      res.status(500).json({ error: "Error al eliminar cliente" });
    }
  },
};
