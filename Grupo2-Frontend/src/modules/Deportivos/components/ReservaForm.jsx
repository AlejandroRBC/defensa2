import { useState, useEffect, useRef } from 'react';
import { deportivosService } from '../services/deportivosService';

function ReservaForm() {
    const [formData, setFormData] = useState({
        idCliente: '',
        idEmpleado: '',
        codEspacio: '',
        codCancha: '',
        tipoSuperficie: '',
        codDisciplina: '',
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFin: '10:00',
        montoTotal: '100.00',
        estadoReserva: 'CONFIRMADA',
        numeroJugadores: '0'
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [buscandoReserva, setBuscandoReserva] = useState(false);
    const [reservaEncontrada, setReservaEncontrada] = useState(null);
    const [codigoBusqueda, setCodigoBusqueda] = useState('');
    const [mostrarDetalleJugadores, setMostrarDetalleJugadores] = useState(false);
    
    const timeoutRef = useRef(null);

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

    const buscarReservaPorCodigo = async (codigo) => {
        if (!codigo || codigo.trim() === '') {
            setReservaEncontrada(null);
            return;
        }

        setBuscandoReserva(true);
        try {
            const resultado = await deportivosService.obtenerReservaPorCodigo(codigo);
            
            if (resultado.encontrada && resultado.reserva) {
                const reserva = resultado.reserva;
                
                console.log('Reserva encontrada:', reserva);
                
                // Autocompletar todos los campos con los datos de la reserva encontrada
                setFormData({
                    idCliente: reserva.ci_cliente.toString(),
                    idEmpleado: reserva.ci_empleado.toString(),
                    codEspacio: reserva.cod_espacio.toString(),
                    codCancha: reserva.cod_cancha.toString(),
                    tipoSuperficie: reserva.tipo_superficie,
                    codDisciplina: reserva.cod_disciplina.toString(),
                    fecha: reserva.fecha,
                    horaInicio: reserva.hora_inicio,
                    horaFin: reserva.hora_fin,
                    montoTotal: reserva.monto_total.toString(),
                    estadoReserva: reserva.estado_reserva,
                    numeroJugadores: reserva.numero_jugadores
                });

                setReservaEncontrada(reserva);
                setSuccess(`✅ Reserva #${reserva.cod_reserva} encontrada - ${reserva.numero_jugadores} jugadores registrados`);
                setError('');
                
            } else {
                setReservaEncontrada(null);
                setSuccess('');
                setError(resultado.error || 'Reserva no encontrada');
            }
        } catch (error) {
            console.error('Error buscando reserva:', error);
            setReservaEncontrada(null);
            setSuccess('');
            setError('Error al buscar la reserva');
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
                // Si ya hay una reserva encontrada y el usuario cambia el código, limpiar el formulario
                setReservaEncontrada(null);
                setSuccess('');
                limpiarFormulario();
            }
        }
    };

    const handleChange = (e) => {
        // Si hay una reserva encontrada, no permitir cambios en los campos
        if (reservaEncontrada) {
            setError('No puede modificar los datos de una reserva existente. Busque otra reserva o limpie el formulario.');
            return;
        }

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
            tipoSuperficie: '',
            codDisciplina: '',
            fecha: new Date().toISOString().split('T')[0],
            horaInicio: '08:00',
            horaFin: '10:00',
            montoTotal: '100.00',
            estadoReserva: 'CONFIRMADA',
            numeroJugadores: '0'
        });
        setCodigoBusqueda('');
        setReservaEncontrada(null);
        setSuccess('');
        setError('');
        setMostrarDetalleJugadores(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Si hay una reserva encontrada, no permitir crear nueva
        if (reservaEncontrada) {
            setError('No puede crear una nueva reserva mientras tiene una reserva existente cargada. Limpie el formulario primero.');
            return;
        }

        setLoading(true);
        
        // Validaciones básicas
        if (!formData.idCliente || !formData.idEmpleado || !formData.codCancha || !formData.codDisciplina) {
            setError('Complete todos los campos obligatorios');
            setLoading(false);
            return;
        }

        try {
            // Asegurar formato correcto de la fecha
            const datosConFechaCorregida = {
                ...formData,
                fecha: formData.fecha.split('T')[0] // Asegurar formato yyyy-MM-dd
            };

            const resultado = await deportivosService.crearReserva(datosConFechaCorregida);
            setSuccess(`Reserva deportiva #${resultado.reserva.cod_reserva} creada exitosamente`);
            limpiarFormulario();
        } catch (error) {
            console.error('Error al crear reserva:', error);
            setError(error.response?.data?.detalle || 'Error al crear la reserva deportiva');
        } finally {
            setLoading(false);
        }
    };

    // Función para determinar si un campo debe estar deshabilitado
    const isFieldDisabled = (fieldName) => {
        return reservaEncontrada !== null;
    };

    // Función para formatear hora
    const formatearHora = (hora) => {
        if (!hora) return 'No registrada';
        return hora.substring(0, 5); // Mostrar solo HH:MM
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
                🏟️ Sistema de Reservas Deportivas
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
                        🔍 BUSCAR RESERVA EXISTENTE
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', alignItems: 'end' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Número de Reserva
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
                                Ingrese el número de reserva para cargar los datos
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

                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '25px', 
                    borderRadius: '8px', 
                    marginBottom: '25px',
                    border: '2px solid #e74c3c',
                    opacity: reservaEncontrada ? 0.7 : 1
                }}>
                    <h3 style={{ 
                        color: '#2c3e50', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📋 {reservaEncontrada ? 'INFORMACIÓN DE LA RESERVA' : 'NUEVA RESERVA'}
                    </h3>

                    {/* Información de la reserva encontrada */}
                    {reservaEncontrada && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#e8f6f3',
                            border: '2px solid #27ae60',
                            borderRadius: '6px'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>
                                Reserva #{reservaEncontrada.cod_reserva} - {reservaEncontrada.estado_reserva}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                                <div><strong>Cliente:</strong> {reservaEncontrada.cliente_nombre} {reservaEncontrada.cliente_apellido}</div>
                                <div><strong>Empleado:</strong> {reservaEncontrada.empleado_nombre} {reservaEncontrada.empleado_apellido}</div>
                                <div><strong>Espacio:</strong> {reservaEncontrada.espacio_nombre}</div>
                                <div><strong>Cancha:</strong> #{reservaEncontrada.cod_cancha} - {reservaEncontrada.tipo_superficie}</div>
                                <div><strong>Disciplina:</strong> {reservaEncontrada.disciplina_nombre}</div>
                                <div><strong>Fecha:</strong> {reservaEncontrada.fecha}</div>
                                <div><strong>Horario:</strong> {reservaEncontrada.hora_inicio} - {reservaEncontrada.hora_fin}</div>
                                <div><strong>Monto:</strong> ${reservaEncontrada.monto_total}</div>
                                <div><strong>Jugadores Registrados:</strong> 
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color: reservaEncontrada.numero_jugadores > 0 ? '#27ae60' : '#e74c3c',
                                        marginLeft: '5px'
                                    }}>
                                        {reservaEncontrada.numero_jugadores}
                                    </span>
                                    {reservaEncontrada.numero_jugadores > 0 && (
                                        <button 
                                            type="button"
                                            onClick={() => setMostrarDetalleJugadores(!mostrarDetalleJugadores)}
                                            style={{
                                                marginLeft: '10px',
                                                padding: '2px 8px',
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {mostrarDetalleJugadores ? 'Ocultar' : 'Ver Detalle'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Detalle de jugadores */}
                            {mostrarDetalleJugadores && reservaEncontrada.jugadores && reservaEncontrada.jugadores.length > 0 && (
                                <div style={{ 
                                    marginTop: '15px', 
                                    padding: '10px',
                                    backgroundColor: '#d5f4e6',
                                    borderRadius: '4px',
                                    border: '1px solid #27ae60'
                                }}>
                                    <h5 style={{ margin: '0 0 8px 0', color: '#155724' }}>👥 Jugadores Registrados:</h5>
                                    <div style={{ fontSize: '12px' }}>
                                        {reservaEncontrada.jugadores.map((jugador, index) => (
                                            <div key={index} style={{ 
                                                padding: '5px 0',
                                                borderBottom: index < reservaEncontrada.jugadores.length - 1 ? '1px solid #b8e0c9' : 'none'
                                            }}>
                                                <strong>{jugador.nombre} {jugador.apellido_p}</strong> (CI: {jugador.ci_cliente})<br />
                                                Ingreso: {formatearHora(jugador.hora_ingreso)} | 
                                                Salida: {formatearHora(jugador.hora_salida)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                                disabled={isFieldDisabled('fecha')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('fecha') ? '#e9ecef' : 'white'
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
                                disabled={isFieldDisabled('horaInicio')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('horaInicio') ? '#e9ecef' : 'white'
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
                                disabled={isFieldDisabled('horaFin')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('horaFin') ? '#e9ecef' : 'white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Fila 2: IDs de Cliente y Empleado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                CI Cliente *
                            </label>
                            <input
                                type="text"
                                name="idCliente"
                                value={formData.idCliente}
                                onChange={handleChange}
                                disabled={isFieldDisabled('idCliente')}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('idCliente') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: 1234567"
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
                                CI Empleado *
                            </label>
                            <input
                                type="text"
                                name="idEmpleado"
                                value={formData.idEmpleado}
                                onChange={handleChange}
                                disabled={isFieldDisabled('idEmpleado')}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('idEmpleado') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: 1234567"
                            />
                        </div>
                    </div>

                    {/* Fila 3: Códigos de Cancha y Tipo de Superficie */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Código Cancha *
                            </label>
                            <input
                                type="text"
                                name="codCancha"
                                value={formData.codCancha}
                                onChange={handleChange}
                                disabled={isFieldDisabled('codCancha')}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('codCancha') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: 1"
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
                                Tipo de Superficie
                            </label>
                            <input
                                type="text"
                                name="tipoSuperficie"
                                value={formData.tipoSuperficie}
                                onChange={handleChange}
                                disabled={isFieldDisabled('tipoSuperficie')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('tipoSuperficie') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: Césped Natural"
                            />
                        </div>
                    </div>

                    {/* Fila 4: Disciplina, Monto y Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Código Disciplina *
                            </label>
                            <input
                                type="text"
                                name="codDisciplina"
                                value={formData.codDisciplina}
                                onChange={handleChange}
                                disabled={isFieldDisabled('codDisciplina')}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('codDisciplina') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: 1"
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
                                Monto Total ($)
                            </label>
                            <input
                                type="number"
                                name="montoTotal"
                                value={formData.montoTotal}
                                onChange={handleChange}
                                disabled={isFieldDisabled('montoTotal')}
                                step="0.01"
                                min="0"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('montoTotal') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: 100.00"
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
                                Estado
                            </label>
                            <input
                                type="text"
                                name="estadoReserva"
                                value={formData.estadoReserva}
                                onChange={handleChange}
                                disabled={isFieldDisabled('estadoReserva')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: isFieldDisabled('estadoReserva') ? '#e9ecef' : 'white'
                                }}
                                placeholder="Ej: CONFIRMADA"
                            />
                        </div>
                    </div>

                    {/* Fila 5: Número de Jugadores (solo para nuevas reservas) */}
                    {!reservaEncontrada && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                Número de Jugadores Esperados
                            </label>
                            <input
                                type="number"
                                name="numeroJugadores"
                                value={formData.numeroJugadores}
                                onChange={handleChange}
                                min="0"
                                max="50"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '6px', 
                                    border: '2px solid #bdc3c7',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                                placeholder="Ej: 10"
                            />
                            <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                Número estimado de jugadores para esta reserva
                            </small>
                        </div>
                    )}
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
                        🗑️ Limpiar Formulario
                    </button>
                    
                    {!reservaEncontrada && (
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
                    )}
                </div>
            </form>
        </div>
    );
}

export default ReservaForm;