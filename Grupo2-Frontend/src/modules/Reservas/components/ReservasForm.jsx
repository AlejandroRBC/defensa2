import { useState, useEffect } from 'react';
import { reservasService } from '../services/reservasService';
import { clientesService } from '../../Clientes/services/clientesService';
import { habitacionesService } from '../../Habitaciones/services/habitacionesService';

function ReservasForm({ reserva, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date().toISOString().split('T')[0],
        costo_total: '',
        estado: 'PENDIENTE',
        idcliente: ''
    });

    const [clientes, setClientes] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [selectedHabitacion, setSelectedHabitacion] = useState({ idhotel: '', nrohabitacion: '' });
    const [error, setError] = useState('');
    const [sqlPreview, setSqlPreview] = useState('');

    useEffect(() => {
        cargarClientes();
        cargarHabitaciones();
    }, []);

    useEffect(() => {
        if (reserva) {
            setFormData({
                fecha_inicio: reserva.fecha_inicio ? reserva.fecha_inicio.split('T')[0] : '',
                fecha_fin: reserva.fecha_fin ? reserva.fecha_fin.split('T')[0] : '',
                costo_total: reserva.costo_total || '',
                estado: reserva.estado || 'PENDIENTE',
                idcliente: reserva.idcliente || ''
            });

            setSelectedHabitacion({ idhotel: reserva.idhotel || '', nrohabitacion: reserva.nrohabitacion || '' });
        }
    }, [reserva]);

    useEffect(() => {
        generarSQLPreview();
    }, [formData, selectedHabitacion]);

    const cargarClientes = async () => {
        try {
            const data = await clientesService.obtenerClientes();
            setClientes(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const cargarHabitaciones = async () => {
        try {
            const data = await habitacionesService.obtenerHabitaciones();
            setHabitaciones(data);
        } catch (error) {
            console.error('Error al cargar habitaciones:', error);
        }
    };

    const generarSQLPreview = () => {
        if (selectedHabitacion.idhotel && selectedHabitacion.nrohabitacion && formData.fecha_inicio && formData.fecha_fin && formData.idcliente) {
            if (reserva) {
                setSqlPreview(`-- ACTUALIZACIÓN DE RESERVA\nUPDATE reserva SET fecha_inicio = '${formData.fecha_inicio}', fecha_fin = '${formData.fecha_fin}', costo_total = ${formData.costo_total || 'NULL'}, estado = '${formData.estado}', idcliente = ${formData.idcliente} WHERE idreserva = ${reserva.idreserva};`);
            } else {
                setSqlPreview(`-- INSERCIÓN DE RESERVA\nINSERT INTO reserva (fecha_inicio, fecha_fin, costo_total, estado, idcliente) VALUES ('${formData.fecha_inicio}', '${formData.fecha_fin}', ${formData.costo_total || 'NULL'}, '${formData.estado}', ${formData.idcliente}) RETURNING idreserva;\n\n-- DETALLE: Asociar habitación reservada\nINSERT INTO detalle_reserva (idhotel, nrohabitacion, idreserva) VALUES (${selectedHabitacion.idhotel}, ${selectedHabitacion.nrohabitacion}, (SELECT currval(pg_get_serial_sequence('reserva','idreserva'))));`);
            }
        } else {
            setSqlPreview('Complete todos los campos obligatorios y seleccione una habitación para ver la sentencia SQL');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleHabitacionChange = (e) => {
        const [idhotel, nrohabitacion] = e.target.value.split('|');
        setSelectedHabitacion({ idhotel, nrohabitacion });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // validaciones
        if (!formData.fecha_inicio || !formData.fecha_fin || !formData.idcliente) {
            setError('Complete los campos obligatorios');
            return;
        }

        try {
            if (reserva) {
                await reservasService.actualizarReserva(reserva.idreserva, { ...formData, ...selectedHabitacion });
            } else {
                await reservasService.crearReserva({ ...formData, ...selectedHabitacion });
            }
            onSave();
        } catch (error) {
            console.error('Error al guardar reserva:', error);
            setError(error.response?.data?.error || 'Error al guardar reserva');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>{reserva ? 'Editar Reserva' : 'Nueva Reserva'}</h3>

                    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Cliente: *</label>
                        <select name="idcliente" value={formData.idcliente} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                            <option value="">Seleccionar cliente</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.email || 'sin email'})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Fecha Inicio: *</label>
                            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold' }}>Fecha Fin: *</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Costo Total:</label>
                        <input type="number" name="costo_total" value={formData.costo_total} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Estado:</label>
                        <select name="estado" value={formData.estado} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="CONFIRMADA">CONFIRMADA</option>
                            <option value="CANCELADA">CANCELADA</option>
                            <option value="CHECKIN">CHECKIN</option>
                            <option value="CHECKOUT">CHECKOUT</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Seleccionar Habitación: *</label>
                        <select value={`${selectedHabitacion.idhotel}|${selectedHabitacion.nrohabitacion}`} onChange={handleHabitacionChange} required style={{ width: '100%', padding: '8px' }}>
                            <option value="|">Seleccionar habitación</option>
                            {habitaciones.map(h => (
                                <option key={`${h.idhotel}-${h.nrohabitacion}`} value={`${h.idhotel}|${h.nrohabitacion}`}>
                                    {h.idhotel} - Hab {h.nrohabitacion} ({h.tipohabitacion}) - ${h.precio} - {h.estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none' }}>{reserva ? 'Actualizar' : 'Crear'} Reserva</button>
                        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>Cancelar</button>
                    </div>
                </form>
            </div>

            <div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                    <h4>📊 Datos a Enviar</h4>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify({ ...formData, habitacion: selectedHabitacion }, null, 2)}
                    </pre>
                </div>

                <div style={{ marginTop: '15px', padding: '20px', border: '1px solid #fff3cd', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
                    <h4>🔍 Sentencia SQL</h4>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{sqlPreview}</pre>
                </div>
            </div>
        </div>
    );
}

export default ReservasForm;
