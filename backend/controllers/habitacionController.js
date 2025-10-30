import { pool } from "../db/conexion.js";

export const habitacionController = {
  //Listar todas las habitaciones con su hotel
  async listar(req, res) {
    try {
      const result = await pool.query(`
        SELECT h.idhotel, h.nrohabitacion, h.tipohabitacion, h.capacidad,
               h.estado, h.precio, h.nro_piso, ho.nombreh AS nombre_hotel
        FROM habitacion h
        JOIN hotel ho ON h.idhotel = ho.idhotel
        ORDER BY h.idhotel, h.nrohabitacion;
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al listar habitaciones:", error);
      res.status(500).json({ error: "Error al listar habitaciones" });
    }
  },

  //Crear una nueva habitación asignada a un hotel
  async crear(req, res) {
    const { idhotel, nrohabitacion, tipohabitacion, capacidad, estado, precio, nro_piso } = req.body;

    try {
      await pool.query(
        `INSERT INTO habitacion (idhotel, nrohabitacion, tipohabitacion, capacidad, estado, precio, nro_piso)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [idhotel, nrohabitacion, tipohabitacion, capacidad, estado, precio, nro_piso]
      );
      res.json({ mensaje: "Habitación asignada correctamente al hotel" });
    } catch (error) {
      console.error("Error al crear habitación:", error);
      res.status(500).json({ error: "Error al crear habitación" });
    }
  },

  // Actualizar una habitación (usando clave compuesta)
  async actualizar(req, res) {
    const { idhotel, nrohabitacion } = req.params;
    const { tipohabitacion, capacidad, estado, precio, nro_piso } = req.body;

    try {
      const result = await pool.query(
        `UPDATE habitacion
         SET tipohabitacion = $1, capacidad = $2, estado = $3, precio = $4, nro_piso = $5
         WHERE idhotel = $6 AND nrohabitacion = $7
         RETURNING *`,
        [tipohabitacion, capacidad, estado, precio, nro_piso, idhotel, nrohabitacion]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ mensaje: "Habitación no encontrada" });
      }

      res.json({ mensaje: "Habitación actualizada correctamente", habitacion: result.rows[0] });
    } catch (error) {
      console.error("Error al actualizar habitación:", error);
      res.status(500).json({ error: "Error al actualizar habitación" });
    }
  },

  // Eliminar una habitación (usando clave compuesta)
  async eliminar(req, res) {
    const { idhotel, nrohabitacion } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM habitacion WHERE idhotel = $1 AND nrohabitacion = $2`,
        [idhotel, nrohabitacion]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ mensaje: "Habitación no encontrada" });
      }

      res.json({ mensaje: "Habitación eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar habitación:", error);
      res.status(500).json({ error: "Error al eliminar habitación" });
    }
  },
};
