import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const empleadosService = {
    async obtenerEmpleados() {
        try {
            const response = await axios.get(`${API_URL}/empleados`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            throw error;
        }
    },

    async obtenerEmpleadoPorId(id) {
        try {
            const response = await axios.get(`${API_URL}/empleados/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empleado:', error);
            throw error;
        }
    },

    async crearEmpleado(empleadoData) {
        try {
            const response = await axios.post(`${API_URL}/empleados`, empleadoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear empleado:', error);
            throw error;
        }
    },

    async actualizarEmpleado(id, empleadoData) {
        try {
            const response = await axios.put(`${API_URL}/empleados/${id}`, empleadoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            throw error;
        }
    },

    async eliminarEmpleado(id) {
        try {
            const response = await axios.delete(`${API_URL}/empleados/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            throw error;
        }
    }
};