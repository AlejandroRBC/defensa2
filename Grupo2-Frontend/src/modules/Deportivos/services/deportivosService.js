import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const deportivosService = {
    // Reservas deportivas
    async obtenerReservas() {
        try {
            const response = await axios.get(`${API_URL}/deportivos/reservas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reservas deportivas:', error);
            throw error;
        }
    },

    async crearReserva(reservaData) {
        try {
            // Asegurar que la fecha esté en formato correcto
            const fechaFormateada = reservaData.fecha ? 
                reservaData.fecha.split('T')[0] : 
                new Date().toISOString().split('T')[0];

            const datosReserva = {
                ci_cliente: reservaData.idCliente,
                ci_empleado: reservaData.idEmpleado,
                cod_cancha: reservaData.codCancha,
                tipo_superficie: reservaData.tipo_superficie,
                cod_disciplina: reservaData.codDisciplina,
                fecha: fechaFormateada,
                hora_inicio: reservaData.horaInicio || '08:00',
                hora_fin: reservaData.horaFin || '10:00',
                monto_total: parseFloat(reservaData.montoTotal) || 100.00,
                estado_reserva: reservaData.estadoReserva || 'CONFIRMADA'
            };
            
            console.log('Enviando reserva:', datosReserva);
            
            const response = await axios.post(`${API_URL}/deportivos/reservas`, datosReserva);
            return response.data;
        } catch (error) {
            console.error('Error al crear reserva deportiva:', error);
            throw error;
        }
    },

    // Espacios deportivos
    async obtenerEspacios() {
        try {
            const response = await axios.get(`${API_URL}/deportivos/espacios`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener espacios deportivos:', error);
            throw error;
        }
    },

    async crearEspacio(espacioData) {
        try {
            const datosEspacio = {
                cod_espacio: parseInt(espacioData.codEspacio),
                nombre: espacioData.nombre,
                ubicacion: espacioData.ubicacion,
                capacidad: espacioData.capacidad ? parseInt(espacioData.capacidad) : null,
                estado: espacioData.estado || 'ACTIVO',
                descripcion: espacioData.descripcion
            };
            
            const response = await axios.post(`${API_URL}/deportivos/espacios`, datosEspacio);
            return response.data;
        } catch (error) {
            console.error('Error al crear espacio deportivo:', error);
            throw error;
        }
    },

    // Datos para formularios
    async obtenerDatosFormulario() {
        try {
            const response = await axios.get(`${API_URL}/deportivos/datos-formulario`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos del formulario:', error);
            throw error;
        }
    },

    // Obtener canchas por espacio
    async obtenerCanchasPorEspacio(codEspacio) {
        try {
            console.log('Buscando canchas para espacio:', codEspacio);
            const response = await axios.get(`${API_URL}/deportivos/canchas/${codEspacio}`);
            console.log('Canchas recibidas:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener canchas:', error);
            // Devolver array vacío en caso de error
            return [];
        }
    },

    // Obtener disciplinas por cancha
    async obtenerDisciplinasPorCancha(codCancha) {
        try {
            const response = await axios.get(`${API_URL}/deportivos/disciplinas/${codCancha}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener disciplinas:', error);
            // Devolver array vacío en caso de error
            return [];
        }
    },

    async obtenerReservaPorCodigo(codReserva) {
        try {
            const response = await axios.get(`${API_URL}/deportivos/reservas/${codReserva}`);
            return response.data;
        } catch (error) {
            // Si la reserva no existe, devolver un objeto indicando que no se encontró
            if (error.response && error.response.status === 404) {
                return { encontrada: false };
            }
            console.error('Error al obtener reserva por código:', error);
            throw error;
        }
    },
};