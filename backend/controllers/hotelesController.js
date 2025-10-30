
import { pool } from "../db/conexion.js";

export const hotelesController = {
  async listar(req, res) {
    try {
      const result = await pool.query("SELECT * FROM hotel ORDER BY idhotel");
      res.json(result.rows);
    } catch (error) {
      console.error("Error al listar hoteles:", error);
      res.status(500).json({ error: "Error al listar hoteles" });
    }
  },

  async crear(req, res) {
    const { nombreh, direccion, telefonoh, categoria } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO hotel (nombreh, direccion, telefonoh, categoria) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [nombreh, direccion, telefonoh, categoria]
      );
      
      res.status(201).json({ 
        mensaje: "Hotel creado correctamente",
        hotel: result.rows[0]
      });
    } catch (error) {
      console.error("Error al crear hotel:", error);
      res.status(500).json({ error: "Error al crear hotel" });
    }
  },

  async actualizar(req, res) {
    const { id } = req.params;
    const { nombreh, direccion, telefonoh, categoria } = req.body;
    try {
      const result = await pool.query(
        `UPDATE hotel 
         SET nombreh=$1, direccion=$2, telefonoh=$3, categoria=$4 
         WHERE idhotel=$5 RETURNING *`,
        [nombreh, direccion, telefonoh, categoria, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Hotel no encontrado" });
      }

      res.json({ 
        mensaje: "Hotel actualizado correctamente",
        hotel: result.rows[0]
      });
    } catch (error) {
      console.error("Error al actualizar hotel:", error);
      res.status(500).json({ error: "Error al actualizar hotel" });
    }
  },

  async eliminar(req, res) {
    const { id } = req.params;
    try {
      // Verificar si el hotel existe
      const hotelExiste = await pool.query("SELECT idhotel FROM hotel WHERE idhotel = $1", [id]);
      if (hotelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Hotel no encontrado" });
      }

      // Verificar si hay habitaciones asociadas
      const tieneHabitaciones = await pool.query(
        "SELECT 1 FROM habitacion WHERE idhotel = $1 LIMIT 1", 
        [id]
      );
      
      if (tieneHabitaciones.rows.length > 0) {
        return res.status(400).json({ 
          error: "No se puede eliminar el hotel porque tiene habitaciones asociadas" 
        });
      }

      await pool.query("DELETE FROM hotel WHERE idhotel = $1", [id]);
      
      res.json({ mensaje: "Hotel eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar hotel:", error);
      res.status(500).json({ error: "Error al eliminar hotel" });
    }
  }
};