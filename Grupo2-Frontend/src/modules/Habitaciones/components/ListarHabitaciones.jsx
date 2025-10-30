import { useState, useEffect } from "react";
import { habitacionesService } from "../services/habitacionesService";
import HabitacionesForm from "./HabitacionesForm";

function ListarHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [habitacionEditar, setHabitacionEditar] = useState(null);

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  const cargarHabitaciones = async () => {
    const data = await habitacionesService.obtenerHabitaciones();
    setHabitaciones(data);
  };

  const handleGuardar = () => {
    setMostrarForm(false);
    setHabitacionEditar(null);
    cargarHabitaciones();
  };

  const handleEditar = (habitacion) => {
    setHabitacionEditar(habitacion); // cargar datos en el formulario
    setMostrarForm(true);
  };

  const handleEliminar = async (idhotel, nrohabitacion) => {
    if (window.confirm("¿Seguro que quieres eliminar esta habitación?")) {
      await habitacionesService.eliminarHabitacion(idhotel, nrohabitacion);
      cargarHabitaciones();
    }
  };

  return (
    <div>
      <h1>Gestión de Habitaciones por Hotel</h1>
      <button onClick={() => setMostrarForm(true)} className="btnEditar">
        Asignar nueva habitación
      </button>

      {mostrarForm && (
        <HabitacionesForm
          habitacionInicial={habitacionEditar}
          onSave={handleGuardar}
          onCancel={() => { setMostrarForm(false); setHabitacionEditar(null); }}
        />
      )}
      
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID Hotel</th>
            <th>Hotel</th>
            <th>Nro Habitación</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th>Precio</th>
            <th>Piso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {habitaciones.map((h) => (
            <tr key={`${h.idhotel}-${h.nrohabitacion}`}>
              <td>{h.idhotel}</td>
              <td>{h.nombre_hotel}</td>
              <td>{h.nrohabitacion}</td>
              <td>{h.tipohabitacion}</td>
              <td>{h.capacidad}</td>
              <td>{h.estado}</td>
              <td>{h.precio}</td>
              <td>{h.nro_piso}</td>
              <td>
                <button className="btnEditar" onClick={() => handleEditar(h)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleEliminar(h.idhotel, h.nrohabitacion)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListarHabitaciones;
