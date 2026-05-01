import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientes, getAtivos, getPortfolio, getOrdens, CORRETORA_ID } from '../services/api';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const COLORS = ['#F4B315', '#E59312', '#8E5915', '#C97A0A', '#D3AF85'];

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClientes(), getAtivos(), getPortfolio(CORRETORA_ID), getOrdens(CORRETORA_ID)])
      .then(([c, a, p, o]) => {
        setClientes(c || []);
        setAtivos(a || []);
        setPortfolio(p || []);
        setOrdens(o || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalClientes = clientes.length;
  const totalAtivos = ativos.length;
  const ordensExecutadas = ordens.filter(o => o.status === 'EXECUTADA').length;
  const volumeTotal = ordens
    .filter(o => o.status === 'EXECUTADA')
    .reduce((acc, o) => acc + (o.precoUnitario * o.quantidade), 0);

  // Fake historico para demo chart
  const chartData = [
    { name: 'Jan', valor: 12000 }, { name: 'Fev', valor: 18000 },
    { name: 'Mar', valor: 15000 }, { name: 'Abr', valor: 24000 },
    { name: 'Mai', valor: 21000 }, { name: 'Jun', valor: 32000 },
    { name: 'Jul', valor: volumeTotal > 0 ? volumeTotal : 28000 },
  ];

  const pieData = portfolio.slice(0, 5).map((p, i) => ({
    name: p.ativo?.ticker || `Ativo ${i + 1}`,
    value: p.quantidadeDisponivel,
  }));

  const ordensRecentes = ordens.slice(-5).reverse();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🐝</div>
        <div style={{ color: 'var(--text-muted)' }}>Carregando o enxame...</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral da corretora HiveX</p>
        </div>
        <Link to="/admin" className="btn btn-primary">
          + Novo Ativo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard label="Volume Total" value={fmt(volumeTotal)} sub="ordens executadas" yellow icon="◆" />
        <StatCard label="Clientes" value={totalClientes} chip={`+${totalClientes}`} chipType="green" sub="ativos" />
        <StatCard label="Ativos" value={totalAtivos} sub="no portfólio" chip={`${portfolio.length} disponíveis`} chipType="yellow" />
        <StatCard label="Ordens" value={ordensExecutadas} sub="executadas" chip="Hoje" chipType="green" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Area chart */}
        <div className="card">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Volume de Negociações</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Últimos 7 meses</div>
            </div>
            <span className="chip chip-green">▲ 28%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4B315" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F4B315" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13 }}
                formatter={v => [fmt(v), 'Volume']}
              />
              <Area type="monotone" dataKey="valor" stroke="#F4B315" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Composição do Portfólio</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Por quantidade disponível</div>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Nenhum ativo no portfólio ainda
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Ordens Recentes</div>
          <Link to="/ordens" style={{ fontSize: 13, color: 'var(--yellow)', textDecoration: 'none' }}>Ver todas →</Link>
        </div>
        {ordensRecentes.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Ativo</th>
                  <th>Cliente</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordensRecentes.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`chip chip-${o.tipoOrdem === 'COMPRA' ? 'green' : 'red'}`}>
                        {o.tipoOrdem || (o['@type'] === 'OrdemCompra' ? 'COMPRA' : 'VENDA')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.ativo?.ticker || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.cliente?.nome || '—'}</td>
                    <td>{o.quantidade}</td>
                    <td>{fmt(o.precoUnitario)}</td>
                    <td><span className={`chip chip-${o.status === 'EXECUTADA' ? 'green' : o.status === 'CANCELADA' ? 'red' : 'yellow'}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            Nenhuma ordem registrada ainda
          </div>
        )}
      </div>
    </div>
  );
}
