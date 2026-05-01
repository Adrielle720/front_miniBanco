import React, { useEffect, useState } from 'react';
import { getAtivos, getPortfolio, updatePreco, CORRETORA_ID } from '../services/api';
import { useToast } from '../components/Toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const LIQUIDEZ_COLOR = { ALTA: 'green', MEDIA: 'yellow', BAIXA: 'red' };

export default function Ativos() {
  const toast = useToast();
  const [ativos, setAtivos] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editPreco, setEditPreco] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([getAtivos(), getPortfolio(CORRETORA_ID)])
      .then(([a, p]) => { setAtivos(a || []); setPortfolio(p || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdatePreco = async () => {
    if (!selected || !editPreco) return;
    try {
      await updatePreco(selected.id, editPreco);
      toast('Preço atualizado com sucesso!', 'success');
      setSelected(null);
      load();
    } catch (e) {
      toast('Erro ao atualizar preço', 'error');
    }
  };

  const getDisponivel = (ativo) => portfolio.find(p => p.ativo?.id === ativo.id);

  const getTipoLabel = (ativo) => {
    if (ativo.dividendYield !== undefined) return 'Ação';
    if (ativo.rendimentoMensal !== undefined) return 'FII';
    if (ativo.taxaJuros !== undefined) return 'Renda Fixa';
    return 'Ativo';
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>Carregando ativos... 🐝</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ativos</h1>
          <p className="page-subtitle">{ativos.length} ativos cadastrados</p>
        </div>
      </div>

      {ativos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Nenhum ativo cadastrado ainda.</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Vá em Admin para cadastrar empresas e ativos.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {ativos.map(ativo => {
            const disp = getDisponivel(ativo);
            const historico = ativo.historico || [];
            const chartData = historico.slice(-8).map((h, i) => ({ i, preco: h.preco }));

            return (
              <div key={ativo.id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => { setSelected(ativo); setEditPreco(ativo.precoAtual); }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
                      color: 'var(--yellow)', letterSpacing: '-0.02em'
                    }}>
                      {ativo.ticker}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {ativo.nome}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`chip chip-${LIQUIDEZ_COLOR[ativo.liquidez] || 'yellow'}`}>
                      {ativo.liquidez}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getTipoLabel(ativo)}</span>
                  </div>
                </div>

                {/* Mini chart */}
                {chartData.length > 1 && (
                  <div style={{ margin: '8px -4px 12px' }}>
                    <ResponsiveContainer width="100%" height={50}>
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="preco" stroke="#F4B315" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Price */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: 12
                }}>
                  {fmt(ativo.precoAtual)}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Empresa</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{ativo.empresa?.nome || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Disponível</span>
                    <span style={{ color: disp ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {disp ? `${disp.quantidadeDisponivel} un.` : 'Indisponível'}
                    </span>
                  </div>
                  {ativo.dividendYield && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Dividend Yield</span>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>
                        {(ativo.dividendYield * 100).toFixed(1)}% a.a.
                      </span>
                    </div>
                  )}
                  {ativo.rendimentoMensal && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rendimento</span>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>{fmt(ativo.rendimentoMensal)}/mês</span>
                    </div>
                  )}
                  {ativo.taxaJuros && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Taxa</span>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>{(ativo.taxaJuros * 100).toFixed(1)}% a.a.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal editar preço */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Atualizar Preço — {selected.ticker}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Preço atual: <strong style={{ color: 'var(--yellow)' }}>{fmt(selected.precoAtual)}</strong>
            </div>
            <div className="form-row">
              <label className="label">Novo Preço (R$)</label>
              <input className="input" type="number" step="0.01" value={editPreco}
                onChange={e => setEditPreco(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdatePreco}>Atualizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
