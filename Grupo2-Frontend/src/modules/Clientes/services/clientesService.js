import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const clientesService = {
    async obtenerClientes() {
        try {
            const response = await axios.get(`${API_URL}/clientes`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            throw error;
        }
    },

    async obtenerClientePorId(id) {
        try {
            const response = await axios.get(`${API_URL}/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            throw error;
        }
    },

    async crearCliente(clienteData) {
        try {
            const response = await axios.post(`${API_URL}/clientes`, clienteData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cliente:', error);
            throw error;
        }
    },

    async actualizarCliente(id, clienteData) {
        try {
            const response = await axios.put(`${API_URL}/clientes/${id}`, clienteData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            throw error;
        }
    },

    async eliminarCliente(id) {
        try {
            const response = await axios.delete(`${API_URL}/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            throw error;
        }
    }
};