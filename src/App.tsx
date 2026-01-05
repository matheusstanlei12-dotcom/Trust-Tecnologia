import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Peritagens } from './pages/Peritagens';
import { Monitoramento } from './pages/Monitoramento';
import { Relatorios } from './pages/Relatorios';
import { NovaPeritagem } from './pages/NovaPeritagem';
import { Clientes } from './pages/Clientes';
import { Manutencao } from './pages/Manutencao';
import { PcpAprovaPeritagem } from './pages/PcpAprovaPeritagem';
import { PcpLiberaPedido } from './pages/PcpLiberaPedido';
import { PcpFinalizaProcesso } from './pages/PcpFinalizaProcesso';
import { AdminUsers } from './pages/AdminUsers';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, role, loading } = useAuth();

  const isApp = Capacitor.getPlatform() !== 'web';
  const isPerito = role === 'perito';
  const isRestricted = isApp || isPerito;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;

  if (!session) return <Navigate to="/login" />;

  // Se for restrito (App ou Perito), só pode acessar Nova Peritagem e Minhas Peritagens
  const currentPath = window.location.pathname;
  const isAllowedPath = currentPath === '/nova-peritagem' || currentPath === '/peritagens';

  if (isRestricted && !isAllowedPath) {
    return <Navigate to="/peritagens" />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/peritagens" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { session, loading, role } = useAuth();

  if (loading) return null;

  const isApp = Capacitor.getPlatform() !== 'web';
  const isPerito = role === 'perito';
  const isRestricted = isApp || isPerito;

  const defaultPath = isRestricted ? "/peritagens" : "/dashboard";

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to={defaultPath} /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to={defaultPath} /> : <RegisterPage />} />

      <Route path="/" element={<Navigate to={session ? defaultPath : "/login"} replace />} />

      {/* Rotas Protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/peritagens" element={<PrivateRoute><Layout><Peritagens /></Layout></PrivateRoute>} />
      <Route path="/monitoramento" element={<PrivateRoute><Layout><Monitoramento /></Layout></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>} />
      <Route path="/manutencao" element={<PrivateRoute><Layout><Manutencao /></Layout></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Layout><Relatorios /></Layout></PrivateRoute>} />
      <Route path="/nova-peritagem" element={<PrivateRoute><Layout><NovaPeritagem /></Layout></PrivateRoute>} />

      {/* Rotas de Fluxo PCP */}
      <Route path="/pcp/aprovar" element={<PrivateRoute allowedRoles={['pcp', 'gestor']}><Layout><PcpAprovaPeritagem /></Layout></PrivateRoute>} />
      <Route path="/pcp/liberar" element={<PrivateRoute allowedRoles={['pcp', 'gestor']}><Layout><PcpLiberaPedido /></Layout></PrivateRoute>} />
      <Route path="/pcp/finalizar" element={<PrivateRoute allowedRoles={['pcp', 'gestor']}><Layout><PcpFinalizaProcesso /></Layout></PrivateRoute>} />

      {/* Rota Exclusiva Gestor */}
      <Route path="/admin/usuarios" element={
        <PrivateRoute allowedRoles={['gestor']}>
          <Layout><AdminUsers /></Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
