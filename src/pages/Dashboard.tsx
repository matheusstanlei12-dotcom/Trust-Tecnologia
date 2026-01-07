import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    FileText,
    DollarSign,
    Wrench,
    CheckCircle2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [counts, setCounts] = React.useState({
        total: 0,
        aguardando: 0,
        manutencao: 0,
        finalizados: 0,
        pendentePcp: 0,
        aguardandoCliente: 0,
        conferenciaFinal: 0
    });
    const [clientStats, setClientStats] = React.useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('status, cliente');

            if (error) throw error;

            if (data) {
                const total = data.length;
                const pendentePcp = data.filter(p => p.status === 'AGUARDANDO APROVAÇÃO DO PCP' || p.status === 'PERITAGEM CRIADA').length;
                const aguardandoCliente = data.filter(p => p.status === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || p.status === 'Aguardando Clientes').length;
                const manutencao = data.filter(p => p.status === 'EM MANUTENÇÃO' || p.status === 'Cilindros em Manutenção').length;
                const conferenciaFinal = data.filter(p => p.status === 'AGUARDANDO CONFERÊNCIA FINAL').length;
                const finalizados = data.filter(p => p.status === 'PROCESSO FINALIZADO' || p.status === 'Finalizados' || p.status === 'ORÇAMENTO FINALIZADO').length;

                setCounts({ total, aguardando: aguardandoCliente, manutencao, finalizados, pendentePcp, aguardandoCliente, conferenciaFinal });

                // Processar estatísticas por cliente
                const clients = data.map(p => p.cliente || 'Sem Cliente');
                const clientCounts: { [key: string]: number } = {};
                clients.forEach(c => {
                    clientCounts[c] = (clientCounts[c] || 0) + 1;
                });

                const sortedClients = Object.entries(clientCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setClientStats(sortedClients);
            }
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: '1. Aprovação de Peritagem',
            value: counts.pendentePcp,
            icon: <FileText size={24} />,
            color: 'rgba(59, 130, 246, 0.15)',
            iconColor: '#3b82f6',
            link: '/pcp/aprovar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: '2. Liberação de Pedido',
            value: counts.aguardandoCliente,
            icon: <DollarSign size={24} />,
            color: 'rgba(245, 158, 11, 0.15)',
            iconColor: '#f59e0b',
            link: '/pcp/liberar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: '3. Conferência Final',
            value: counts.conferenciaFinal,
            icon: <CheckCircle2 size={24} />,
            color: 'rgba(15, 23, 42, 0.1)',
            iconColor: '#0f172a',
            link: '/pcp/finalizar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: 'Em Manutenção',
            value: counts.manutencao,
            icon: <Wrench size={24} />,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: '#10b981',
            link: '/monitoramento',
            show: true
        },
        {
            label: 'Finalizados',
            value: counts.finalizados,
            icon: <CheckCircle2 size={24} />,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: '#10b981',
            link: '/monitoramento',
            show: true
        },
    ];

    const barData = {
        labels: clientStats.length > 0 ? clientStats.map(s => s.name) : ['Sem dados'],
        datasets: [
            {
                label: 'Peritagens',
                data: clientStats.length > 0 ? clientStats.map(s => s.count) : [0],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899'
                ],
                borderWidth: 2,
                borderRadius: 12,
                hoverBackgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899'
                ],
                hoverBorderWidth: 0,
                barPercentage: 0.6,
            },
        ],
    };

    const doughnutData = {
        labels: ['Finalizados', 'PCP Aprovação', 'Liberação Pedido', 'Oficina', 'Conferência'],
        datasets: [
            {
                data: [counts.finalizados, counts.pendentePcp, counts.aguardandoCliente, counts.manutencao, counts.conferenciaFinal],
                backgroundColor: [
                    '#10b981', // Sucesso
                    '#3b82f6', // Info
                    '#f59e0b', // Alerta
                    '#ec4899', // Oficina
                    '#1e293b'  // Dark
                ],
                hoverOffset: 20,
                borderWidth: 4,
                borderColor: '#ffffff',
                spacing: 5,
                borderRadius: 8
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                padding: 12,
                borderColor: '#e2e8f0',
                borderWidth: 1,
                usePointStyle: true,
                boxPadding: 6,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.03)',
                    drawTicks: false,
                },
                ticks: {
                    stepSize: 1,
                    font: { weight: 'bold' }
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { weight: 'bold' }
                },
                border: { display: false }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    } as const;

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                padding: 12,
                borderColor: '#e2e8f0',
                borderWidth: 1,
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeOutBack'
        }
    } as const;

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Painel de Controle</h1>
            <p className="page-subtitle">Acompanhe a performance operacional da Hidraup em tempo real.</p>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <span className="loading-spinner"></span>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Carregando estatísticas inteligentes...</p>
                </div>
            ) : (
                <div className="stats-grid">
                    {stats.filter(s => s.show).map((stat, index) => (
                        <div
                            key={index}
                            className="stat-card clickable"
                            onClick={() => navigate(stat.link)}
                        >
                            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color, color: stat.iconColor }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Volume de Peritagens por Cliente</h3>
                    <div className="chart-wrapper">
                        <Bar
                            data={barData}
                            options={barOptions}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribuição Estratégica</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut
                            data={doughnutData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
