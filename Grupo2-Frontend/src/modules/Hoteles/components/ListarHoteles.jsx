
import { useState, useEffect } from 'react';
import { hotelesService } from '../services/hotelesService';
import HotelesForm from './HotelesForm';

function ListarHoteles() {
    const [hoteles, setHoteles] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [hotelEdit, setHotelEdit] = useState(null);

    useEffect(() => {
        cargarHoteles();
    }, []);

    const cargarHoteles = async () => {
        try {
            const datosHoteles = await hotelesService.obtenerHoteles();
            setHoteles(datosHoteles);
        } catch (error) {
            console.error('Error al cargar hoteles:', error);
        }
    };

    const handleCrear = () => {
        setHotelEdit(null);
        setMostrarForm(true);
    };

    const handleEditar = (hotel) => {
        setHotelEdit(hotel);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este hotel?')) {
            try {
                await hotelesService.eliminarHotel(id);
                cargarHoteles();
            } catch (error) {
                console.error('Error al eliminar hotel:', error);
                alert(error.response?.data?.error || 'Error al eliminar el hotel');
            }
        }
    };

    const handleGuardar = () => {
        setMostrarForm(false);
        setHotelEdit(null);
        cargarHoteles();
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setHotelEdit(null);
    };

    return (
        <>
            <h1>Gestión de Hoteles</h1>
            
            <button 
                onClick={handleCrear} 
                style={{ 
                    marginBottom: '20px', 
                    padding: '10px 20px', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Nuevo Hotel
            </button>

            {mostrarForm && (
                <HotelesForm 
                    hotel={hotelEdit}
                    onSave={handleGuardar}
                    onCancel={handleCancelar}
                />
            )}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {hoteles.map((hotel) => (
                        <tr key={hotel.idhotel}>
                            <td>{hotel.idhotel}</td>
                            <td>{hotel.nombreh}</td>
                            <td>{hotel.direccion}</td>
                            <td>{hotel.telefonoh}</td>
                            <td>{hotel.categoria} ⭐</td>
                            <td>
                                <button 
                                    className="btn-eliminar"
                                    onClick={() => handleEditar(hotel)}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="btnEditar"
                                    onClick={() => handleEliminar(hotel.idhotel)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {hoteles.length === 0 && !mostrarForm && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    No hay hoteles registrados
                </div>
            )}
        </>
    );
}

export default ListarHoteles;