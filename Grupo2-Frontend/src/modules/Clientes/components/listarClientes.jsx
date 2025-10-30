import { useState, useEffect } from 'react';
import { clientesService } from '../services/clientesService';
import ClientesForm from './ClientesForm';

function ListarClientes() {
    const [clientes, setClientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [clienteEdit, setClienteEdit] = useState(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const datosClientes = await clientesService.obtenerClientes();
            setClientes(datosClientes);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const handleCrear = () => {
        setClienteEdit(null);
        setMostrarForm(true);
    };

    const handleEditar = (cliente) => {
        setClienteEdit(cliente);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            try {
                await clientesService.eliminarCliente(id);
                cargarClientes();
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
            }
        }
    };

    const handleGuardar = () => {
        setMostrarForm(false);
        setClienteEdit(null);
        cargarClientes();
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setClienteEdit(null);
    };

    return (
        <>
            <h1>Gestión de Clientes</h1>
            
            <button 
                onClick={handleCrear} 
                style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
            >
                Nuevo Cliente
            </button>

            {mostrarForm && (
                <ClientesForm 
                    cliente={clienteEdit}
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
                        <th >Fecha Nacimiento</th>
                        <th >Sexo</th>
                        <th >Nacionalidad</th>
                        <th >Categoría</th>
                        <th >Email</th>
                        <th >Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                            <td >{cliente.id}</td>
                            <td >{cliente.nombre}</td>
                            <td >{cliente.apellido}</td>
                            <td >{cliente.telefono}</td>
                            <td>{cliente.fechanaci ? cliente.fechanaci.split('T')[0] : ''}</td>
                            <td >{cliente.sexo}</td>
                            <td >{cliente.nacionalidad}</td>
                            <td >{cliente.categoria}</td>
                            <td >{cliente.email}</td>
                            <td >
                                <button className= "btn-eliminar"
                                    onClick={() => handleEditar(cliente)}
                                >
                                    Editar
                                </button>
                                <button 
                                    className= "btnEditar"
                                    onClick={() => handleEliminar(cliente.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default ListarClientes;