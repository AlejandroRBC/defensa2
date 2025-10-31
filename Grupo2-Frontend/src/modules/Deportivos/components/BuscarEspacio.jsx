import { useState } from "react";
import { deportivosService } from "../services/deportivosService";

function BuscarEspacio() {
  const [codigo, setCodigo] = useState("");
  const [espacio, setEspacio] = useState(null);
  const [error, setError] = useState("");

  const buscarEspacio = async () => {
    try {
      const data = await deportivosService.buscarEspacio(codigo);
      setEspacio(data);
      setError("");
    } catch (err) {
      setError("No se encontró el espacio deportivo.");
      setEspacio(null);
    }
  };

  return (
    <div className="container p-4">
      <h2>Buscar Espacio Deportivo</h2>
      <input
        type="number"
        placeholder="Código del espacio"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button onClick={buscarEspacio}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {espacio && (
        <div className="resultado mt-4">
          <p><strong>Cod_Espacio:</strong>{espacio.cod_espacio}</p>
          <p><strong>Nombre EspacioDeportivo:</strong>{espacio.nombre}</p>
          <p><strong>Número de canchas:</strong> {espacio.nro_canchas}</p>
          <p><strong>Número de reservas:</strong> {espacio.nro_reservas}</p>
          <p><strong>Total pagado:</strong> Bs. {espacio.total_pago}</p>
        </div>
      )}
    </div>
  );
}

export default BuscarEspacio;
