import { useState, useEffect, useRef } from 'react';
import { deportivosService } from '../services/deportivosService';

function ReservaForm() {
    const [formData, setFormData] = useState({
        idCliente: '',
        idEmpleado: '',
        codEspacio: '',
        codCancha: '',
        codDisciplina: '',
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFin: '10:00',
        montoTotal: '100.00',
        estadoReserva: 'CONFIRMADA'
    });

    const [datosFormulario, setDatosFormulario] = useState({
        clientes: [],
        empleados: [],
        espacios: [],
        canchas: [], // Todas las canchas cargadas inicialmente
        disciplinas: []
    });
    const [canchasFiltradas, setCanchasFiltradas] = useState([]); // Canchas filtradas por espacio
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [buscandoReserva, setBuscandoReserva] = useState(false);
    const [reservaEncontrada, setReservaEncontrada] = useState(false);
    const [codigoBusqueda, setCodigoBusqueda] = useState('');
    const [cargandoCanchas, setCargandoCanchas] = useState(false);
    
    // Referencia para el timeout de búsqueda
    const timeoutRef = useRef(null);

    useEffect(() => {
        cargarDatosFormulario();
    }, []);

    // Filtrar canchas cuando se selecciona un espacio
    useEffect(() => {
        if (formData.codEspacio) {
            filtrarCanchasPorEspacio(formData.codEspacio);
        } else {
            setCanchasFiltradas([]);
            setFormData(prev => ({ ...prev, codCancha: '', codDisciplina: '' }));
        }
    }, [formData.codEspacio, datosFormulario.canchas]);

    // Cargar disciplinas cuando se selecciona una cancha
    useEffect(() => {
        if (formData.codCancha) {
            cargarDisciplinasPorCancha(formData.codCancha);
        } else {
            setDatosFormulario(prev => ({ ...prev, disciplinas: [] }));
            setFormData(prev => ({ ...prev, codDisciplina: '' }));
        }
    }, [formData.codCancha]);

    // Función para buscar reserva automáticamente cuando se escribe el código
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Solo buscar si el código tiene al menos 1 carácter y es un número
        if (codigoBusqueda && !isNaN(codigoBusqueda) && !reservaEncontrada) {
            timeoutRef.current = setTimeout(() => {
                buscarReservaPorCodigo(codigoBusqueda);
            }, 800);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [codigoBusqueda, reservaEncontrada]);

    const cargarDatosFormulario = async () => {
        try {
            console.log('Iniciando carga de datos del formulario...');
            const datos = await deportivosService.obtenerDatosFormulario();
            console.log('Datos recibidos:', datos);
            setDatosFormulario(datos);
            
            // Mostrar información de depuración en consola
            console.log('Espacios cargados:', datos.espacios);
            console.log('Canchas cargadas:', datos.canchas);
            
        } catch (error) {
            console.error('Error cargando datos del formulario:', error);
            setError('Error al cargar los datos del sistema: ' + error.message);
        }
    };

    const filtrarCanchasPorEspacio = (codEspacio) => {
        console.log('Filtrando canchas para espacio:', codEspacio);
        const canchasFiltradas = datosFormulario.canchas.filter(
            cancha => cancha.cod_espacio === (codEspacio)
        );
        console.log('Canchas filtradas:', canchasFiltradas);
        setCanchasFiltradas(canchasFiltradas);
        
        // Si no hay canchas para este espacio, mostrar advertencia
        if (canchasFiltradas.length === 0) {
            console.warn(`kjlkNo se encontraron canchas para el espacio ${codEspacio}`);
        }
    };

    const cargarDisciplinasPorCancha = async (codCancha) => {
        try {
            console.log('Cargando disciplinas para cancha:', codCancha);
            const disciplinas = await deportivosService.obtenerDisciplinasPorCancha(codCancha);
            console.log('Disciplinas recibidas:', disciplinas);
            setDatosFormulario(prev => ({ ...prev, disciplinas }));
        } catch (error) {
            console.error('Error cargando disciplinas:', error);
            setError('Error al cargar las disciplinas de la cancha seleccionada');
        }
    };

    const buscarReservaPorCodigo = async (codigo) => {
        setBuscandoReserva(true);
        try {
            const resultado = await deportivosService.obtenerReservaPorCodigo(codigo);
            
            if (resultado.encontrada && resultado.reserva) {
                const reserva = resultado.reserva;
                
                // Autocompletar todos los campos con los datos de la reserva encontrada
                setFormData(prev => ({
                    ...prev,
                    idCliente: reserva.ci_cliente.toString(),
                    idEmpleado: reserva.ci_empleado.toString(),
                    codEspacio: reserva.cod_espacio.toString(),
                    codCancha: reserva.cod_cancha.toString(),
                    codDisciplina: reserva.cod_disciplina.toString(),
                    fecha: reserva.fecha,
                    horaInicio: reserva.hora_inicio,
                    horaFin: reserva.hora_fin,
                    montoTotal: reserva.monto_total.toString(),
                    estadoReserva: reserva.estado_reserva
                }));

                setReservaEncontrada(true);
                setSuccess(`✅ Reserva #${reserva.cod_reserva} encontrada: ${reserva.cliente_nombre} ${reserva.cliente_apellido} - ${reserva.espacio_nombre}`);
                
            } else {
                setReservaEncontrada(false);
                if (success) setSuccess('');
            }
        } catch (error) {
            console.error('Error buscando reserva:', error);
            setReservaEncontrada(false);
            if (success) setSuccess('');
        } finally {
            setBuscandoReserva(false);
        }
    };

    const handleCodigoBusquedaChange = (e) => {
        const value = e.target.value;
        
        // Solo permitir números
        if (value === '' || /^\d+$/.test(value)) {
            setCodigoBusqueda(value);
            
            if (reservaEncontrada) {
                setReservaEncontrada(false);
                setSuccess('');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (error) setError('');
    };

    const limpiarFormulario = () => {
        setFormData({
            idCliente: '',
            idEmpleado: '',
            codEspacio: '',
            codCancha: '',
            codDisciplina: '',
            fecha: new Date().toISOString().split('T')[0],
            horaInicio: '08:00',
            horaFin: '10:00',
            montoTotal: '100.00',
            estadoReserva: 'CONFIRMADA'
        });
        setCodigoBusqueda('');
        setReservaEncontrada(false);
        setSuccess('');
        setError('');
        setCanchasFiltradas([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Validaciones básicas
        if (!formData.idCliente || !formData.idEmpleado || !formData.codCancha || !formData.codDisciplina) {
            setError('Complete todos los campos obligatorios');
            setLoading(false);
            return;
        }

        try {
            const resultado = await deportivosService.crearReserva(formData);
            setSuccess(`Reserva deportiva #${resultado.reserva.cod_reserva} creada exitosamente`);
            limpiarFormulario();
        } catch (error) {
            console.error('Error al crear reserva:', error);
            setError(error.response?.data?.detalle || 'Error al crear la reserva deportiva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h2 style={{ 
                color: '#2c3e50', 
                marginBottom: '25px', 
                borderBottom: '2px solid #3498db', 
                paddingBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                🏟️ Formulario de Reserva - Sistema Deportivo
            </h2>

            {error && (
                <div style={{ 
                    color: '#e74c3c', 
                    backgroundColor: '#fadbd8', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '20px',
                    border: '1px solid #e74c3c',
                    fontWeight: '500'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div style={{ 
                    color: '#27ae60', 
                    backgroundColor: '#d5f4e6', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '20px',
                    border: '1px solid #27ae60',
                    fontWeight: '500'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ 
                    backgroundColor: '#ecf0f1', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '25px',
                    border: '2px solid #3498db'
                }}>
                    <h3 style={{ 
                        color: '#2c3e50', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📋 DATOS DE LA RESERVA
                    </h3>
                    
                    {/* Sección de búsqueda de reserva existente */}
                    <div style={{ 
                        backgroundColor: reservaEncontrada ? '#e8f6f3' : '#fff9e6', 
                        padding: '15px', 
                        borderRadius: '6px', 
                        marginBottom: '20px',
                        border: `2px solid ${reservaEncontrada ? '#27ae60' : '#f39c12'}`
                    }}>
                        <h4 style={{ 
                            color: reservaEncontrada ? '#27ae60' : '#e67e22',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}>
                            {reservaEncontrada ? '✅ RESERVA ENCONTRADA' : '🔍 BUSCAR RESERVA EXISTENTE'}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', alignItems: 'end' }}>
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: 'bold', 
                                    color: '#2c3e50',
                                    fontSize: '14px'
                                }}>
                                    Buscar por Número
                                    {buscandoReserva && (
                                        <span style={{ 
                                            marginLeft: '10px', 
                                            fontSize: '12px', 
                                            color: '#3498db',
                                            fontWeight: 'normal'
                                        }}>
                                            🔍 Buscando...
                                        </span>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={codigoBusqueda}
                                        onChange={handleCodigoBusquedaChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px', 
                                            paddingRight: '40px',
                                            borderRadius: '6px', 
                                            border: `2px solid ${reservaEncontrada ? '#27ae60' : '#bdc3c7'}`,
                                            fontSize: '14px',
                                            backgroundColor: reservaEncontrada ? '#f0fff4' : 'white'
                                        }}
                                        placeholder="Ej: 1, 2, 3..."
                                    />
                                    {reservaEncontrada && (
                                        <span style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#27ae60',
                                            fontSize: '16px'
                                        }}>
                                            ✅
                                        </span>
                                    )}
                                </div>
                                <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                    {reservaEncontrada 
                                        ? 'Reserva encontrada - Los campos se han autocompletado' 
                                        : 'Ingrese un número de reserva para autocompletar los campos'
                                    }
                                </small>
                            </div>

                            <div>
                                <button 
                                    type="button"
                                    onClick={() => buscarReservaPorCodigo(codigoBusqueda)}
                                    disabled={!codigoBusqueda || buscandoReserva}
                                    style={{ 
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: (!codigoBusqueda || buscandoReserva) ? '#95a5a6' : '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        cursor: (!codigoBusqueda || buscandoReserva) ? 'not-allowed' : 'pointer',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}
                                >
                                    {buscandoReserva ? 'Buscando...' : 'Buscar Reserva'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Fila 1: Fecha y Horarios */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Fecha
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Hora Inicio
                            </label>
                            <input
                                type="time"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Hora Fin
                            </label>
                            <input
                                type="time"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Fila 2: Cliente que reservó | Empleado que autorizó */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Cliente que reservó *
                            </label>
                            <select
                                name="idCliente"
                                value={formData.idCliente}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Seleccionar cliente</option>
                                {datosFormulario.clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} {cliente.apellido_p} - CI: {cliente.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Empleado que autorizó *
                            </label>
                            <select
                                name="idEmpleado"
                                value={formData.idEmpleado}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Seleccionar empleado</option>
                                {datosFormulario.empleados.map(empleado => (
                                    <option key={empleado.id} value={empleado.id}>
                                        {empleado.nombre} {empleado.apellido_p} - CI: {empleado.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Espacio Deportivo | Cancha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Espacio Deportivo
                            </label>
                            <select
                                name="codEspacio"
                                value={formData.codEspacio}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Seleccionar espacio deportivo</option>
                                {datosFormulario.espacios.map(espacio => (
                                    <option key={espacio.cod_espacio} value={espacio.cod_espacio}>
                                        {espacio.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Cancha *
                                {formData.codEspacio && canchasFiltradas.length === 0 && (
                                    <span style={{ 
                                        marginLeft: '10px', 
                                        fontSize: '12px', 
                                        color: '#e74c3c',
                                        fontWeight: 'normal'
                                    }}>
                                        ⚠️ No hay canchas
                                    </span>
                                )}
                            </label>
                            <select
                                name="codCancha"
                                value={formData.codCancha}
                                onChange={handleChange}
                                required
                                disabled={!formData.codEspacio || canchasFiltradas.length === 0}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    opacity: (formData.codEspacio && canchasFiltradas.length > 0) ? 1 : 0.6
                                }}
                            >
                                <option value="">
                                    {!formData.codEspacio 
                                        ? 'Primero seleccione un espacio' 
                                        : canchasFiltradas.length === 0 
                                            ? 'No hay canchas disponibles' 
                                            : 'Seleccionar cancha'
                                    }
                                </option>
                                {canchasFiltradas.map(cancha => (
                                    <option key={cancha.cod_cancha} value={cancha.cod_cancha}>
                                        Cancha {cancha.cod_cancha} - {cancha.tipo_superficie} {cancha.techado === 'SI' ? '(Techada)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fila 4: Disciplina | Monto Total */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Disciplina *
                            </label>
                            <select
                                name="codDisciplina"
                                value={formData.codDisciplina}
                                onChange={handleChange}
                                required
                                disabled={!formData.codCancha}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    opacity: formData.codCancha ? 1 : 0.6
                                }}
                            >
                                <option value="">{formData.codCancha ? 'Seleccionar disciplina' : 'Primero seleccione una cancha'}</option>
                                {datosFormulario.disciplinas.map(disciplina => (
                                    <option key={disciplina.cod_disciplina} value={disciplina.cod_disciplina}>
                                        {disciplina.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Monto Total ($)
                            </label>
                            <input
                                type="number"
                                name="montoTotal"
                                value={formData.montoTotal}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px'
                                }}
                                placeholder="Ej: 100.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                    <button 
                        type="button"
                        onClick={limpiarFormulario}
                        style={{ 
                            padding: '12px 25px', 
                            backgroundColor: '#95a5a6', 
                            color: 'white', 
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        🗑️ Limpiar
                    </button>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        style={{ 
                            padding: '12px 25px', 
                            backgroundColor: loading ? '#95a5a6' : '#3498db', 
                            color: 'white', 
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {loading ? '⏳ Creando...' : '💾 Crear Nueva Reserva'}
                    </button>
                </div>
            </form>

            {/* Información de depuración (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    marginTop: '25px', 
                    padding: '15px', 
                    backgroundColor: '#2c3e50', 
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    <h4 style={{ marginBottom: '10px', color: '#3498db' }}>🔧 Información de Depuración</h4>
                    <div>Espacios cargados: {datosFormulario.espacios.length}</div>
                    <div>Canchas totales: {datosFormulario.canchas.length}</div>
                    <div>Canchas filtradas: {canchasFiltradas.length}</div>
                    <div>Espacio seleccionado: {formData.codEspacio || 'Ninguno'}</div>
                </div>
            )}
        </div>
    );
}

export default ReservaForm;