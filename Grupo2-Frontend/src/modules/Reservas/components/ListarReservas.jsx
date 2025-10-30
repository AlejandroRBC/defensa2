import { useState, useEffect } from 'react';
import { reservasService } from '../services/reservasService';
import ReservasForm from './ReservasForm';

function ListarReservas() {
    const [reservas, setReservas] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [reservaEdit, setReservaEdit] = useState(null);

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            const datos = await reservasService.obtenerReservas();
            setReservas(datos);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
        }
    };

    const handleCrear = () => {
        setReservaEdit(null);
        setMostrarForm(true);
    };

    const handleEditar = (reserva) => {
        setReservaEdit(reserva);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
            try {
                await reservasService.eliminarReserva(id);
                cargarReservas();
            } catch (error) {
                console.error('Error al eliminar reserva:', error);
                alert(error.response?.data?.error || 'Error al eliminar la reserva');
            }
        }
    };

    const handleGuardar = () => {
        setMostrarForm(false);
        setReservaEdit(null);
        cargarReservas();
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setReservaEdit(null);
    };

    return (
        <>
            <h1>Gestión de Reservas</h1>

            <button 
                onClick={handleCrear} 
                style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none' }}
            >
                Nueva Reserva
            </button>

            {mostrarForm && (
                <ReservasForm 
                    reserva={reservaEdit}
                    onSave={handleGuardar}
                    onCancel={handleCancelar}
                />
            )}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Costo Total</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas.map((r) => (
                        <tr key={r.idreserva}>
                            <td>{r.idreserva}</td>
                            <td>{r.fecha_inicio ? r.fecha_inicio.split('T')[0] : ''}</td>
                            <td>{r.fecha_fin ? r.fecha_fin.split('T')[0] : ''}</td>
                            <td>{r.costo_total}</td>
                            <td>{r.estado}</td>
                            <td>{r.cliente_nombre}</td>
                            <td>
                                <button className="btn-eliminar" onClick={() => handleEditar(r)}>Editar</button>
                                <button className="btnEditar" onClick={() => handleEliminar(r.idreserva)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {reservas.length === 0 && !mostrarForm && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    No hay reservas registradas
                </div>
            )}
        </>
    );
}

export default ListarReservas;
