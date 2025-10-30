import { useState } from 'react';
import ReservaForm from './components/ReservaForm';
import EspaciosDeportivos from './components/EspaciosDeportivos';

function Deportivos() {
    const [vistaActual, setVistaActual] = useState('reserva');

    return (
        <div>
            <h1 style={{ 
                color: '#2c3e50', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                Sistema de Gestión Deportiva - Grupo 7
            </h1>

            {/* Botones de navegación */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: '#ecf0f1',
                borderRadius: '8px'
            }}>
                <button
                    onClick={() => setVistaActual('reserva')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: vistaActual === 'reserva' ? '#3498db' : '#95a5a6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                    }}
                >
                     Formulario de Reserva
                </button>
                <button
                    onClick={() => setVistaActual('espacios')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: vistaActual === 'espacios' ? '#e74c3c' : '#95a5a6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                    }}
                >
                     Datos Espacios Deportivos
                </button>
            </div>

            {/* Contenido de la vista actual */}
            <div>
                {vistaActual === 'reserva' && <ReservaForm />}
                    
                {vistaActual === 'espacios' && <EspaciosDeportivos />}
            </div>
        </div>
    );
}

export default Deportivos;