import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const reservasService = {
    async obtenerReservas() {
        try {
            const response = await axios.get(`${API_URL}/reservas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            throw error;
        }
    },

    async obtenerReservaPorId(id) {
        try {
            const response = await axios.get(`${API_URL}/reservas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reserva:', error);
            throw error;
        }
    },

    async crearReserva(reservaData) {
        try {
            const response = await axios.post(`${API_URL}/reservas`, reservaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear reserva:', error);
            throw error;
        }
    },

    async actualizarReserva(id, reservaData) {
        try {
            const response = await axios.put(`${API_URL}/reservas/${id}`, reservaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar reserva:', error);
            throw error;
        }
    },

    async eliminarReserva(id) {
        try {
            const response = await axios.delete(`${API_URL}/reservas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
            throw error;
        }
    }
};
