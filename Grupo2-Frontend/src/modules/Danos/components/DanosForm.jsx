import { useEffect, useState } from 'react';
import { obtenerEmpleados, obtenerRegistros, reportarDano } from '../services/danosService';

const DanosForm = ({ onDanoReportado }) => {
  const [formData, setFormData] = useState({
    observaciones: '',
    monto: '',
    idempleado: '',
    idregistro: ''
  });
  const [registros, setRegistros] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sqlPreview, setSqlPreview] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Generar SQL en tiempo real cuando cambien los datos
  useEffect(() => {
    generarSQLPreview();
  }, [formData]);

  const cargarDatos = async () => {
    try {
      const [regData, empData] = await Promise.all([
        obtenerRegistros(),
        obtenerEmpleados()
      ]);
      setRegistros(regData);
      setEmpleados(empData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos necesarios');
    }
  };

  const generarSQLPreview = () => {
    if (formData.observaciones && formData.monto && formData.idempleado && formData.idregistro) {
      const registroSeleccionado = registros.find(r => r.idregistro == formData.idregistro);
      const empleadoSeleccionado = empleados.find(e => e.idempleado == formData.idempleado);

      const sql = `
-- REPORTAR NUEVO DAÑO
INSERT INTO dano (observaciones, monto, idempleado, idregistro) 
VALUES (
    '${formData.observaciones.replace(/'/g, "''")}', 
    ${parseFloat(formData.monto) || 0}, 
    ${formData.idempleado}, 
    ${formData.idregistro}
);

-- Información relacionada:
-- • Registro: ${registroSeleccionado ? `${registroSeleccionado.hotel} - Hab. ${registroSeleccionado.nrohabitacion}` : 'N/A'}
-- • Empleado: ${empleadoSeleccionado ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` : 'N/A'}
-- • Cliente: ${registroSeleccionado ? registroSeleccionado.cliente : 'N/A'}
      `.trim();
      setSqlPreview(sql);
    } else {
      setSqlPreview('Complete todos los campos obligatorios para ver la sentencia SQL');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validaciones
    if (!formData.observaciones.trim()) {
      setError('Las observaciones son requeridas');
      setLoading(false);
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      setLoading(false);
      return;
    }

    if (!formData.idempleado) {
      setError('Debe seleccionar un empleado');
      setLoading(false);
      return;
    }

    if (!formData.idregistro) {
      setError('Debe seleccionar un registro de ingreso');
      setLoading(false);
      return;
    }

    try {
      await reportarDano(formData);
      alert('Daño reportado correctamente');
      setFormData({
        observaciones: '',
        monto: '',
        idempleado: '',
        idregistro: ''
      });
      if (onDanoReportado) onDanoReportado();
    } catch (error) {
      console.error('Error al reportar daño:', error);
      setError('Error al reportar daño: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRegistroSeleccionado = () => {
    return registros.find(r => r.idregistro == formData.idregistro);
  };

  

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Columna izquierda: Formulario */}
      <div>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#dc3545' }}>🚨 Reportar Daño</h3>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Registro de Ingreso: *</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                name="idregistro" 
                value={formData.idregistro} 
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar registro...</option>
                {registros.map(reg => (
                  <option key={reg.idregistro} value={reg.idregistro}>
                    {reg.hotel} - Hab. {reg.nrohabitacion} - {reg.cliente} 
                    ({new Date(reg.fecha_entrada).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empleado que Reporta: *</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                name="idempleado" 
                value={formData.idempleado} 
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar empleado...</option>
                {empleados.map(emp => (
                  <option key={emp.idempleado} value={emp.idempleado}>
                    {emp.nombre} {emp.apellido} - {emp.cargo}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Observaciones: *</label>
              <textarea 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                name="observaciones" 
                value={formData.observaciones} 
                onChange={handleChange}
                required
                placeholder="Describa el daño encontrado..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Monto del Daño (Bs.): *</label>
              <input 
                type="number" 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                name="monto" 
                value={formData.monto} 
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: loading ? '#6c757d' : '#dc3545', 
                color: 'white', 
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
              disabled={loading}
            >
              {loading ? 'REPORTANDO...' : '🚨 REPORTAR DAÑO'}
            </button>
          </form>
        </div>

        {/* Información del registro seleccionado */}
        {getRegistroSeleccionado() && (
          <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#e7f3ff' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>📋 Información del Registro Seleccionado</h5>
            <div style={{ fontSize: '14px' }}>
              <strong>Hotel:</strong> {getRegistroSeleccionado().hotel}<br />
              <strong>Habitación:</strong> {getRegistroSeleccionado().nrohabitacion}<br />
              <strong>Cliente:</strong> {getRegistroSeleccionado().cliente}<br />
              <strong>Fecha Entrada:</strong> {new Date(getRegistroSeleccionado().fecha_entrada).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Columna derecha: Previsualización de datos y SQL */}
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
                monto: parseFloat(formData.monto) || 0
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
          <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔍 Sentencia SQL que se ejecutará
          </h4>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef', maxHeight: '400px', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {sqlPreview}
            </pre>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
            <strong>💡 Nota:</strong> Esta sentencia insertará un nuevo registro en la tabla daño.
          </div>
        </div>

        {/* Información adicional sobre la tabla daño */}
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #dc3545', borderRadius: '8px', backgroundColor: '#f8d7da' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#721c24' }}>ℹ️ Estructura de la tabla daño</h5>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#721c24' }}>
            CREATE TABLE dano (<br />
            &nbsp;&nbsp;iddano bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,<br />
            &nbsp;&nbsp;observaciones varchar(500) NOT NULL,<br />
            &nbsp;&nbsp;monto numeric(12,2) NOT NULL,<br />
            &nbsp;&nbsp;idempleado bigint NOT NULL REFERENCES empleado(idempleado),<br />
            &nbsp;&nbsp;idregistro bigint NOT NULL REFERENCES registro_ingreso(idregistro)<br />
            );
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#721c24' }}>
            <strong>Relaciones:</strong><br />
            • idempleado → empleado(idempleado)<br />
            • idregistro → registro_ingreso(idregistro)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DanosForm;