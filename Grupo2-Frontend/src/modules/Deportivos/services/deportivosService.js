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
            // Mapear los nombres de campos para que coincidan con la BD
            const datosReserva = {
                cod_reserva: reservaData.codReserva,
                ci_cliente: reservaData.idCliente,
                ci_empleado: reservaData.idEmpleado,
                cod_cancha: reservaData.codCancha,
                cod_disciplina: reservaData.codDisciplina,
                fecha: reservaData.fecha,
                hora_inicio: reservaData.horaInicio,
                hora_fin: reservaData.horaFin,
                monto_total: reservaData.montoTotal,
                estado_reserva: reservaData.estadoReserva
            };
            
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
            // Mapear los nombres de campos para que coincidan con la BD
            const datosEspacio = {
                cod_espacio: espacioData.codEspacio,
                nombre: espacioData.nombre,
                ubicacion: espacioData.ubicacion,
                capacidad: espacioData.capacidad,
                estado: espacioData.estado,
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
    // Método mejorado para obtener canchas por espacio
async obtenerCanchasPorEspacio(codEspacio) {
    try {
        console.log('Buscando canchas para espacio:', codEspacio); // Debug
        const response = await axios.get(`${API_URL}/deportivos/canchas/${codEspacio}`);
        console.log('Canchas recibidas:', response.data); // Debug
        return response.data;
    } catch (error) {
        console.error('Error al obtener canchas:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
        }
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
            throw error;
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