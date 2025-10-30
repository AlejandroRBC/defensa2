import { useState, useEffect } from 'react';
import { ingresosService } from '../services/ingresosService';
import { clientesService } from '../../Clientes/services/clientesService';

function IngresosForm({ onSave, onCancel }) {
    const [formData, setFormData] = useState({
        idreserva: '',
        idhotel: '',
        nrohabitacion: '',
        fecha_entrada: new Date().toISOString().split('T')[0],
        hora_entrada: new Date().toTimeString().split(':').slice(0, 2).join(':'),
        idclientes: []
    });

    const [reservas, setReservas] = useState([]);
    const [clientesDisponibles, setClientesDisponibles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sqlPreview, setSqlPreview] = useState('');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    useEffect(() => {
        cargarReservas();
        cargarClientes();
    }, []);

    // Generar SQL en tiempo real cuando cambien los datos
    useEffect(() => {
        generarSQLPreview();
    }, [formData, reservaSeleccionada]);

    const cargarReservas = async () => {
        try {
            const data = await ingresosService.obtenerReservasConfirmadas();
            setReservas(data);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            setError('No se pudieron cargar las reservas');
        }
    };

    const cargarClientes = async () => {
        try {
            const data = await clientesService.obtenerClientes();
            setClientesDisponibles(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const generarSQLPreview = () => {
        if (formData.idreserva && formData.idhotel && formData.nrohabitacion && formData.idclientes.length > 0) {
            
            const sql = `
-- TRANSACCIÓN DE REGISTRO DE INGRESO
BEGIN;

-- 1. Insertar registro de ingreso
INSERT INTO registro_ingreso (fecha_entrada, hora_entrada, idreserva, idhotel, nrohabitacion)
VALUES (
    '${formData.fecha_entrada}', 
    '${formData.hora_entrada}', 
    ${formData.idreserva}, 
    ${formData.idhotel}, 
    ${formData.nrohabitacion}
) RETURNING idregistro;

-- 2. Registrar clientes en la tabla registra (para cada cliente seleccionado)
${formData.idclientes.map(idCliente => 
`INSERT INTO registra (idcliente, idregistro) 
VALUES (${idCliente}, (SELECT idregistro FROM registro_ingreso WHERE idreserva = ${formData.idreserva}));`
).join('\n')}

-- 3. Actualizar estado de la habitación a OCUPADA
UPDATE habitacion 
SET estado = 'OCUPADA' 
WHERE idhotel = ${formData.idhotel} 
  AND nrohabitacion = ${formData.nrohabitacion};

-- 4. Actualizar estado de la reserva a CHECKIN
UPDATE reserva 
SET estado = 'CHECKIN' 
WHERE idreserva = ${formData.idreserva};

COMMIT;

-- Información del proceso:
-- • Se creará un nuevo registro de ingreso con ID automático
-- • Se registrarán ${formData.idclientes.length} cliente(s) en la tabla registra
-- • La habitación ${formData.nrohabitacion} del hotel ${formData.idhotel} cambiará a estado OCUPADA
-- • La reserva ${formData.idreserva} cambiará a estado CHECKIN
            `.trim();
            setSqlPreview(sql);
        } else {
            setSqlPreview('Complete todos los campos obligatorios y seleccione al menos un cliente para ver la sentencia SQL');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'idreserva') {
            const reservaId = Number(value);
            const reservaSeleccionada = reservas.find(r => Number(r.idreserva) === reservaId);
            if (reservaSeleccionada) {
                setReservaSeleccionada(reservaSeleccionada);
                setFormData(prev => ({
                    ...prev,
                    idreserva: reservaId,
                    idhotel: reservaSeleccionada.idhotel || '',
                    nrohabitacion: reservaSeleccionada.nrohabitacion || ''
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (error) setError('');
    };

    const handleClienteChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(Number(options[i].value));
            }
        }
        setFormData(prev => ({
            ...prev,
            idclientes: selected
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.idreserva || !formData.idhotel || !formData.nrohabitacion) {
            setError('Todos los campos obligatorios deben ser completados');
            setLoading(false);
            return;
        }

        if (formData.idclientes.length === 0) {
            setError('Debe seleccionar al menos un cliente');
            setLoading(false);
            return;
        }

        try {
            await ingresosService.crearIngreso(formData);
            alert('Ingreso registrado exitosamente');
            onSave();
        } catch (error) {
            console.error('Error al crear ingreso:', error);
            setError('Error al crear el ingreso: ' + (error.response?.data?.detalle || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getClientesSeleccionados = () => {
        return clientesDisponibles.filter(cliente => 
            formData.idclientes.includes(cliente.id)
        );
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Columna izquierda: Formulario */}
            <div>
                <form onSubmit={handleSubmit} style={{
                    marginBottom: '20px',
                    padding: '20px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#28a745' }}>🏨 Registrar Ingreso</h3>
                    
                    {error && (
                        <div style={{
                            color: 'red',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Selección de reserva */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Reserva Confirmada: *
                        </label>
                        <select
                            name="idreserva"
                            value={formData.idreserva || ""}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Seleccionar reserva confirmada</option>
                            {reservas.map(reserva => (
                                <option key={reserva.idreserva} value={reserva.idreserva}>
                                    Reserva #{reserva.idreserva} - {reserva.cliente_nombre} - {reserva.hotel_nombre} - Hab: {reserva.nrohabitacion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Información de la reserva seleccionada */}
                    {reservaSeleccionada && (
                        <div style={{
                            marginBottom: '15px',
                            padding: '15px',
                            backgroundColor: '#e7f3ff',
                            border: '1px solid #007bff',
                            borderRadius: '4px'
                        }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>📋 Información de la Reserva</h5>
                            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                <strong>Cliente:</strong> {reservaSeleccionada.cliente_nombre}<br />
                                <strong>Hotel:</strong> {reservaSeleccionada.hotel_nombre}<br />
                                <strong>Habitación:</strong> {reservaSeleccionada.nrohabitacion} ({reservaSeleccionada.tipohabitacion})<br />
                                <strong>Check-in:</strong> {new Date(reservaSeleccionada.fecha_inicio).toLocaleDateString()}<br />
                                <strong>Check-out:</strong> {new Date(reservaSeleccionada.fecha_fin).toLocaleDateString()}<br />
                                <strong>Costo Total:</strong> ${reservaSeleccionada.costo_total}
                            </div>
                        </div>
                    )}

                    {/* Hotel y habitación (readonly) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hotel: *</label>
                            <input
                                type="number"
                                name="idhotel"
                                value={formData.idhotel}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Habitación: *</label>
                            <input
                                type="number"
                                name="nrohabitacion"
                                value={formData.nrohabitacion}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>
                    </div>

                    {/* Fecha y hora */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Entrada: *</label>
                            <input
                                type="date"
                                name="fecha_entrada"
                                value={formData.fecha_entrada}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora de Entrada: *</label>
                            <input
                                type="time"
                                name="hora_entrada"
                                value={formData.hora_entrada}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>
                    </div>

                    {/* Selección de clientes */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Clientes que Ingresan: *</label>
                        <select
                            multiple
                            onChange={handleClienteChange}
                            value={formData.idclientes.map(String)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                minHeight: '120px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px'
                            }}
                        >
                            {clientesDisponibles.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.id} - {cliente.nombre} {cliente.apellido} - {cliente.email}
                                </option>
                            ))}
                        </select>
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples clientes
                        </small>
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                            <strong>Clientes seleccionados: {formData.idclientes.length}</strong>
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '16px'
                            }}
                        >
                            {loading ? 'REGISTRANDO...' : '✅ REGISTRAR INGRESO'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            {/* Columna derecha: Previsualizaciones */}
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
                                idclientes: formData.idclientes,
                                clientesSeleccionados: getClientesSeleccionados().map(c => `${c.nombre} ${c.apellido}`)
                            }, null, 2)}
                        </pre>
                    </div>
                </div>

                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔍 Sentencia SQL que se ejecutará
                    </h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef', maxHeight: '500px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {sqlPreview}
                        </pre>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
                        <strong>💡 Nota:</strong> Esta transacción realiza 4 operaciones en la base de datos de forma atómica.
                    </div>
                </div>

                {/* Información de tablas relacionadas */}
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#d4edda' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#155724' }}>ℹ️ Tablas Involucradas</h5>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#155724' }}>
                        <strong>registro_ingreso:</strong> Almacena el check-in<br />
                        <strong>registra:</strong> Relación muchos-a-muchos entre clientes y registros<br />
                        <strong>habitacion:</strong> Se actualiza el estado a OCUPADA<br />
                        <strong>reserva:</strong> Se actualiza el estado a CHECKIN
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IngresosForm;