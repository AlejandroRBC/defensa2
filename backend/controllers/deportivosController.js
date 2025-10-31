import { pool } from "../db/conexion.js";

export const deportivosController = {
    // Obtener todas las reservas deportivas
    async obtenerReservas(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    r.cod_reserva,
                    r.fecha,
                    r.hora_inicio,
                    r.hora_fin,
                    r.estado_reserva,
                    r.monto_total,
                    p_cliente.nombre as cliente_nombre,
                    p_cliente.apellido_p as cliente_apellido,
                    p_empleado.nombre as empleado_nombre,
                    p_empleado.apellido_p as empleado_apellido,
                    c.cod_cancha,
                    ed.nombre as espacio_nombre,
                    d.nombre as disciplina_nombre
                FROM RESERVA r
                JOIN CLIENTE cl ON r.ci_cliente = cl.ci_cliente
                JOIN PERSONA p_cliente ON cl.ci_cliente = p_cliente.ci
                JOIN EMPLEADO e ON r.ci_empleado = e.ci_empleado
                JOIN PERSONA p_empleado ON e.ci_empleado = p_empleado.ci
                JOIN CANCHA c ON r.cod_cancha = c.cod_cancha
                JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio
                JOIN DISCIPLINA d ON r.cod_disciplina = d.cod_disciplina
                ORDER BY r.fecha DESC, r.hora_inicio DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error("Error al obtener reservas deportivas:", error);
            res.status(500).json({ error: "Error al obtener reservas deportivas" });
        }
    },

    // Crear una nueva reserva deportiva
    // Modificar el método crearReserva para no recibir cod_reserva
// Crear una nueva reserva deportiva - VERSIÓN SIMPLIFICADA
async crearReserva(req, res) {
    const client = await pool.connect();
    try {
        const {
            ci_cliente,
            ci_empleado,
            cod_cancha,
            cod_disciplina,
            fecha,
            hora_inicio,
            hora_fin,
            monto_total,
            estado_reserva
        } = req.body;

        console.log('Datos recibidos para nueva reserva:', req.body);

        await client.query('BEGIN');

        // Verificar que el cliente existe
        const clienteExiste = await client.query(
            'SELECT ci_cliente FROM CLIENTE WHERE ci_cliente = $1',
            [ci_cliente]
        );

        if (clienteExiste.rows.length === 0) {
            throw new Error('El cliente no existe');
        }

        // Verificar que el empleado existe
        const empleadoExiste = await client.query(
            'SELECT ci_empleado FROM EMPLEADO WHERE ci_empleado = $1',
            [ci_empleado]
        );

        if (empleadoExiste.rows.length === 0) {
            throw new Error('El empleado no existe');
        }

        // Verificar que la cancha existe
        const canchaExiste = await client.query(
            'SELECT cod_cancha FROM CANCHA WHERE cod_cancha = $1',
            [cod_cancha]
        );

        if (canchaExiste.rows.length === 0) {
            throw new Error('La cancha no existe');
        }

        // Verificar que la disciplina existe
        const disciplinaExiste = await client.query(
            'SELECT cod_disciplina FROM DISCIPLINA WHERE cod_disciplina = $1',
            [cod_disciplina]
        );

        if (disciplinaExiste.rows.length === 0) {
            throw new Error('La disciplina no existe');
        }

        // Insertar la nueva reserva (cod_reserva es autoincremental)
        const result = await client.query(`
            INSERT INTO RESERVA (
                fecha, hora_inicio, hora_fin, estado_reserva, 
                monto_total, ci_empleado, ci_cliente, cod_cancha, cod_disciplina
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING cod_reserva, fecha, hora_inicio, hora_fin, estado_reserva, monto_total
        `, [
            fecha,
            hora_inicio,
            hora_fin,
            estado_reserva,
            monto_total,
            ci_empleado,
            ci_cliente,
            cod_cancha,
            cod_disciplina
        ]);

        await client.query('COMMIT');
        
        console.log('Reserva creada exitosamente:', result.rows[0]);
        
        res.status(201).json({ 
            mensaje: "Reserva deportiva creada correctamente",
            reserva: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al crear reserva deportiva:", error);
        res.status(500).json({ 
            error: "Error al crear reserva deportiva",
            detalle: error.message
        });
    } finally {
        client.release();
    }
},

// Modificar el método obtenerReservaPorCodigo para buscar por número

// Obtener reserva por código - VERSIÓN MEJORADA CON CONTADOR DE JUGADORES
async obtenerReservaPorCodigo(req, res) {
    try {
        const { cod_reserva } = req.params;
        
        console.log('Buscando reserva con código:', cod_reserva);
        
        // Validar que sea un número
        if (isNaN(cod_reserva)) {
            return res.status(400).json({ 
                error: "El código de reserva debe ser un número",
                encontrada: false
            });
        }

        const result = await pool.query(`
            SELECT 
                r.cod_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.estado_reserva,
                r.monto_total,
                r.ci_cliente,
                r.ci_empleado,
                r.cod_cancha,
                r.cod_disciplina,
                p_cliente.nombre as cliente_nombre,
                p_cliente.apellido_p as cliente_apellido,
                p_empleado.nombre as empleado_nombre,
                p_empleado.apellido_p as empleado_apellido,
                c.cod_espacio,
                c.tipo_superficie,
                c.techado,
                ed.nombre as espacio_nombre,
                d.nombre as disciplina_nombre,
                COUNT(i.ci_cliente) as numero_jugadores
            FROM RESERVA r
            JOIN CLIENTE cl ON r.ci_cliente = cl.ci_cliente
            JOIN PERSONA p_cliente ON cl.ci_cliente = p_cliente.ci
            JOIN EMPLEADO e ON r.ci_empleado = e.ci_empleado
            JOIN PERSONA p_empleado ON e.ci_empleado = p_empleado.ci
            JOIN CANCHA c ON r.cod_cancha = c.cod_cancha
            JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio
            JOIN DISCIPLINA d ON r.cod_disciplina = d.cod_disciplina
            LEFT JOIN INGRESA i ON r.cod_reserva = i.cod_reserva
            WHERE r.cod_reserva = $1
            GROUP BY 
                r.cod_reserva, r.fecha, r.hora_inicio, r.hora_fin, r.estado_reserva, r.monto_total,
                r.ci_cliente, r.ci_empleado, r.cod_cancha, r.cod_disciplina,
                p_cliente.nombre, p_cliente.apellido_p, p_empleado.nombre, p_empleado.apellido_p,
                c.cod_espacio, c.tipo_superficie, c.techado, ed.nombre, d.nombre
        `, [parseInt(cod_reserva)]);

        console.log('Resultado de búsqueda ppp:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: "Reserva no encontrada",
                encontrada: false
            });
        }

        // Obtener detalles de los jugadores que ingresaron
        const jugadoresResult = await pool.query(`
            SELECT 
                i.ci_cliente,
                p.nombre,
                p.apellido_p,
                i.hora_ingreso,
                i.hora_salida
            FROM INGRESA i
            JOIN PERSONA p ON i.ci_cliente = p.ci
            WHERE i.cod_reserva = $1
            ORDER BY i.hora_ingreso
        `, [parseInt(cod_reserva)]);

        const reserva = result.rows[0];
        reserva.jugadores = jugadoresResult.rows;
        reserva.numero_jugadores = parseInt(reserva.numero_jugadores);

        res.json({
            encontrada: true,
            reserva: reserva
        });

    } catch (error) {
        console.error("Error al obtener reserva por código:", error);
        res.status(500).json({ 
            error: "Error al obtener la reserva",
            encontrada: false
        });
    }
},

    // Obtener espacios deportivos con estadísticas
    async obtenerEspacios(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    ed.cod_espacio,
                    ed.nombre,
                    ed.ubicacion,
                    ed.capacidad,
                    ed.estado,
                    COUNT(DISTINCT c.cod_cancha) as nro_canchas,
                    COUNT(r.cod_reserva) as nro_reservas,
                    COALESCE(SUM(r.monto_total), 0) as total_pagos
                FROM ESPACIO_DEPORTIVO ed
                LEFT JOIN CANCHA c ON ed.cod_espacio = c.cod_espacio
                LEFT JOIN RESERVA r ON c.cod_cancha = r.cod_cancha
                GROUP BY ed.cod_espacio, ed.nombre, ed.ubicacion, ed.capacidad, ed.estado
                ORDER BY ed.cod_espacio
            `);
            res.json(result.rows);
        } catch (error) {
            console.error("Error al obtener espacios deportivos:", error);
            res.status(500).json({ error: "Error al obtener espacios deportivos" });
        }
    },

    // Crear un nuevo espacio deportivo
    async crearEspacio(req, res) {
        try {
            const {
                cod_espacio,
                nombre,
                ubicacion,
                capacidad,
                estado,
                descripcion
            } = req.body;

            const result = await pool.query(`
                INSERT INTO ESPACIO_DEPORTIVO (
                    cod_espacio, nombre, ubicacion, capacidad, estado, descripcion
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [
                cod_espacio,
                nombre,
                ubicacion,
                capacidad,
                estado || 'ACTIVO',
                descripcion || null
            ]);

            res.status(201).json({ 
                mensaje: "Espacio deportivo creado correctamente",
                espacio: result.rows[0]
            });

        } catch (error) {
            console.error("Error al crear espacio deportivo:", error);
            res.status(500).json({ 
                error: "Error al crear espacio deportivo",
                detalle: error.message
            });
        }
    },

    // Obtener datos para los selects del formulario
    async obtenerDatosFormulario(req, res) {
        try {
            const [clientes, empleados, espacios, canchas, disciplinas] = await Promise.all([
                pool.query(`
                    SELECT p.ci as id, p.nombre, p.apellido_p, p.telefono 
                    FROM PERSONA p 
                    JOIN CLIENTE c ON p.ci = c.ci_cliente 
                    ORDER BY p.nombre
                `),
                pool.query(`
                    SELECT p.ci as id, p.nombre, p.apellido_p, e.salario 
                    FROM PERSONA p 
                    JOIN EMPLEADO e ON p.ci = e.ci_empleado 
                    ORDER BY p.nombre
                `),
                pool.query('SELECT cod_espacio, nombre FROM ESPACIO_DEPORTIVO ORDER BY nombre'),
                pool.query(`
                    SELECT c.cod_cancha, c.tipo_superficie, ed.nombre as espacio_nombre 
                    FROM CANCHA c 
                    JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio 
                    ORDER BY ed.nombre, c.cod_cancha
                `),
                pool.query('SELECT cod_disciplina, nombre FROM DISCIPLINA ORDER BY nombre')
            ]);

            res.json({
                clientes: clientes.rows,
                empleados: empleados.rows,
                espacios: espacios.rows,
                canchas: canchas.rows,
                disciplinas: disciplinas.rows
            });

        } catch (error) {
            console.error("Error al obtener datos del formulario:", error);
            res.status(500).json({ error: "Error al obtener datos del formulario" });
        }
    },

    // Método para obtener canchas por espacio deportivo
async obtenerCanchasPorEspacio(req, res) {
    try {
        const { cod_espacio } = req.params;
        
        console.log('Buscando canchas para espacio:', cod_espacio); // Debug
        
        const result = await pool.query(`
            SELECT 
                c.cod_cancha, 
                c.tipo_superficie, 
                c.techado,
                ed.nombre as espacio_nombre
            FROM CANCHA c
            JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio
            WHERE c.cod_espacio = $1
            ORDER BY c.cod_cancha
        `, [cod_espacio]);

        console.log('Canchas encontradas:', result.rows.length); // Debug
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener canchas:", error);
        res.status(500).json({ 
            error: "Error al obtener canchas",
            detalle: error.message
        });
    }
},

// Método mejorado para obtener datos del formulario
async obtenerDatosFormulario(req, res) {
    try {
        console.log('Cargando datos del formulario...'); // Debug
        
        const [clientes, empleados, espacios, disciplinas] = await Promise.all([
            pool.query(`
                SELECT p.ci as id, p.nombre, p.apellido_p, p.telefono 
                FROM PERSONA p 
                JOIN CLIENTE c ON p.ci = c.ci_cliente 
                WHERE p.ci IS NOT NULL
                ORDER BY p.nombre
            `),
            pool.query(`
                SELECT p.ci as id, p.nombre, p.apellido_p, e.salario 
                FROM PERSONA p 
                JOIN EMPLEADO e ON p.ci = e.ci_empleado 
                WHERE p.ci IS NOT NULL
                ORDER BY p.nombre
            `),
            pool.query(`
                SELECT cod_espacio, nombre 
                FROM ESPACIO_DEPORTIVO 
                WHERE cod_espacio IS NOT NULL
                ORDER BY nombre
            `),
            pool.query(`
                SELECT cod_disciplina, nombre 
                FROM DISCIPLINA 
                WHERE cod_disciplina IS NOT NULL
                ORDER BY nombre
            `)
        ]);

        // Para las canchas, obtenemos todas y las agrupamos por espacio
        const todasCanchas = await pool.query(`
            SELECT 
                c.cod_cancha, 
                c.tipo_superficie, 
                c.techado,
                c.cod_espacio,
                ed.nombre as espacio_nombre
            FROM CANCHA c
            JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio
            WHERE c.cod_cancha IS NOT NULL
            ORDER BY c.cod_espacio, c.cod_cancha
        `);

        console.log('Datos cargados:', {
            clientes: clientes.rows.length,
            empleados: empleados.rows.length,
            espacios: espacios.rows.length,
            canchas: todasCanchas.rows.length,
            disciplinas: disciplinas.rows.length
        }); // Debug

        res.json({
            clientes: clientes.rows,
            empleados: empleados.rows,
            espacios: espacios.rows,
            canchas: todasCanchas.rows, // Enviamos todas las canchas
            disciplinas: disciplinas.rows
        });

    } catch (error) {
        console.error("Error al obtener datos del formulario:", error);
        res.status(500).json({ 
            error: "Error al obtener datos del formulario",
            detalle: error.message
        });
    }
},

    // Obtener disciplinas por cancha
    async obtenerDisciplinasPorCancha(req, res) {
        try {
            const { cod_cancha } = req.params;
            const result = await pool.query(`
                SELECT d.cod_disciplina, d.nombre
                FROM DISCIPLINA d
                JOIN TIENE t ON d.cod_disciplina = t.cod_disciplina
                WHERE t.cod_cancha = $1
                ORDER BY d.nombre
            `, [cod_cancha]);

            res.json(result.rows);
        } catch (error) {
            console.error("Error al obtener disciplinas:", error);
            res.status(500).json({ error: "Error al obtener disciplinas" });
        }
    },
    // Agregar este nuevo método al controlador
// Obtener reserva por código - VERSIÓN CORREGIDA
async obtenerReservaPorCodigo(req, res) {
    try {
        const { cod_reserva } = req.params;
        
        console.log('Buscando reserva con código:', cod_reserva);
        
        // Validar que sea un número
        if (isNaN(cod_reserva)) {
            return res.status(400).json({ 
                error: "El código de reserva debe ser un número",
                encontrada: false
            });
        }

        const result = await pool.query(`
            SELECT 
                r.cod_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.estado_reserva,
                r.monto_total,
                r.ci_cliente,
                r.ci_empleado,
                r.cod_cancha,
                r.cod_disciplina,
                p_cliente.nombre as cliente_nombre,
                p_cliente.apellido_p as cliente_apellido,
                p_empleado.nombre as empleado_nombre,
                p_empleado.apellido_p as empleado_apellido,
                c.cod_espacio,
                ed.nombre as espacio_nombre,
                d.nombre as disciplina_nombre
            FROM RESERVA r
            JOIN CLIENTE cl ON r.ci_cliente = cl.ci_cliente
            JOIN PERSONA p_cliente ON cl.ci_cliente = p_cliente.ci
            JOIN EMPLEADO e ON r.ci_empleado = e.ci_empleado
            JOIN PERSONA p_empleado ON e.ci_empleado = p_empleado.ci
            JOIN CANCHA c ON r.cod_cancha = c.cod_cancha
            JOIN ESPACIO_DEPORTIVO ed ON c.cod_espacio = ed.cod_espacio
            JOIN DISCIPLINA d ON r.cod_disciplina = d.cod_disciplina
            WHERE r.cod_reserva = $1
        `, [parseInt(cod_reserva)]);

        console.log('Resultado de búsqueda:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: "Reserva no encontrada",
                encontrada: false
            });
        }

        res.json({
            encontrada: true,
            reserva: result.rows[0]
        });

    } catch (error) {
        console.error("Error al obtener reserva por código:", error);
        res.status(500).json({ 
            error: "Error al obtener la reserva",
            encontrada: false
        });
    }
},



  async obtenerDatosEspacio(req, res) {
    try {
      const { cod_espacio } = req.params;

      const query = `
        SELECT 
          e.cod_espacio,
          e.nombre,
          COALESCE(COUNT(DISTINCT c.cod_cancha), 0) AS nro_canchas,
          COALESCE(COUNT(DISTINCT r.cod_reserva), 0) AS nro_reservas,
          COALESCE(SUM(p.monto), 0) AS total_pago
        FROM espacio_deportivo e
        LEFT JOIN cancha c ON e.cod_espacio = c.cod_espacio
        LEFT JOIN reserva r ON c.cod_cancha = r.cod_cancha
        LEFT JOIN pago p ON r.cod_reserva = p.cod_reserva
        WHERE e.cod_espacio = $1
        GROUP BY e.cod_espacio, e.nombre
      `;

      const result = await pool.query(query, [cod_espacio]);

      if (result.rows.length === 0) {
        return res.status(404).json({ mensaje: "Espacio no encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener datos del espacio:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  },
};