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
    const { isAdmin } = useAuth();
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
            show: isAdmin
        },
        {
            label: '2. Empenho de Materiais',
            value: counts.aguardandoCliente,
            icon: <DollarSign size={24} />,
            color: 'rgba(245, 158, 11, 0.15)',
            iconColor: '#f59e0b',
            link: '/pcp/liberar',
            show: isAdmin
        },
        {
            label: '3. Conferência Final',
            value: counts.conferenciaFinal,
            icon: <CheckCircle2 size={24} />,
            color: 'rgba(15, 23, 42, 0.1)',
            iconColor: '#0f172a',
            link: '/pcp/finalizar',
            show: isAdmin
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

    // Plugin para desenhar o texto no centro do Doughnut
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart: any) => {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            const total = chart.config.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);

            ctx.font = '800 2.5rem sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#334155'; // Slate 700
            ctx.fillText(total.toString(), width / 2, height / 2 + 10);

            ctx.font = 'bold 0.7rem sans-serif';
            ctx.fillStyle = '#94a3b8'; // Slate 400
            ctx.fillText('TOTAL PERITAGENS', width / 2, height / 2 + 35);
            ctx.restore();
        }
    };

    const barData = {
        labels: clientStats.length > 0 ? clientStats.map(s => s.name) : ['Sem dados'],
        datasets: [
            {
                label: 'Peritagens',
                data: clientStats.length > 0 ? clientStats.map(s => s.count) : [0],
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: 'rgba(59, 130, 246, 0.2)',
                barPercentage: 0.45,
                categoryPercentage: 0.8,
            },
        ],
    };

    const doughnutData = {
        labels: ['Finalizados', 'PCP Aprovação', 'Liberação Pedido', 'Oficina', 'Conferência'],
        datasets: [
            {
                data: [counts.finalizados, counts.pendentePcp, counts.aguardandoCliente, counts.manutencao, counts.conferenciaFinal],
                backgroundColor: [
                    '#059669', // Industrial Green
                    '#2563eb', // Engineering Blue
                    '#d97706', // Warning Orange
                    '#db2777', // Workshop Pink
                    '#1e293b'  // Dark Navy
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10,
                spacing: 2,
                borderRadius: 2
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#ffffff',
                bodyColor: '#cbd5e1',
                padding: 10,
                cornerRadius: 4,
                displayColors: false,
                titleFont: { size: 13, weight: 'bold' as any },
                bodyFont: { size: 12 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: '#f1f5f9',
                    drawTicks: false
                },
                ticks: {
                    stepSize: 1,
                    font: { size: 11, weight: 'bold' as any },
                    color: '#64748b'
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11, weight: 'bold' as any },
                    color: '#475569'
                },
                border: { display: false }
            }
        },
        animation: {
            duration: 800,
            easing: 'linear' as any
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: {
                position: 'right' as any,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rect',
                    padding: 15,
                    font: {
                        size: 11,
                        weight: 'bold' as any
                    },
                    color: '#475569'
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                cornerRadius: 4,
                titleFont: { weight: 'bold' as any }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: false,
            duration: 1000
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Painel de Controle</h1>
            <p className="page-subtitle">Bem-vindo ao sistema HIDRAUP. Veja o resumo das atividades.</p>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                    <span className="loading-spinner"></span> Carregando estatísticas...
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
                    <h3>Peritagens por Cliente (Top 5)</h3>
                    <div className="chart-wrapper">
                        <Bar
                            data={barData}
                            options={barOptions}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribuição por Status</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut
                            data={doughnutData}
                            options={doughnutOptions}
                            plugins={[centerTextPlugin]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
