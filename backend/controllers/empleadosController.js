import { pool } from "../db/conexion.js";

export const empleadosController = {
  async listar(req, res) {
    try {
      const result = await pool.query(`
        SELECT p.id, p.nombre, p.apellido, p.telefono, p.fechanaci, p.sexo, p.nacionalidad,
               e.cargo, e.salario, e.turno
        FROM persona p
        JOIN empleado e ON p.id = e.idempleado
        ORDER BY p.id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al listar empleados:", error);
      res.status(500).json({ error: "Error al listar empleados" });
    }
  },

  async crear(req, res) {
    const { id, nombre, apellido, telefono, fechanaci, sexo, nacionalidad, cargo, salario, turno } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar persona usando el id manual (CI)
      await client.query(
        `INSERT INTO persona (id, nombre, apellido, telefono, fechanaci, sexo, nacionalidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad]
      );

      // Insertar empleado con mismo id
      await client.query(
        `INSERT INTO empleado (idempleado, cargo, salario, turno)
         VALUES ($1, $2, $3, $4)`,
        [id, cargo, salario, turno]
      );

      await client.query('COMMIT');
      res.json({ mensaje: "Empleado agregado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al crear empleado:", error);
      
      if (error.code === '23505') { // Violación de unique constraint
        res.status(400).json({ error: "El ID (carnet) ya existe" });
      } else {
        res.status(500).json({ error: "Error al crear empleado" });
      }
    } finally {
      client.release();
    }
  },

  async actualizar(req, res) {
    const { id } = req.params;
    const { nombre, apellido, telefono, fechanaci, sexo, nacionalidad, cargo, salario, turno } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE persona
         SET nombre=$1, apellido=$2, telefono=$3, fechanaci=$4, sexo=$5, nacionalidad=$6
         WHERE id=$7`,
        [nombre, apellido, telefono, fechanaci === "" ? null : fechanaci, sexo, nacionalidad, id]
      );

      await client.query(
        `UPDATE empleado SET cargo=$1, salario=$2, turno=$3 WHERE idempleado=$4`,
        [cargo, salario, turno, id]
      );

      await client.query('COMMIT');
      res.json({ mensaje: "Empleado actualizado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al actualizar empleado:", error);
      res.status(500).json({ error: "Error al actualizar empleado" });
    } finally {
      client.release();
    }
  },

  async eliminar(req, res) {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar si el empleado tiene registros relacionados antes de eliminar
      const tieneRelaciones = await client.query(
        `SELECT 1 FROM dano WHERE idempleado = $1 LIMIT 1`,
        [id]
      );

      if (tieneRelaciones.rows.length > 0) {
        return res.status(400).json({ 
          error: "No se puede eliminar el empleado porque tiene registros de daños asociados" 
        });
      }

      await client.query("DELETE FROM empleado WHERE idempleado=$1", [id]);
      await client.query("DELETE FROM persona WHERE id=$1", [id]);

      await client.query('COMMIT');
      res.json({ mensaje: "Empleado eliminado correctamente" });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al eliminar empleado:", error);
      res.status(500).json({ error: "Error al eliminar empleado" });
    } finally {
      client.release();
    }
  }
};