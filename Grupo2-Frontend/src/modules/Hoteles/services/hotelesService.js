
import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const hotelesService = {
    async obtenerHoteles() {
        try {
            const response = await axios.get(`${API_URL}/hoteles`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener hoteles:', error);
            throw error;
        }
    },

    async obtenerHotelPorId(id) {
        try {
            const response = await axios.get(`${API_URL}/hoteles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener hotel:', error);
            throw error;
        }
    },

    async crearHotel(hotelData) {
        try {
            const response = await axios.post(`${API_URL}/hoteles`, hotelData);
            return response.data;
        } catch (error) {
            console.error('Error al crear hotel:', error);
            throw error;
        }
    },

    async actualizarHotel(id, hotelData) {
        try {
            const response = await axios.put(`${API_URL}/hoteles/${id}`, hotelData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar hotel:', error);
            throw error;
        }
    },

    async eliminarHotel(id) {
        try {
            const response = await axios.delete(`${API_URL}/hoteles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar hotel:', error);
            throw error;
        }
    }
};