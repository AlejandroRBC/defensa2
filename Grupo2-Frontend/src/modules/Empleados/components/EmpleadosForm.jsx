import { useState, useEffect } from 'react';
import { empleadosService } from '../services/empleadoServices';

function EmpleadosForm({ empleado, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        apellido: '',
        telefono: '',
        fechanaci: '',
        sexo: '',
        nacionalidad: '',
        cargo: '',
        salario: '',
        turno: ''
    });

    const [error, setError] = useState('');
    const [sqlPreview, setSqlPreview] = useState('');

    useEffect(() => {
        if (empleado) {
            setFormData({
                id: empleado.id || '',
                nombre: empleado.nombre || '',
                apellido: empleado.apellido || '',
                telefono: empleado.telefono || '',
                fechanaci: empleado.fechanaci ? empleado.fechanaci.split('T')[0] : '',
                sexo: empleado.sexo || '',
                nacionalidad: empleado.nacionalidad || '',
                cargo: empleado.cargo || '',
                salario: empleado.salario || '',
                turno: empleado.turno || ''
            });
        }
    }, [empleado]);

    // Generar SQL en tiempo real cuando cambien los datos
    useEffect(() => {
        generarSQLPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, empleado]);

    const generarSQLPreview = () => {
        if (empleado) {
            // SQL para actualización
            if (formData.nombre && formData.apellido && formData.cargo && formData.salario) {
                const sql = `
-- TRANSACCIÓN DE ACTUALIZACIÓN
BEGIN;

-- Actualizar datos en tabla persona
UPDATE persona 
SET nombre = '${formData.nombre}', 
    apellido = '${formData.apellido}', 
    telefono = ${formData.telefono ? `'${formData.telefono}'` : 'NULL'}, 
    fechanaci = ${formData.fechanaci ? `'${formData.fechanaci}'` : 'NULL'}, 
    sexo = ${formData.sexo ? `'${formData.sexo}'` : 'NULL'}, 
    nacionalidad = ${formData.nacionalidad ? `'${formData.nacionalidad}'` : 'NULL'}
WHERE id = ${empleado.id};

-- Actualizar datos en tabla empleado
UPDATE empleado 
SET cargo = '${formData.cargo}', 
    salario = ${formData.salario || 0}, 
    turno = ${formData.turno ? `'${formData.turno}'` : 'NULL'}
WHERE idempleado = ${empleado.id};

COMMIT;
                `.trim();
                setSqlPreview(sql);
            }
        } else {
            // SQL para inserción
            if (formData.id && formData.nombre && formData.apellido && formData.cargo && formData.salario) {
                const sql = `
-- TRANSACCIÓN DE INSERCIÓN
BEGIN;

-- Insertar datos en tabla persona
INSERT INTO persona (id, nombre, apellido, telefono, fechanaci, sexo, nacionalidad)
VALUES (
    ${formData.id}, 
    '${formData.nombre}', 
    '${formData.apellido}', 
    ${formData.telefono ? `'${formData.telefono}'` : 'NULL'}, 
    ${formData.fechanaci ? `'${formData.fechanaci}'` : 'NULL'}, 
    ${formData.sexo ? `'${formData.sexo}'` : 'NULL'}, 
    ${formData.nacionalidad ? `'${formData.nacionalidad}'` : 'NULL'}
);

-- Insertar datos en tabla empleado
INSERT INTO empleado (idempleado, cargo, salario, turno)
VALUES (
    ${formData.id}, 
    '${formData.cargo}', 
    ${formData.salario || 0}, 
    ${formData.turno ? `'${formData.turno}'` : 'NULL'}
);

COMMIT;
                `.trim();
                setSqlPreview(sql);
            } else {
                setSqlPreview('Complete todos los campos obligatorios para ver la sentencia SQL');
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
        
        // Validaciones
        if (!empleado && !formData.id) {
            setError('El ID (carnet) es requerido');
            return;
        }

        if (!formData.cargo.trim()) {
            setError('El cargo es requerido');
            return;
        }

        if (!formData.salario || formData.salario <= 0) {
            setError('El salario debe ser mayor a 0');
            return;
        }

        try {
            if (empleado) {
                await empleadosService.actualizarEmpleado(empleado.id, formData);
            } else {
                await empleadosService.crearEmpleado(formData);
            }
            onSave();
        } catch (error) {
            console.error('Error al guardar empleado:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Error al guardar el empleado');
            }
        }
    };


    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Columna izquierda: Formulario */}
            <div>
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>{empleado ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
                    
                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        {!empleado && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID (Carnet): *</label>
                                <input
                                    type="text"
                                    name="id"
                                    placeholder="ID (Carnet)"
                                    value={formData.id}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                        )}
                        {empleado && (
                            <div style={{ padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                <strong>ID:</strong> {formData.id}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre: *</label>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Apellido: *</label>
                            <input
                                type="text"
                                name="apellido"
                                placeholder="Apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
                            <input
                                type="tel"
                                name="telefono"
                                placeholder="Teléfono"
                                value={formData.telefono}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha Nacimiento:</label>
                            <input
                                type="date"
                                name="fechanaci"
                                placeholder="Fecha Nacimiento"
                                value={formData.fechanaci}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sexo:</label>
                            <select 
                                name="sexo" 
                                value={formData.sexo} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Seleccionar sexo</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nacionalidad:</label>
                            <input
                                type="text"
                                name="nacionalidad"
                                placeholder="Nacionalidad"
                                value={formData.nacionalidad}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cargo: *</label>
                        <input
                            type="text"
                            name="cargo"
                            placeholder="Cargo"
                            value={formData.cargo}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Salario: *</label>
                            <input
                                type="number"
                                name="salario"
                                placeholder="Salario"
                                value={formData.salario}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Turno:</label>
                            <select 
                                name="turno" 
                                value={formData.turno} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Seleccionar turno</option>
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                                <option value="Completo">Completo</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            type="submit" 
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#4CAF50', 
                                color: 'white', 
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {empleado ? 'Actualizar' : 'Crear'} Empleado
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
                    <h4>📊 Datos a Enviar</h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                        <strong>JSON que se enviará al servidor:</strong>
                        <pre style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                    </div>
                </div>

                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
                    <h4>🔍 Sentencia SQL que se ejecutará</h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef', maxHeight: '400px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {sqlPreview}
                        </pre>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
                        <strong>💡 Nota:</strong> Esta es una simulación de la sentencia SQL que se ejecutará en la base de datos.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmpleadosForm;