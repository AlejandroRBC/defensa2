import { useState, useEffect } from 'react';
import { hotelesService } from '../services/hotelesService';

function HotelesForm({ hotel, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nombreh: '',
        direccion: '',
        telefonoh: '',
        categoria: ''
    });

    const [error, setError] = useState('');
    const [sqlPreview, setSqlPreview] = useState('');

    useEffect(() => {
        if (hotel) {
            setFormData({
                nombreh: hotel.nombreh || '',
                direccion: hotel.direccion || '',
                telefonoh: hotel.telefonoh || '',
                categoria: hotel.categoria || ''
            });
        }
    }, [hotel]);

    // Generar SQL en tiempo real cuando cambien los datos
    useEffect(() => {
        generarSQLPreview();
    }, [formData, hotel]);

    const generarSQLPreview = () => {
        if (hotel) {
            // SQL para actualización
            if (formData.nombreh) {
                const sql = `
-- ACTUALIZACIÓN DE HOTEL
UPDATE hotel 
SET nombreh = '${formData.nombreh}', 
    direccion = ${formData.direccion ? `'${formData.direccion}'` : 'NULL'}, 
    telefonoh = ${formData.telefonoh ? `'${formData.telefonoh}'` : 'NULL'}, 
    categoria = ${formData.categoria ? formData.categoria : 'NULL'}
WHERE idhotel = ${hotel.idhotel};

-- Resultado: Hotel actualizado correctamente
                `.trim();
                setSqlPreview(sql);
            }
        } else {
            // SQL para inserción
            if (formData.nombreh) {
                const sql = `
-- INSERCIÓN DE NUEVO HOTEL
INSERT INTO hotel (nombreh, direccion, telefonoh, categoria)
VALUES (
    '${formData.nombreh}', 
    ${formData.direccion ? `'${formData.direccion}'` : 'NULL'}, 
    ${formData.telefonoh ? `'${formData.telefonoh}'` : 'NULL'}, 
    ${formData.categoria ? formData.categoria : 'NULL'}
)
RETURNING idhotel;

-- Resultado: Se creará un nuevo hotel con ID automático
                `.trim();
                setSqlPreview(sql);
            } else {
                setSqlPreview('Complete el nombre del hotel para ver la sentencia SQL');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.nombreh.trim()) {
            setError('El nombre del hotel es requerido');
            return;
        }

        if (formData.categoria && (formData.categoria < 1 || formData.categoria > 5)) {
            setError('La categoría debe estar entre 1 y 5 estrellas');
            return;
        }

        try {
            if (hotel) {
                await hotelesService.actualizarHotel(hotel.idhotel, formData);
            } else {
                await hotelesService.crearHotel(formData);
            }
            onSave();
        } catch (error) {
            console.error('Error al guardar hotel:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Error al guardar el hotel');
            }
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Columna izquierda: Formulario */}
            <div>
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>{hotel ? 'Editar Hotel' : 'Nuevo Hotel'}</h3>
                    
                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                            {error}
                        </div>
                    )}

                    {hotel && (
                        <div style={{ marginBottom: '15px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                            <strong>ID Hotel:</strong> {hotel.idhotel}
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Hotel: *</label>
                        <input
                            type="text"
                            name="nombreh"
                            placeholder="Nombre del Hotel"
                            value={formData.nombreh}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección:</label>
                        <input
                            type="text"
                            name="direccion"
                            placeholder="Dirección completa"
                            value={formData.direccion}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
                        <input
                            type="tel"
                            name="telefonoh"
                            placeholder="Teléfono del hotel"
                            value={formData.telefonoh}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Categoría (Estrellas):</label>
                        <select 
                            name="categoria" 
                            value={formData.categoria} 
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Seleccionar categoría</option>
                            <option value="1">⭐ 1 Estrella</option>
                            <option value="2">⭐⭐ 2 Estrellas</option>
                            <option value="3">⭐⭐⭐ 3 Estrellas</option>
                            <option value="4">⭐⭐⭐⭐ 4 Estrellas</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 Estrellas</option>
                        </select>
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Opcional: Seleccione la categoría del hotel (1-5 estrellas)
                        </small>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            type="submit" 
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#2196F3', 
                                color: 'white', 
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {hotel ? 'Actualizar' : 'Crear'} Hotel
                        </button>
                        <button 
                            type="button" 
                            onClick={onCancel}
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#6c757d', 
                                color: 'white', 
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            {/* Columna derecha: Previsualización de datos y SQL */}
            <div>
                <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📊 Datos a Enviar
                    </h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                        <strong>JSON que se enviará al servidor:</strong>
                        <pre style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify({
                                ...formData,
                                idhotel: hotel ? hotel.idhotel : '(nuevo)'
                            }, null, 2)}
                        </pre>
                    </div>
                </div>

                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔍 Sentencia SQL que se ejecutará
                    </h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef', maxHeight: '400px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {sqlPreview}
                        </pre>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
                        <strong>💡 Nota:</strong> 
                        {hotel ? 
                            'Esta sentencia actualizará el hotel existente.' : 
                            'Esta sentencia creará un nuevo hotel con ID automático.'
                        }
                    </div>
                </div>

                {/* Información adicional sobre la tabla hotel */}
                {!hotel && (
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #d4edda', borderRadius: '8px', backgroundColor: '#d4edda' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#155724' }}>ℹ️ Estructura de la tabla hotel</h5>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#155724' }}>
                            CREATE TABLE hotel (<br />
                            &nbsp;&nbsp;idhotel bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,<br />
                            &nbsp;&nbsp;nombreh varchar(100) NOT NULL,<br />
                            &nbsp;&nbsp;direccion varchar(200),<br />
                            &nbsp;&nbsp;telefonoh varchar(30),<br />
                            &nbsp;&nbsp;categoria integer<br />
                            );
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HotelesForm;