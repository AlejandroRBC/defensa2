import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const ingresosService = {
    async obtenerIngresosActivos() {
        try {
            const response = await axios.get(`${API_URL}/ingresos/activos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener ingresos activos:', error);
            throw error;
        }
    },

    async obtenerDetalleIngreso(idregistro) {
        try {
            const response = await axios.get(`${API_URL}/ingresos/${idregistro}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener detalle de ingreso:', error);
            throw error;
        }
    },

    async crearIngreso(ingresoData) {
        try {
            const response = await axios.post(`${API_URL}/ingresos`, ingresoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear ingreso:', error);
            throw error;
        }
    },

    async obtenerReservasConfirmadas() {
        try {
            const response = await axios.get(`${API_URL}/reservas/confirmadas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            throw error;
        }
    }
};