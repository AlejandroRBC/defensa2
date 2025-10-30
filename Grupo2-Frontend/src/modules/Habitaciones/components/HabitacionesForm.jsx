import { useState, useEffect } from "react";
import { habitacionesService, hotelesService } from "../services/habitacionesService";

function HabitacionesForm({ habitacionInicial, onSave, onCancel }) {
  const [form, setForm] = useState({
    idhotel: habitacionInicial?.idhotel || "",
    nrohabitacion: habitacionInicial?.nrohabitacion || "",
    tipohabitacion: habitacionInicial?.tipohabitacion || "",
    capacidad: habitacionInicial?.capacidad || "",
    estado: habitacionInicial?.estado || "DISPONIBLE",
    precio: habitacionInicial?.precio || "",
    nro_piso: habitacionInicial?.nro_piso || "",
  });
  const [hoteles, setHoteles] = useState([]);
  const [error, setError] = useState('');
  const [sqlPreview, setSqlPreview] = useState('');
  const [hotelSeleccionado, setHotelSeleccionado] = useState(null);

  useEffect(() => {
    const cargarHoteles = async () => {
      const data = await hotelesService.obtenerHoteles();
      setHoteles(data);
    };
    cargarHoteles();
  }, []);

  // Generar SQL en tiempo real cuando cambien los datos
  useEffect(() => {
    generarSQLPreview();
  }, [form]);

  const generarSQLPreview = () => {
    if (form.idhotel && form.nrohabitacion && form.tipohabitacion) {
      const sql = `
-- ASIGNAR NUEVA HABITACIÓN A HOTEL
INSERT INTO habitacion (
    idhotel, 
    nrohabitacion, 
    tipohabitacion, 
    capacidad, 
    estado, 
    precio, 
    nro_piso
) VALUES (
    ${form.idhotel}, 
    ${form.nrohabitacion}, 
    '${form.tipohabitacion}', 
    ${form.capacidad ? form.capacidad : 'NULL'}, 
    '${form.estado || 'DISPONIBLE'}', 
    ${form.precio ? form.precio : 'NULL'}, 
    ${form.nro_piso ? form.nro_piso : 'NULL'}
);

-- Información de la habitación:
-- • Hotel: ${hotelSeleccionado ? hotelSeleccionado.nombreh : `ID ${form.idhotel}`}
-- • Habitación: ${form.nrohabitacion}
-- • Tipo: ${form.tipohabitacion}
-- • Estado: ${form.estado || 'DISPONIBLE'}
-- • Capacidad: ${form.capacidad || 'No especificada'} persona(s)
-- • Precio: ${form.precio ? `$${form.precio}` : 'No especificado'}
-- • Piso: ${form.nro_piso || 'No especificado'}
      `.trim();
      setSqlPreview(sql);
    } else {
      setSqlPreview('Complete los campos obligatorios (Hotel, Número y Tipo) para ver la sentencia SQL');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'idhotel') {
      const hotelId = Number(value);
      const hotel = hoteles.find(h => h.idhotel === hotelId);
      setHotelSeleccionado(hotel);
    }
    
    setForm({ ...form, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validaciones (las tuyas actuales)
  if (!form.idhotel || !form.nrohabitacion || !form.tipohabitacion) {
    setError("Complete los campos obligatorios");
    return;
  }

  try {
    if (habitacionInicial) {
      // Modo edición
      await habitacionesService.actualizarHabitacion(
        habitacionInicial.idhotel,
        habitacionInicial.nrohabitacion,
        form
      );
    } else {
      // Modo creación
      await habitacionesService.crearHabitacion(form);
    }
    onSave();
  } catch (error) {
    console.error("Error al guardar habitación:", error);
    setError("Error al guardar la habitación");
  }
};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Columna izquierda: Formulario */}
      <div>
        <form onSubmit={handleSubmit} style={{ 
          border: "1px solid #ccc", 
          padding: "20px", 
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: "white"
        }}>
          
          <h3 style={{ margin: '0 0 20px 0', color: '#17a2b8' }}>
            {habitacionInicial ? "✏️ Editar Habitación" : "🏨 Asignar Habitación a Hotel"}
          </h3>

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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hotel: *</label>
            <select 
              name="idhotel" 
              value={form.idhotel} 
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">Seleccionar hotel</option>
              {hoteles.map((h) => (
                <option key={h.idhotel} value={h.idhotel}>
                  {h.nombreh} - {h.direccion}
                </option>
              ))}
            </select>
          </div>

          {/* Información del hotel seleccionado */}
          {hotelSeleccionado && (
            <div style={{
              marginBottom: '15px',
              padding: '12px',
              backgroundColor: '#e7f3ff',
              border: '1px solid #007bff',
              borderRadius: '4px'
            }}>
              <strong>Hotel seleccionado:</strong> {hotelSeleccionado.nombreh}<br />
              <strong>Dirección:</strong> {hotelSeleccionado.direccion}<br />
              <strong>Teléfono:</strong> {hotelSeleccionado.telefonoh || 'No disponible'}<br />
              <strong>Categoría:</strong> {hotelSeleccionado.categoria ? '⭐'.repeat(hotelSeleccionado.categoria) : 'No especificada'}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número Habitación: *</label>
              <input 
                name="nrohabitacion" 
                placeholder="Ej: 101, 202" 
                value={form.nrohabitacion}
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo: *</label>
              <select 
                name="tipohabitacion" 
                value={form.tipohabitacion}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Seleccionar tipo</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="DOBLE">Doble</option>
                <option value="SUITE">Suite</option>
                <option value="FAMILIAR">Familiar</option>
                <option value="PRESIDENCIAL">Presidencial</option>
                <option value="EJECUTIVA">Ejecutiva</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Capacidad:</label>
              <input 
                name="capacidad" 
                placeholder="Ej: 2, 4" 
                type="number" 
                min="1"
                value={form.capacidad}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado:</label>
              <select 
                name="estado" 
                value={form.estado}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="OCUPADA">Ocupada</option>
                <option value="MANTENIMIENTO">En Mantenimiento</option>
                <option value="LIMPIEZA">En Limpieza</option>
                <option value="RESERVADA">Reservada</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Precio por Noche ($):</label>
              <input 
                name="precio" 
                placeholder="0.00" 
                type="number" 
                step="0.01"
                min="0"
                value={form.precio}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número de Piso:</label>
              <input 
                name="nro_piso" 
                placeholder="Ej: 1, 2, 3" 
                type="number" 
                min="0"
                value={form.nro_piso}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              💾 Guardar Habitación
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
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
                ...form,
                idhotel: form.idhotel ? parseInt(form.idhotel) : null,
                nrohabitacion: form.nrohabitacion ? parseInt(form.nrohabitacion) : null,
                capacidad: form.capacidad ? parseInt(form.capacidad) : null,
                precio: form.precio ? parseFloat(form.precio) : null,
                nro_piso: form.nro_piso ? parseInt(form.nro_piso) : null
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
            <strong>💡 Nota:</strong> La habitación se asignará al hotel seleccionado usando clave compuesta (idhotel + nrohabitacion).
          </div>
        </div>

        {/* Información adicional sobre la tabla habitacion */}
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #17a2b8', borderRadius: '8px', backgroundColor: '#d1ecf1' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>ℹ️ Estructura de la tabla habitacion</h5>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0c5460' }}>
            CREATE TABLE habitacion (<br />
            &nbsp;&nbsp;idhotel bigint NOT NULL REFERENCES hotel(idhotel),<br />
            &nbsp;&nbsp;nrohabitacion integer NOT NULL,<br />
            &nbsp;&nbsp;tipohabitacion varchar(50) NOT NULL,<br />
            &nbsp;&nbsp;capacidad integer,<br />
            &nbsp;&nbsp;estado varchar(20) DEFAULT 'DISPONIBLE',<br />
            &nbsp;&nbsp;precio numeric(12,2),<br />
            &nbsp;&nbsp;nro_piso integer,<br />
            &nbsp;&nbsp;PRIMARY KEY (idhotel, nrohabitacion)<br />
            );
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#0c5460' }}>
            <strong>Características:</strong><br />
            • Clave primaria compuesta: (idhotel, nrohabitacion)<br />
            • Foreign key: idhotel → hotel(idhotel)<br />
            • Estado por defecto: DISPONIBLE
          </div>
        </div>

        {/* Tipos de habitación comunes */}
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#d4edda' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#155724' }}>🏨 Tipos de Habitación</h5>
          <div style={{ fontSize: '12px', color: '#155724', lineHeight: '1.4' }}>
            <strong>Individual:</strong> 1 persona, cama individual<br />
            <strong>Doble:</strong> 2 personas, cama doble o 2 individuales<br />
            <strong>Suite:</strong> Sala separada, amenities premium<br />
            <strong>Familiar:</strong> 4+ personas, múltiples camas<br />
            <strong>Presidencial:</strong> Lujo máximo, suite principal<br />
            <strong>Ejecutiva:</strong> Escritorio, amenities de trabajo
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitacionesForm;