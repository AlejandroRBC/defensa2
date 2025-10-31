import { useState, useEffect } from 'react';
import { deportivosService } from '../services/deportivosService';

function EspaciosDeportivos() {
    const [formData, setFormData] = useState({
        codEspacio: '',
        nombre: '',
        ubicacion: '',
        capacidad: '',
        estado: 'ACTIVO',
        descripcion: ''
    });

    const [espacios, setEspacios] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        try {
            const datos = await deportivosService.obtenerEspacios();
            setEspacios(datos);
        } catch (error) {
            console.error('Error cargando espacios deportivos:', error);
            setError('Error al cargar los espacios deportivos');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Validaciones básicas
        if (!formData.codEspacio || !formData.nombre) {
            setError('Complete los campos obligatorios (CodEspacio y Nombre)');
            setLoading(false);
            return;
        }

        try {
            await deportivosService.crearEspacio(formData);
            setSuccess('Espacio deportivo creado exitosamente');
            setFormData({
                codEspacio: '',
                nombre: '',
                ubicacion: '',
                capacidad: '',
                estado: 'ACTIVO',
                descripcion: ''
            });
            // Recargar la lista de espacios
            await cargarEspacios();
        } catch (error) {
            console.error('Error al crear espacio deportivo:', error);
            setError(error.response?.data?.detalle || 'Error al crear el espacio deportivo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            {/* Lista de espacios registrados */}
            {espacios.length > 0 && (
                <div style={{ 
                    marginTop: '30px', 
                    padding: '20px', 
                    backgroundColor: '#ecf0f1', 
                    borderRadius: '8px',
                    border: '1px solid #bdc3c7'
                }}>
                    <h4 style={{ 
                        color: '#2c3e50', 
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📋 Espacios Deportivos Registrados
                    </h4>
                    <div style={{ 
                        display: 'grid', 
                        gap: '10px'
                    }}>
                        {espacios.map((espacio) => (
                            <div 
                                key={espacio.cod_espacio}
                                style={{ 
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #bdc3c7',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                                    gap: '15px',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                    {espacio.cod_espacio}
                                </div>
                                <div style={{ fontWeight: '600' }}>
                                    {espacio.nombre}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        backgroundColor: '#9b59b6', 
                                        color: 'white', 
                                        padding: '5px 10px', 
                                        borderRadius: '15px',
                                        fontSize: '12px'
                                    }}>
                                        {espacio.nro_canchas} canchas
                                    </span>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        backgroundColor: '#3498db', 
                                        color: 'white', 
                                        padding: '5px 10px', 
                                        borderRadius: '15px',
                                        fontSize: '12px'
                                    }}>
                                        {espacio.nro_reservas} reservas
                                    </span>
                                </div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#27ae60' }}>
                                    ${parseFloat(espacio.total_pagos).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 style={{ 
                color: '#2c3e50', 
                marginBottom: '25px', 
                borderBottom: '2px solid #e74c3c', 
                paddingBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                🏟️ DATOS DE ESPACIOS DEPORTIVOS
            </h2>

            {error && (
                <div style={{ 
                    color: '#e74c3c', 
                    backgroundColor: '#fadbd8', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '20px',
                    border: '1px solid #e74c3c',
                    fontWeight: '500'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div style={{ 
                    color: '#27ae60', 
                    backgroundColor: '#d5f4e6', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '20px',
                    border: '1px solid #27ae60',
                    fontWeight: '500'
                }}>
                    ✅ {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '25px', 
                    borderRadius: '8px', 
                    marginBottom: '25px',
                    border: '2px solid #e74c3c'
                }}>
                    {/* Fila 1: CodEspacio | Nro Canchas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                CodEspacio *
                            </label>
                            <input
                                type="number"
                                name="codEspacio"
                                value={formData.codEspacio}
                                onChange={handleChange}
                                required
                                min="1"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                                placeholder="Ej: 1"
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Capacidad
                            </label>
                            <input
                                type="number"
                                name="capacidad"
                                value={formData.capacidad}
                                onChange={handleChange}
                                min="0"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                                placeholder="Ej: 500"
                            />
                        </div>
                    </div>

                    {/* Fila 2: Nombre | Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                                placeholder="Ej: Complejo Deportivo Central"
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Estado
                            </label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Ubicación | Descripción */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Ubicación
                            </label>
                            <input
                                type="text"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                                placeholder="Ej: Av. Principal 123"
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Descripción del espacio deportivo"
                            />
                        </div>
                    </div>
                </div>

                {/* Botón de enviar */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button 
                        type="submit"
                        disabled={loading}
                        style={{ 
                            padding: '15px 40px', 
                            backgroundColor: loading ? '#95a5a6' : '#e74c3c', 
                            color: 'white', 
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? '⏳ Creando...' : '💾 Guardar Espacio Deportivo'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EspaciosDeportivos;