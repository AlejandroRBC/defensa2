import { pool } from "../db/conexion.js";

export const danosController = {
  async listar(req, res) {
    const sqlQuery = `
      SELECT d.iddano, d.observaciones, d.monto, 
             p.nombre || ' ' || p.apellido as empleado,
             e.cargo as cargo_empleado,
             ri.fecha_entrada, ri.fecha_salida,
             h.nombreh as hotel,
             hab.nrohabitacion,
             d.idregistro
      FROM dano d
      JOIN empleado e ON d.idempleado = e.idempleado
      JOIN persona p ON e.idempleado = p.id
      JOIN registro_ingreso ri ON d.idregistro = ri.idregistro
      JOIN hotel h ON ri.idhotel = h.idhotel
      JOIN habitacion hab ON ri.idhotel = hab.idhotel AND ri.nrohabitacion = hab.nrohabitacion
      ORDER BY d.iddano DESC
    `;

    try {
      const result = await pool.query(sqlQuery);
      res.json({
        datos: result.rows,
        sql: sqlQuery
      });
    } catch (error) {
      console.error("Error al listar daños:", error);
      res.status(500).json({ 
        error: "Error al listar daños",
        sql: sqlQuery
      });
    }
  },

  async crear(req, res) {
    const { observaciones, monto, idempleado, idregistro } = req.body;
    
    const sqlQuery = `
      INSERT INTO dano (observaciones, monto, idempleado, idregistro) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;

    try {
      const result = await pool.query(sqlQuery, [observaciones, monto, idempleado, idregistro]);
      
      res.status(201).json({ 
        mensaje: "Daño reportado correctamente",
        dato: result.rows[0],
        sql: sqlQuery
      });
    } catch (error) {
      console.error("Error al reportar daño:", error);
      res.status(500).json({ 
        error: "Error al reportar daño",
        sql: sqlQuery
      });
    }
  },

  async obtenerRegistrosIngreso(req, res) {
    const sqlQuery = `
      SELECT ri.idregistro, ri.fecha_entrada, ri.fecha_salida,
             h.nombreh as hotel, hab.nrohabitacion,
             p.nombre || ' ' || p.apellido as cliente
      FROM registro_ingreso ri
      JOIN hotel h ON ri.idhotel = h.idhotel
      JOIN habitacion hab ON ri.idhotel = hab.idhotel AND ri.nrohabitacion = hab.nrohabitacion
      JOIN registra reg ON ri.idregistro = reg.idregistro
      JOIN cliente c ON reg.idcliente = c.idcliente
      JOIN persona p ON c.idcliente = p.id
      ORDER BY ri.fecha_entrada DESC
    `;

    try {
      const result = await pool.query(sqlQuery);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener registros de ingreso:", error);
      res.status(500).json({ error: "Error al obtener registros" });
    }
  },

  async obtenerEmpleados(req, res) {
    const sqlQuery = `
      SELECT e.idempleado, p.nombre, p.apellido, e.cargo
      FROM empleado e
      JOIN persona p ON e.idempleado = p.id
      ORDER BY p.nombre
    `;

    try {
      const result = await pool.query(sqlQuery);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      res.status(500).json({ error: "Error al obtener empleados" });
    }
  }
};