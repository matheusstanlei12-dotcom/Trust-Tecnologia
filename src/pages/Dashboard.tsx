import React from 'react';
import { supabase } from '../lib/supabase';
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
    const [counts, setCounts] = React.useState({
        total: 0,
        aguardando: 0,
        manutencao: 0,
        finalizados: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('status');

            if (error) throw error;

            if (data) {
                const total = data.length;
                const aguardando = data.filter(p => p.status === 'Aguardando Clientes').length;
                const manutencao = data.filter(p => p.status === 'Cilindros em Manutenção').length;
                const finalizados = data.filter(p => p.status === 'Finalizados' || p.status === 'ORÇAMENTO FINALIZADO').length;

                setCounts({ total, aguardando, manutencao, finalizados });
            }
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total de Peritagens', value: counts.total, icon: <FileText size={32} color="#3182ce" />, color: '#ebf8ff' },
        { label: 'Aguardando Clientes', value: counts.aguardando, icon: <DollarSign size={32} color="#ed8936" />, color: '#fffaf0' },
        { label: 'Cilindros em Manutenção', value: counts.manutencao, icon: <Wrench size={32} color="#38a169" />, color: '#f0fff4' },
        { label: 'Finalizados', value: counts.finalizados, icon: <CheckCircle2 size={32} color="#48bb78" />, color: '#f0fff4' },
    ];

    const barData = {
        labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'],
        datasets: [
            {
                label: 'Peritagens',
                data: [1, 0, 0, 0, 0],
                backgroundColor: '#1b7a3d',
                borderRadius: 4,
            },
        ],
    };

    const doughnutData = {
        labels: ['Finalizados', 'Total de Peritagens', 'Pendentes'],
        datasets: [
            {
                data: [0, 1, 0],
                backgroundColor: ['#48bb78', '#3182ce', '#e53e3e'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Visão Geral do Sistema</h1>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>
            ) : (
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ backgroundColor: '#ffffff' }}>
                            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color }}>
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
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribuição por Status</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            usePointStyle: true,
                                            padding: 20
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
