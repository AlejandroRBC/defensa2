import './App.css'
import { useState } from 'react'
import Clientes from "./modules/Clientes/Clientes";
import Hoteles from "./modules/Hoteles/Hoteles";
import Ingresos from "./modules/Ingresos/Ingresos";
import Danos from './modules/Danos/Danos';
import Habitaciones from "./modules/Habitaciones/Habitaciones";
import Empleados from "./modules/Empleados/Empleados";
import Reservas from "./modules/Reservas/Reservas";
import Deportivos from "./modules/Deportivos/Deportivos";

function App() {
  const [moduloActual, setModuloActual] = useState('clientes');

  const modulos = [
    { key: 'clientes', label: 'Clientes', icon: '' },
    { key: 'empleados', label: 'Empleados', icon: '' },
    { key: 'hoteles', label: 'Hoteles', icon: '' },
    { key: 'habitaciones', label: 'Habitaciones', icon: '' },
    { key: 'ingresos', label: 'Ingresos', icon: '' },
    { key: 'danos', label: 'Daños', icon: '' },
    { key: 'reservas', label: 'Reservas', icon: '' },
     { key: 'deportivos', label: 'Sistema Deportivo', icon: '' } 
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navbar Mejorado */}
      <nav style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo y Título */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px 0'
          }}>
            
            <h1 style={{
              margin: 0,
              color: 'white',
              fontSize: '24px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Sistema Hotelero
            </h1>
          </div>

          {/* Menú de Navegación */}
          <div style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center'
          }}>
            {modulos.map((modulo) => (
              <button
                key={modulo.key}
                onClick={() => setModuloActual(modulo.key)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: moduloActual === modulo.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (moduloActual !== modulo.key) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (moduloActual !== modulo.key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{modulo.icon}</span>
                {modulo.label}
                {moduloActual === modulo.key && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '3px',
                    backgroundColor: 'white',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            ))}
          </div>

          
        </div>
      </nav>


      {/* Contenido Principal */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {moduloActual === 'clientes' && <Clientes />}
          {moduloActual === 'empleados' && <Empleados />}
          {moduloActual === 'hoteles' && <Hoteles />}
          {moduloActual === 'habitaciones' && <Habitaciones />}
          {moduloActual === 'ingresos' && <Ingresos />}
          {moduloActual === 'danos' && <Danos />}
          {moduloActual === 'reservas' && <Reservas />}
          
          {moduloActual === 'deportivos' && <Deportivos />}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '50px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '14px',
            opacity: '0.8'
          }}>
           Sistema de Gestión Hotelera - Grupo 2 © 2025
          </p>
          <div style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            fontSize: '12px',
            opacity: '0.6'
          }}>
            <span>📊 Base de Datos</span>
            <span>⚛️ React</span>
            <span>🚀 Node.js</span>
            <span>🐘 PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App