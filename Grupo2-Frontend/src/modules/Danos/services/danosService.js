const API_URL = 'http://localhost:4000/danos';

export const danosService = {
  async listarDanos() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener daños');
    return await response.json();
  },

  async reportarDano(danoData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(danoData),
    });
    if (!response.ok) throw new Error('Error al reportar daño');
    return await response.json();
  },

  async obtenerRegistros() {
    const response = await fetch(`${API_URL}/registros`);
    if (!response.ok) throw new Error('Error al obtener registros');
    return await response.json();
  },

  async obtenerEmpleados() {
    const response = await fetch(`${API_URL}/empleados`);
    if (!response.ok) throw new Error('Error al obtener empleados');
    return await response.json();
  }
};

// Exportaciones individuales para facilitar el import
export const { listarDanos, reportarDano, obtenerRegistros, obtenerEmpleados } = danosService;