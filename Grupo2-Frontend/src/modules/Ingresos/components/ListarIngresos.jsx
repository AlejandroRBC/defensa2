import { useState, useEffect } from 'react';
import { ingresosService } from '../services/ingresosService';
import IngresosForm from './IngresosForm';

function ListarIngresos() {
    const [ingresos, setIngresos] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [detalleIngreso, setDetalleIngreso] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    useEffect(() => {
        cargarIngresos();
    }, []);

    const cargarIngresos = async () => {
        try {
            const datosIngresos = await ingresosService.obtenerIngresosActivos();
            setIngresos(datosIngresos);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        }
    };

    const handleCrear = () => {
        setMostrarForm(true);
    };

    const handleVerDetalle = async (idregistro) => {
        try {
            const detalle = await ingresosService.obtenerDetalleIngreso(idregistro);
            setDetalleIngreso(detalle);
            setMostrarDetalle(true);
        } catch (error) {
            console.error('Error al obtener detalle:', error);
        }
    };

    const handleGuardar = () => {
        setMostrarForm(false);
        cargarIngresos();
    };

    const handleCancelar = () => {
        setMostrarForm(false);
    };

    const cerrarDetalle = () => {
        setMostrarDetalle(false);
        setDetalleIngreso(null);
    };

    return (
        <>
            <h1>Gestión de Ingresos</h1>
            
            <button 
                onClick={handleCrear} 
                style={{ 
                    marginBottom: '20px', 
                    padding: '10px 20px', 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                }}
            >
                Nuevo Ingreso
            </button>

            {mostrarForm && (
                <IngresosForm 
                    onSave={handleGuardar}
                    onCancel={handleCancelar}
                />
            )}

            {mostrarDetalle && detalleIngreso && (
                <div >
                    <div >
                        <h2>Detalle del Ingreso #{detalleIngreso.idregistro}</h2>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Hotel:</strong> {detalleIngreso.nombreh}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Habitación:</strong> {detalleIngreso.nrohabitacion} - {detalleIngreso.tipohabitacion}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Fecha Entrada:</strong> {new Date(detalleIngreso.fecha_entrada).toLocaleDateString()}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Hora Entrada:</strong> {detalleIngreso.hora_entrada}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Reserva:</strong> #{detalleIngreso.idreserva}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Periodo Reserva:</strong> {new Date(detalleIngreso.fecha_inicio).toLocaleDateString()} - {new Date(detalleIngreso.fecha_fin).toLocaleDateString()}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Costo Total:</strong> ${detalleIngreso.costo_total}
                        </div>
                        
                        <h3>Clientes</h3>
                        <ul>
                            {detalleIngreso.clientes && detalleIngreso.clientes.map((cliente, index) => (
                                <li key={index}>
                                    {cliente.nombre} {cliente.apellido} - {cliente.telefono} - {cliente.email}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={cerrarDetalle}
                            className="btn-eliminar"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <table >
                <thead>
                    <tr >
                        <th >ID Registro</th>
                        <th >Hotel</th>
                        <th >Habitación</th>
                        <th >Tipo</th>
                        <th >Fecha Entrada</th>
                        <th >Hora Entrada</th>
                        <th >Clientes</th>
                        <th >Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ingresos.map((ingreso) => (
                        <tr key={ingreso.idregistro}>
                            <td >{ingreso.idregistro}</td>
                            <td >{ingreso.nombreh}</td>
                            <td >{ingreso.nrohabitacion}</td>
                            <td >{ingreso.tipohabitacion}</td>
                            <td >
                                {new Date(ingreso.fecha_entrada).toLocaleDateString()}
                            </td>
                            <td >{ingreso.hora_entrada}</td>
                            <td >{ingreso.clientes || 'N/A'}</td>
                            <td >
                                <button
                                    onClick={() => handleVerDetalle(ingreso.idregistro)}
                                    className="btnEditar"
                                >
                                    Ver Detalle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default ListarIngresos;