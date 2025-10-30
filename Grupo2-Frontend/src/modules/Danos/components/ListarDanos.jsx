import { useEffect, useState } from 'react';
import { listarDanos } from '../services/danosService';

const ListarDanos = () => {
  const [danos, setDanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState('');

  const cargarDanos = async () => {
    try {
      setLoading(true);
      const response = await listarDanos();
      setDanos(response.datos || []);
      setSqlQuery(response.sql || '');
    } catch (error) {
      console.error('Error cargando daños:', error);
      alert('Error al cargar daños: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDanos();
  }, []);

  if (loading) return <div className="text-center">Cargando daños...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Daños Reportados</h3>
        <button 
          className="btn btn-primary"
          onClick={cargarDanos}
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Observaciones</th>
              <th>Monto</th>
              <th>Empleado</th>
              <th>Hotel - Habitación</th>
              <th>Fechas Registro</th>
            </tr>
          </thead>
          <tbody>
            {danos.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No hay daños reportados</td>
              </tr>
            ) : (
              danos.map(dano => (
                <tr key={dano.iddano}>
                  <td>{dano.iddano}</td>
                  <td>{dano.observaciones}</td>
                  <td>${dano.monto}</td>
                  <td>{dano.empleado} ({dano.cargo_empleado})</td>
                  <td>{dano.hotel} - Hab. {dano.nrohabitacion}</td>
                  <td>
                    {new Date(dano.fecha_entrada).toLocaleDateString()} 
                    {' a '}
                    {new Date(dano.fecha_salida).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sqlQuery && (
        <div className="mt-4">
          <h5>Sentencia SQL Utilizada:</h5>
          <div className="card">
            <div className="card-body">
              <code style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap' }}>
                {sqlQuery}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarDanos;