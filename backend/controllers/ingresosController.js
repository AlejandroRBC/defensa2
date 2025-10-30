import { pool } from "../db/conexion.js"

export const ingresoController={
    async crear(req,res){
        const {idreserva,idhotel,nrohabitacion,fecha_entrada,hora_entrada,idclientes}=req.body
        const client = await pool.connect();
        try{
            await client.query('BEGIN')
            const verificarReserva = await client.query(
                `SELECT * 
                 FROM reserva r JOIN detalle_reserva dr
                 ON r.idreserva = dr.idreserva
                 WHERE r.idreserva = $1 AND r.estado ='CONFIRMADA'`,
                 [idreserva]
            
            );
            if(verificarReserva.rows.length ===0){
                throw new Error('Reserva no encontrada o estado no confirmado')
            }

            const verificarHabitacion = await client.query(
                `SELECT estado
                 FROM habitacion
                 WHERE idhotel = $1
                 AND nrohabitacion = $2`,
                [idhotel,nrohabitacion])

            if(verificarHabitacion.rows.length===0){
                throw new Error('No existe la habitacion')
            }

            if(verificarHabitacion.rows[0].estado !=='DISPONIBLE'){
                throw new Error('Habitacion ocupada')
            }

            const registroResultado = await client.query(
                `INSERT INTO registro_ingreso(fecha_entrada, hora_entrada, idreserva, idhotel, nrohabitacion) 
                VALUES($1,$2,$3,$4,$5)
                RETURNING idregistro`,
                [
                    fecha_entrada || new Date().toISOString().split('T')[0],
                    hora_entrada || new Date().toTimeString().split(' ')[0],
                    idreserva,
                    idhotel,
                    nrohabitacion
                ]
            )
            const idregistro =  registroResultado.rows[0].idregistro;

            if(idclientes && idclientes.length>0){
                for(let idcliente of idclientes){
                    await client.query(
                        `INSERT INTO registra(idcliente,idregistro) VALUES($1,$2)`,
                        [idcliente,idregistro]
                    )
                }
            }

            await client.query(
                `UPDATE habitacion
                 SET estado = 'OCUPADA'
                 WHERE idhotel = $1
                 AND nrohabitacion = $2`,
                [idhotel,nrohabitacion])

            await client.query(
                `UPDATE reserva SET estado = 'CHECKIN' WHERE idreserva = $1`,
                [idreserva]
            );
            await client.query('COMMIT');

            res.json({ 
                mensaje: "Ingreso registrado exitosamente",
                idregistro,
                idreserva,
                habitacion: `${idhotel}-${nrohabitacion}`
            });
        }catch(error){
            await client.query('ROLLBACK');
            console.error("Error al registrar el ingreso: ",error);
            res.status(500).json({
                error:'Error al registrar ingreso',
                detalle:error.message
            })
        }finally{
            client.release();
        }
    },
    async listarActivos(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          ri.idregistro,
          ri.fecha_entrada,
          ri.hora_entrada,
          ri.idreserva,
          ri.idhotel,
          ri.nrohabitacion,
          h.nombreh,
          hab.tipohabitacion,
          STRING_AGG(p.nombre || ' ' || p.apellido, ', ') as clientes
        FROM registro_ingreso ri
        JOIN hotel h ON ri.idhotel = h.idhotel
        JOIN habitacion hab ON ri.idhotel = hab.idhotel AND ri.nrohabitacion = hab.nrohabitacion
        LEFT JOIN registra r ON ri.idregistro = r.idregistro
        LEFT JOIN cliente c ON r.idcliente = c.idcliente
        LEFT JOIN persona p ON c.idcliente = p.id
        WHERE ri.fecha_salida IS NULL
        GROUP BY ri.idregistro, ri.fecha_entrada, ri.hora_entrada, 
                 ri.idreserva, ri.idhotel, ri.nrohabitacion, 
                 h.nombreh, hab.tipohabitacion
        ORDER BY ri.fecha_entrada DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al listar ingresos activos:", error);
      res.status(500).json({ error: "Error al listar ingresos activos" });
    }
  },
  async obtenerDetalle(req, res) {
    const { idregistro } = req.params;
    try {
      const result = await pool.query(`
        SELECT 
          ri.*,
          h.nombreh,
          hab.tipohabitacion,
          hab.precio,
          r.fecha_inicio,
          r.fecha_fin,
          r.costo_total,
          json_agg(
            json_build_object(
              'id', p.id,
              'nombre', p.nombre,
              'apellido', p.apellido,
              'telefono', p.telefono,
              'email', c.email
            )
          ) as clientes
        FROM registro_ingreso ri
        JOIN hotel h ON ri.idhotel = h.idhotel
        JOIN habitacion hab ON ri.idhotel = hab.idhotel AND ri.nrohabitacion = hab.nrohabitacion
        JOIN reserva r ON ri.idreserva = r.idreserva
        LEFT JOIN registra reg ON ri.idregistro = reg.idregistro
        LEFT JOIN cliente c ON reg.idcliente = c.idcliente
        LEFT JOIN persona p ON c.idcliente = p.id
        WHERE ri.idregistro = $1
        GROUP BY ri.idregistro, h.nombreh, hab.tipohabitacion, hab.precio,
                 r.fecha_inicio, r.fecha_fin, r.costo_total
      `, [idregistro]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Ingreso no encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener detalle de ingreso:", error);
      res.status(500).json({ error: "Error al obtener detalle de ingreso" });
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
          r.idcliente,
          p.nombre || ' ' || p.apellido as cliente_nombre,
          dr.idhotel,
          dr.nrohabitacion,
          h.nombreh as hotel_nombre,
          hab.tipohabitacion,
          hab.estado as habitacion_estado
        FROM reserva r
        JOIN cliente c ON r.idcliente = c.idcliente
        JOIN persona p ON c.idcliente = p.id
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
  }
}