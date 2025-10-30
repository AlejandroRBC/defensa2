import { pool } from "../db/conexion.js";

export const reservasController = {
  async obtenerReservas(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          r.idreserva,
          r.fecha_inicio,
          r.fecha_fin,
          r.costo_total,
          r.estado,
          r.ci_cliente,
          p.nombre || ' ' || p.apellido as cliente_nombre,
          dr.idhotel,
          dr.nrohabitacion,
          h.nombreh as hotel_nombre,
          hab.tipohabitacion,
          hab.estado as habitacion_estado
        FROM reserva r
        JOIN cliente c ON r.ci_cliente = c.ci_cliente
        JOIN persona p ON c.ci_cliente = p.id
        JOIN detalle_reserva dr ON r.idreserva = dr.idreserva
        JOIN hotel h ON dr.idhotel = h.idhotel
        JOIN habitacion hab ON dr.idhotel = hab.idhotel AND dr.nrohabitacion = hab.nrohabitacion
        ORDER BY r.fecha_inicio DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
      res.status(500).json({ error: "Error al obtener reservas" });
    }
  },

  async obtenerReservasConfirmadas(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          r.idreserva,
          r.fecha_inicio,
          r.fecha_fin,
          r.costo_total,
          r.estado,
          r.ci_cliente,
          p.nombre || ' ' || p.apellido as cliente_nombre,
          dr.idhotel,
          dr.nrohabitacion,
          h.nombreh as hotel_nombre,
          hab.tipohabitacion,
          hab.estado as habitacion_estado
        FROM reserva r
        JOIN cliente c ON r.ci_cliente = c.ci_cliente
        JOIN persona p ON c.ci_cliente = p.id
        JOIN detalle_reserva dr ON r.idreserva = dr.idreserva
        JOIN hotel h ON dr.idhotel = h.idhotel
        JOIN habitacion hab ON dr.idhotel = hab.idhotel AND dr.nrohabitacion = hab.nrohabitacion
        WHERE r.estado = 'CONFIRMADA'
        ORDER BY r.fecha_inicio DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener reservas confirmadas:", error);
      res.status(500).json({ error: "Error al obtener reservas confirmadas" });
    }
  },

  async obtenerReservaPorId(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(`
        SELECT 
          r.idreserva,
          r.fecha_inicio,
          r.fecha_fin,
          r.costo_total,
          r.estado,
          r.ci_cliente,
          p.nombre || ' ' || p.apellido as cliente_nombre,
          dr.idhotel,
          dr.nrohabitacion,
          h.nombreh as hotel_nombre,
          hab.tipohabitacion,
          hab.estado as habitacion_estado
        FROM reserva r
        JOIN cliente c ON r.ci_cliente = c.ci_cliente
        JOIN persona p ON c.ci_cliente = p.id
        LEFT JOIN detalle_reserva dr ON r.idreserva = dr.idreserva
        LEFT JOIN hotel h ON dr.idhotel = h.idhotel
        LEFT JOIN habitacion hab ON dr.idhotel = hab.idhotel AND dr.nrohabitacion = hab.nrohabitacion
        WHERE r.idreserva = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener reserva por id:", error);
      res.status(500).json({ error: "Error al obtener la reserva" });
    }
  },

  async crearReserva(req, res) {
    const { fecha_inicio, fecha_fin, costo_total, estado, ci_cliente, idhotel, nrohabitacion } = req.body;
    try {
      await pool.query('BEGIN');

      const insertReserva = await pool.query(
        `INSERT INTO reserva (fecha_inicio, fecha_fin, costo_total, estado, ci_cliente)
         VALUES ($1,$2,$3,$4,$5) RETURNING idreserva`,
        [fecha_inicio || null, fecha_fin || null, costo_total || null, estado || null, ci_cliente || null]
      );

      const idreserva = insertReserva.rows[0].idreserva;

      if (idhotel && nrohabitacion) {
        await pool.query(
          `INSERT INTO detalle_reserva (idhotel, nrohabitacion, idreserva)
           VALUES ($1,$2,$3)`,
          [idhotel, nrohabitacion, idreserva]
        );
      }

      await pool.query('COMMIT');
      res.json({ mensaje: 'Reserva creada correctamente', idreserva });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error al crear reserva:', error);
      res.status(500).json({ error: 'Error al crear reserva' });
    }
  },

  async actualizarReserva(req, res) {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, costo_total, estado, ci_cliente, idhotel, nrohabitacion } = req.body;
    try {
      await pool.query('BEGIN');

      await pool.query(
        `UPDATE reserva SET fecha_inicio=$1, fecha_fin=$2, costo_total=$3, estado=$4, ci_cliente=$5
         WHERE idreserva=$6`,
        [fecha_inicio || null, fecha_fin || null, costo_total || null, estado || null, ci_cliente || null, id]
      );

      // Actualizar detalle_reserva: eliminar existente y crear nueva asociación si se envía habitación
      if (idhotel && nrohabitacion) {
        await pool.query(`DELETE FROM detalle_reserva WHERE idreserva=$1`, [id]);
        await pool.query(
          `INSERT INTO detalle_reserva (idhotel, nrohabitacion, idreserva) VALUES ($1,$2,$3)`,
          [idhotel, nrohabitacion, id]
        );
      }

      await pool.query('COMMIT');
      res.json({ mensaje: 'Reserva actualizada correctamente' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error al actualizar reserva:', error);
      res.status(500).json({ error: 'Error al actualizar reserva' });
    }
  },

  async eliminarReserva(req, res) {
    const { id } = req.params;
    try {
      await pool.query('BEGIN');
      await pool.query('DELETE FROM detalle_reserva WHERE idreserva=$1', [id]);
      await pool.query('DELETE FROM reserva WHERE idreserva=$1', [id]);
      await pool.query('COMMIT');
      res.json({ mensaje: 'Reserva eliminada correctamente' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error al eliminar reserva:', error);
      res.status(500).json({ error: 'Error al eliminar reserva' });
    }
  }
};