import { useState, useEffect } from 'react';
import { empleadosService } from '../services/empleadoServices';
import EmpleadosForm from './EmpleadosForm';

function ListarEmpleados() {
    const [empleados, setEmpleados] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [empleadoEdit, setEmpleadoEdit] = useState(null);

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const cargarEmpleados = async () => {
        try {
            const datosEmpleados = await empleadosService.obtenerEmpleados();
            setEmpleados(datosEmpleados);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        }
    };

    const handleCrear = () => {
        setEmpleadoEdit(null);
        setMostrarForm(true);
    };

    const handleEditar = (empleado) => {
        setEmpleadoEdit(empleado);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
            try {
                await empleadosService.eliminarEmpleado(id);
                cargarEmpleados();
            } catch (error) {
                console.error('Error al eliminar empleado:', error);
                alert(error.response?.data?.error || 'Error al eliminar el empleado');
            }
        }
    };

    const handleGuardar = () => {
        setMostrarForm(false);
        setEmpleadoEdit(null);
        cargarEmpleados();
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setEmpleadoEdit(null);
    };

    return (
        <>
            <h1>Gestión de Empleados</h1>
            
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
                Nuevo Empleado
            </button>

            {mostrarForm && (
                <EmpleadosForm 
                    empleado={empleadoEdit}
                    onSave={handleGuardar}
                    onCancel={handleCancelar}
                />
            )}

            <table >
                <thead>
                    <tr >
                        <th >ID</th>
                        <th >Nombre</th>
                        <th >Apellido</th>
                        <th >Teléfono</th>
                        <th >Fecha Nac.</th>
                        <th >Sexo</th>
                        <th >Nacionalidad</th>
                        <th >Cargo</th>
                        <th >Salario</th>
                        <th >Turno</th>
                        <th >Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.id}>
                            <td >{empleado.id}</td>
                            <td >{empleado.nombre}</td>
                            <td >{empleado.apellido}</td>
                            <td >{empleado.telefono}</td>
                            <td >
                                {empleado.fechanaci ? empleado.fechanaci.split('T')[0] : ''}
                            </td>
                            <td >{empleado.sexo}</td>
                            <td >{empleado.nacionalidad}</td>
                            <td >{empleado.cargo}</td>
                            <td >${empleado.salario}</td>
                            <td >{empleado.turno}</td>
                            <td >
                                <button 
                                    className="btnEditar"
                                    onClick={() => handleEditar(empleado)}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="btn-eliminar"
                                    onClick={() => handleEliminar(empleado.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {empleados.length === 0 && !mostrarForm && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    No hay empleados registrados
                </div>
            )}
        </>
    );
}

export default ListarEmpleados;