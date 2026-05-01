import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, depositar } from '../services/api';
import { useToast } from '../components/Toast';

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function Clientes() {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [form, setForm] = useState({ nome:'', cpf:'', email:'', saldoInicial:'1000' });
  const [valorDeposito, setValorDeposito] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => getClientes().then(c => setClientes(c || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.nome || !form.cpf || !form.email) return toast('Preencha todos os campos', 'error');
    setLoading(true);
    try {
      await createCliente({ ...form, saldoInicial: Number(form.saldoInicial) });
      toast('Cliente cadastrado com sucesso!', 'success');
      setModal(false);
      setForm({ nome:'', cpf:'', email:'', saldoInicial:'1000' });
      load();
    } catch (e) {
      toast(e.message || 'Erro ao cadastrar', 'error');
    } finally { setLoading(false); }
  };

  const handleDepositar = async () => {
    if (!valorDeposito || !depositModal) return;
    setLoading(true);
    try {
      await depositar(depositModal.id, Number(valorDeposito));
      toast(`Depósito de ${fmt(valorDeposito)} realizado!`, 'success');
      setDepositModal(null);
      setValorDeposito('');
      load();
    } catch (e) {
      toast(e.message || 'Erro ao depositar', 'error');
    } finally { setLoading(false); }
  };

  const patrimonio = (c) => (c.carteira?.posicoes || [])
    .reduce((acc, p) => acc + (p.ativo?.precoAtual * p.quantidade || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clientes.length} clientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Novo Cliente</button>
      </div>

      {clientes.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>👤</div>
          <div style={{ color:'var(--text-muted)' }}>Nenhum cliente ainda. Cadastre o primeiro!</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
          {clientes.map(c => {
            const pat = patrimonio(c);
            const posicoes = c.carteira?.posicoes?.length || 0;
            return (
              <div key={c.id} className="card">
                {/* Avatar + info */}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                  <div style={{
                    width:48, height:48, borderRadius:'50%',
                    background:'var(--yellow-dim)', border:'2px solid var(--yellow)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--yellow)'
                  }}>
                    {c.nome[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>{c.nome}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{c.email}</div>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-secondary)',
                    padding:'3px 8px', borderRadius:100, border:'1px solid var(--border)' }}>
                    ID {c.id}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  <div style={{ background:'var(--yellow-dim)', borderRadius:'var(--radius-sm)',
                    padding:'10px 12px', border:'1px solid rgba(244,179,21,0.15)' }}>
                    <div style={{ fontSize:11, color:'var(--yellow)', opacity:0.7, marginBottom:4 }}>SALDO</div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--yellow)' }}>
                      {fmt(c.saldo)}
                    </div>
                  </div>
                  <div style={{ background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)',
                    padding:'10px 12px', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>PATRIMÔNIO</div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>
                      {fmt(pat)}
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
                  <span>CPF: {c.cpf}</span>
                  <span><strong style={{ color:'var(--text-primary)' }}>{posicoes}</strong> ativos em carteira</span>
                </div>

                <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }}
                  onClick={() => { setDepositModal(c); setValorDeposito(''); }}>
                  + Depositar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal novo cliente */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Novo Cliente</div>
            {[
              { label:'Nome completo', key:'nome', type:'text', placeholder:'João da Silva' },
              { label:'CPF (só números)', key:'cpf', type:'text', placeholder:'12345678901' },
              { label:'E-mail', key:'email', type:'email', placeholder:'joao@email.com' },
              { label:'Saldo inicial (R$)', key:'saldoInicial', type:'number', placeholder:'1000' },
            ].map(({ label, key, type, placeholder }) => (
              <div className="form-row" key={key}>
                <label className="label">{label}</label>
                <input className="input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal depositar */}
      {depositModal && (
        <div className="modal-overlay" onClick={() => setDepositModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Depositar — {depositModal.nome}</div>
            <div style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:20 }}>
              Saldo atual: <strong style={{ color:'var(--yellow)' }}>{fmt(depositModal.saldo)}</strong>
            </div>
            <div className="form-row">
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" placeholder="0.00"
                value={valorDeposito} onChange={e => setValorDeposito(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setDepositModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleDepositar} disabled={loading}>
                {loading ? 'Depositando...' : 'Confirmar Depósito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
