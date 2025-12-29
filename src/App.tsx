import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Peritagens } from './pages/Peritagens';
import { Monitoramento } from './pages/Monitoramento';
import { Relatorios } from './pages/Relatorios';
import { NovaPeritagem } from './pages/NovaPeritagem';
import { Clientes } from './pages/Clientes';
import { Manutencao } from './pages/Manutencao';
import { Layout } from './components/Layout';
import { supabase } from './lib/supabase';
import './index.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Ou um loader global

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return session ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/peritagens" element={<PrivateRoute><Layout><Peritagens /></Layout></PrivateRoute>} />
        <Route path="/monitoramento" element={<PrivateRoute><Layout><Monitoramento /></Layout></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>} />
        <Route path="/manutencao" element={<PrivateRoute><Layout><Manutencao /></Layout></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute><Layout><Relatorios /></Layout></PrivateRoute>} />
        <Route path="/nova-peritagem" element={<PrivateRoute><Layout><NovaPeritagem /></Layout></PrivateRoute>} />

        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
