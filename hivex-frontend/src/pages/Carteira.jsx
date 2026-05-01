import React, { useEffect, useState } from 'react';
import { getClientes, comprar, vender, getPortfolio, CORRETORA_ID } from '../services/api';
import { useToast } from '../components/Toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const COLORS = ['#F4B315','#E59312','#C97A0A','#8E5915','#D3AF85'];

export default function Carteira() {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [modal, setModal] = useState(null); // { tipo: 'comprar'|'vender', ativo }
  const [qtd, setQtd] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getClientes(), getPortfolio(CORRETORA_ID)])
      .then(([c, p]) => { setClientes(c || []); setPortfolio(p || []); });
  }, []);

  const cliente = clientes.find(c => String(c.id) === String(clienteSel));
  const posicoes = cliente?.carteira?.posicoes || [];

  const patrimonio = posicoes.reduce((acc, p) => acc + (p.ativo?.precoAtual * p.quantidade || 0), 0);
  const lucroTotal = posicoes.reduce((acc, p) => acc + ((p.ativo?.precoAtual - p.precoMedio) * p.quantidade || 0), 0);

  const pieData = posicoes.map(p => ({
    name: p.ativo?.ticker || '?',
    value: p.ativo?.precoAtual * p.quantidade || 0,
  }));

  const handleOperar = async () => {
    if (!clienteSel || !modal) return;
    setLoading(true);
    try {
      const data = { ativoId: modal.ativo.ativo.id, corretoraId: CORRETORA_ID, quantidade: qtd };
      if (modal.tipo === 'comprar') await comprar(clienteSel, data);
      else await vender(clienteSel, data);
      toast(`${modal.tipo === 'comprar' ? 'Compra' : 'Venda'} realizada com sucesso!`, 'success');
      setModal(null);
      setQtd(1);
      const c = await getClientes();
      setClientes(c || []);
    } catch (e) {
      toast(e.message || 'Erro na operação', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Carteira</h1>
          <p className="page-subtitle">Gerencie posições dos clientes</p>
        </div>
      </div>

      {/* Seletor de cliente */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label className="label">Selecionar Cliente</label>
        <select className="input" value={clienteSel} onChange={e => setClienteSel(e.target.value)}
          style={{ maxWidth: 360 }}>
          <option value="">— escolha um cliente —</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome} — CPF {c.cpf}</option>
          ))}
        </select>
      </div>

      {cliente && (
        <>
          {/* Stats do cliente */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="card card-yellow">
              <div className="label">Saldo Disponível</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 700, color:'var(--yellow)', marginTop: 8 }}>
                {fmt(cliente.saldo)}
              </div>
            </div>
            <div className="card">
              <div className="label">Patrimônio em Ativos</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 8 }}>{fmt(patrimonio)}</div>
            </div>
            <div className="card">
              <div className="label">Lucro / Prejuízo</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 8,
                color: lucroTotal >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {lucroTotal >= 0 ? '+' : ''}{fmt(lucroTotal)}
              </div>
            </div>
            <div className="card">
              <div className="label">Posições</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 8 }}>{posicoes.length}</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Posições */}
            <div className="card">
              <div style={{ fontFamily:'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                Posições em Carteira
              </div>
              {posicoes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>
                  Sem ativos em carteira
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
                  {posicoes.map((p, i) => {
                    const valorAtual = p.ativo?.precoAtual * p.quantidade;
                    const lucro = (p.ativo?.precoAtual - p.precoMedio) * p.quantidade;
                    return (
                      <div key={i} style={{
                        background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)',
                        padding:'14px', border:'1px solid var(--border)'
                      }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
                          <div>
                            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--yellow)', fontSize:16 }}>
                              {p.ativo?.ticker}
                            </span>
                            <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8 }}>× {p.quantidade}</span>
                          </div>
                          <span style={{ fontWeight:600, fontSize:15 }}>{fmt(valorAtual)}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}>
                          <span>PM: {fmt(p.precoMedio)}</span>
                          <span style={{ color: lucro >= 0 ? 'var(--green)' : 'var(--red)', fontWeight:600 }}>
                            {lucro >= 0 ? '+' : ''}{fmt(lucro)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie + comprar/vender */}
            <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>
              {pieData.length > 0 && (
                <div className="card" style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:12 }}>Distribuição</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => [fmt(v)]} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Operar */}
              <div className="card">
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:14 }}>Operar</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {portfolio.map((p, i) => (
                    <div key={i} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'10px 12px', background:'var(--bg-secondary)',
                      borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'
                    }}>
                      <div>
                        <span style={{ fontWeight:600, color:'var(--yellow)' }}>{p.ativo?.ticker}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8 }}>{fmt(p.precoOferta)}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-primary" style={{ padding:'5px 12px', fontSize:12 }}
                          onClick={() => { setModal({ tipo:'comprar', ativo:p }); setQtd(1); }}>
                          Comprar
                        </button>
                        <button className="btn btn-danger" style={{ padding:'5px 12px', fontSize:12 }}
                          onClick={() => { setModal({ tipo:'vender', ativo:p }); setQtd(1); }}>
                          Vender
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal operar */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {modal.tipo === 'comprar' ? '🟢 Comprar' : '🔴 Vender'} — {modal.ativo.ativo?.ticker}
            </div>
            <div style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:20 }}>
              Preço unitário: <strong style={{ color:'var(--yellow)' }}>{fmt(modal.ativo.precoOferta)}</strong>
              {modal.tipo === 'comprar' && (
                <span> · Disponível: <strong>{modal.ativo.quantidadeDisponivel}</strong></span>
              )}
            </div>
            <div className="form-row">
              <label className="label">Quantidade</label>
              <input className="input" type="number" min="1" value={qtd}
                onChange={e => setQtd(parseInt(e.target.value) || 1)} />
            </div>
            <div style={{
              background:'var(--yellow-dim)', border:'1px solid rgba(244,179,21,0.2)',
              borderRadius:'var(--radius-sm)', padding:'12px', marginTop:12, fontSize:14
            }}>
              Total: <strong style={{ color:'var(--yellow)' }}>{fmt(modal.ativo.precoOferta * qtd)}</strong>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button
                className={`btn ${modal.tipo === 'comprar' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleOperar} disabled={loading}>
                {loading ? 'Processando...' : modal.tipo === 'comprar' ? 'Confirmar Compra' : 'Confirmar Venda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
