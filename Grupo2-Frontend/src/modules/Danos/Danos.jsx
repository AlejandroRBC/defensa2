import { useState } from 'react';
import DanosForm from './components/DanosForm';
import ListarDanos from './components/ListarDanos';

const Danos = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDanoReportado = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container-fluid">
      <h1 className="my-4">🚨 Gestión de Daños</h1>
      
      <div className="row">
        <div className="col-md-4">
          <DanosForm onDanoReportado={handleDanoReportado} />
        </div>
        
        <div className="col-md-8">
          <ListarDanos key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default Danos;