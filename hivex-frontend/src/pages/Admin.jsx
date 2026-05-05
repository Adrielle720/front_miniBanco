import React, { useEffect, useState } from 'react';
import { getEmpresas, createEmpresa, getAtivos, getPortfolio, addAtivoPortfolio,
         CORRETORA_ID } from '../services/api';
import { useToast } from '../components/Toast';
import * as api from '../services/api';

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('empresa');
  const [empresas, setEmpresas] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Forms
  const [empForm, setEmpForm] = useState({ nome:'', cnpj:'', setor:'', capitalMercado:'' });
  const [tipoAtivo, setTipoAtivo] = useState('acao');
  const [ativoForm, setAtivoForm] = useState({
    ticker:'', nome:'', precoAtual:'', liquidez:'ALTA', empresaId:'',
    percentualCapital:'', dividendYield:'',
    tipo:'', rendimentoMensal:'',
    vencimento:'', taxaJuros:'',
  });
  const [portForm, setPortForm] = useState({ ativoId:'', quantidade:'', precoOferta:'' });
  const [loading, setLoading] = useState(false);

  const load = () => Promise.all([getEmpresas(), getAtivos(), getPortfolio(CORRETORA_ID)])
    .then(([e, a, p]) => { setEmpresas(e || []); setAtivos(a || []); setPortfolio(p || []); })
    .catch(() => {});

  useEffect(() => { load(); }, []);

  const handleEmpresa = async () => {
    setLoading(true);
    try {
      await createEmpresa({ ...empForm, capitalMercado: Number(empForm.capitalMercado) });
      toast('Empresa cadastrada!', 'success');
      setEmpForm({ nome:'', cnpj:'', setor:'', capitalMercado:'' });
      load();
    } catch (e) { toast(e.message || 'Erro', 'error'); }
    finally { setLoading(false); }
  };

  const handleAtivo = async () => {
    setLoading(true);
    try {
      const base = {
        ticker: ativoForm.ticker, nome: ativoForm.nome,
        precoAtual: Number(ativoForm.precoAtual),
        liquidez: ativoForm.liquidez, empresaId: Number(ativoForm.empresaId),
      };
      if (tipoAtivo === 'acao') {
        await api.getAtivos(); // just to verify connection
        await fetch('http://localhost:8080/api/ativos/acao', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ ...base, percentualCapital: Number(ativoForm.percentualCapital), dividendYield: Number(ativoForm.dividendYield) })
        });
      } else if (tipoAtivo === 'fii') {
        await fetch('http://localhost:8080/api/ativos/fii', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ ...base, tipo: ativoForm.tipo, rendimentoMensal: Number(ativoForm.rendimentoMensal) })
        });
      } else {
        await fetch('http://localhost:8080/api/ativos/titulo', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ ...base, vencimento: ativoForm.vencimento, taxaJuros: Number(ativoForm.taxaJuros) })
        });
      }
      toast('Ativo cadastrado!', 'success');
      setAtivoForm({ ticker:'', nome:'', precoAtual:'', liquidez:'ALTA', empresaId:'', percentualCapital:'', dividendYield:'', tipo:'', rendimentoMensal:'', vencimento:'', taxaJuros:'' });
      load();
    } catch (e) { toast('Erro ao cadastrar ativo', 'error'); }
    finally { setLoading(false); }
  };

  const handlePortfolio = async () => {
    setLoading(true);
    try {
      await addAtivoPortfolio(CORRETORA_ID, {
        ativoId: Number(portForm.ativoId),
        quantidade: Number(portForm.quantidade),
        precoOferta: Number(portForm.precoOferta),
      });
      toast('Ativo adicionado ao portfólio!', 'success');
      setPortForm({ ativoId:'', quantidade:'', precoOferta:'' });
      load();
    } catch (e) { toast(e.message || 'Erro', 'error'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key:'empresa', label:'Cadastrar Empresa' },
    { key:'ativo', label:'Cadastrar Ativo' },
    { key:'portfolio', label:'Gerenciar Portfólio' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">Gerenciamento da corretora</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--bg-secondary)',
        padding:4, borderRadius:'var(--radius-sm)', width:'fit-content',
        border:'1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key}
            className={`btn ${tab === t.key ? 'btn-primary' : ''}`}
            style={{ background: tab === t.key ? 'var(--yellow)' : 'transparent',
              color: tab === t.key ? '#110e11' : 'var(--text-secondary)',
              border:'none', padding:'8px 18px', fontSize:13 }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Form panel */}
        <div className="card">
          {tab === 'empresa' && (
            <>
              <div className="modal-title" style={{ marginBottom:20 }}>Nova Empresa</div>
              {[
                { label:'Nome', key:'nome', placeholder:'Petrobras S.A.' },
                { label:'CNPJ (só números)', key:'cnpj', placeholder:'33000167000101' },
                { label:'Setor', key:'setor', placeholder:'Energia, Tecnologia...' },
                { label:'Capital de Mercado (R$)', key:'capitalMercado', placeholder:'500000000', type:'number' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div className="form-row" key={key}>
                  <label className="label">{label}</label>
                  <input className="input" type={type} placeholder={placeholder}
                    value={empForm[key]} onChange={e => setEmpForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <button className="btn btn-primary w-full" style={{ justifyContent:'center', marginTop:8 }}
                onClick={handleEmpresa} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </>
          )}

          {tab === 'ativo' && (
            <>
              <div className="modal-title" style={{ marginBottom:20 }}>Novo Ativo</div>

              {/* Tipo */}
              <div className="form-row">
                <label className="label">Tipo de Ativo</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[['acao','Ação'],['fii','FII'],['titulo','Renda Fixa']].map(([k,l]) => (
                    <button key={k}
                      className={`btn ${tipoAtivo === k ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex:1, justifyContent:'center', fontSize:13 }}
                      onClick={() => setTipoAtivo(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common fields */}
              {[
                { label:'Ticker', key:'ticker', placeholder:'PETR4' },
                { label:'Nome', key:'nome', placeholder:'Petrobras PN' },
                { label:'Preço Atual (R$)', key:'precoAtual', placeholder:'37.50', type:'number' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div className="form-row" key={key}>
                  <label className="label">{label}</label>
                  <input className="input" type={type} placeholder={placeholder}
                    value={ativoForm[key]} onChange={e => setAtivoForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}

              <div className="form-row">
                <label className="label">Liquidez</label>
                <select className="input" value={ativoForm.liquidez}
                  onChange={e => setAtivoForm(f => ({ ...f, liquidez: e.target.value }))}>
                  <option>ALTA</option><option>MEDIA</option><option>BAIXA</option>
                </select>
              </div>

              <div className="form-row">
                <label className="label">Empresa</label>
                <select className="input" value={ativoForm.empresaId}
                  onChange={e => setAtivoForm(f => ({ ...f, empresaId: e.target.value }))}>
                  <option value="">— selecione —</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>

              {/* Específicos por tipo */}
              {tipoAtivo === 'acao' && <>
                <div className="form-row">
                  <label className="label">% Capital (ex: 0.001)</label>
                  <input className="input" type="number" step="0.0001" placeholder="0.001"
                    value={ativoForm.percentualCapital}
                    onChange={e => setAtivoForm(f => ({ ...f, percentualCapital: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label className="label">Dividend Yield (ex: 0.08 = 8%)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.08"
                    value={ativoForm.dividendYield}
                    onChange={e => setAtivoForm(f => ({ ...f, dividendYield: e.target.value }))} />
                </div>
              </>}

              {tipoAtivo === 'fii' && <>
                <div className="form-row">
                  <label className="label">Tipo (ex: Logística, Shoppings)</label>
                  <input className="input" type="text" placeholder="Logística"
                    value={ativoForm.tipo} onChange={e => setAtivoForm(f => ({ ...f, tipo: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label className="label">Rendimento Mensal por Cota (R$)</label>
                  <input className="input" type="number" step="0.01" placeholder="1.20"
                    value={ativoForm.rendimentoMensal}
                    onChange={e => setAtivoForm(f => ({ ...f, rendimentoMensal: e.target.value }))} />
                </div>
              </>}

              {tipoAtivo === 'titulo' && <>
                <div className="form-row">
                  <label className="label">Vencimento</label>
                  <input className="input" type="date"
                    value={ativoForm.vencimento}
                    onChange={e => setAtivoForm(f => ({ ...f, vencimento: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label className="label">Taxa de Juros a.a. (ex: 0.12 = 12%)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.12"
                    value={ativoForm.taxaJuros}
                    onChange={e => setAtivoForm(f => ({ ...f, taxaJuros: e.target.value }))} />
                </div>
              </>}

              <button className="btn btn-primary w-full" style={{ justifyContent:'center', marginTop:8 }}
                onClick={handleAtivo} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Ativo'}
              </button>
            </>
          )}

          {tab === 'portfolio' && (
            <>
              <div className="modal-title" style={{ marginBottom:20 }}>Adicionar ao Portfólio</div>
              <div className="form-row">
                <label className="label">Ativo</label>
                <select className="input" value={portForm.ativoId}
                  onChange={e => setPortForm(f => ({ ...f, ativoId: e.target.value }))}>
                  <option value="">— selecione —</option>
                  {ativos.map(a => <option key={a.id} value={a.id}>{a.ticker} — {a.nome}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="label">Quantidade</label>
                <input className="input" type="number" placeholder="1000"
                  value={portForm.quantidade} onChange={e => setPortForm(f => ({ ...f, quantidade: e.target.value }))} />
              </div>
              <div className="form-row">
                <label className="label">Preço de Oferta (R$)</label>
                <input className="input" type="number" step="0.01" placeholder="37.90"
                  value={portForm.precoOferta} onChange={e => setPortForm(f => ({ ...f, precoOferta: e.target.value }))} />
              </div>
              <button className="btn btn-primary w-full" style={{ justifyContent:'center', marginTop:8 }}
                onClick={handlePortfolio} disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar ao Portfólio'}
              </button>
            </>
          )}
        </div>

        {/* Listas */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Empresas */}
          <div className="card">
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:14 }}>
              Empresas ({empresas.length})
            </div>
            {empresas.length === 0 ? (
              <div style={{ color:'var(--text-muted)', fontSize:13 }}>Nenhuma empresa cadastrada</div>
            ) : empresas.map(e => (
              <div key={e.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0',
                borderBottom:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ fontWeight:500 }}>{e.nome}</span>
                <span style={{ color:'var(--text-muted)' }}>{e.setor}</span>
              </div>
            ))}
          </div>

          {/* Portfólio */}
          <div className="card">
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:14 }}>
              Portfólio ({portfolio.length})
            </div>
            {portfolio.length === 0 ? (
              <div style={{ color:'var(--text-muted)', fontSize:13 }}>Nenhum ativo no portfólio</div>
            ) : portfolio.map((p, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ color:'var(--yellow)', fontWeight:700 }}>{p.ativo?.ticker}</span>
                <span style={{ color:'var(--text-muted)' }}>{p.quantidadeDisponivel} un.</span>
                <span style={{ fontWeight:600 }}>R$ {Number(p.precoOferta).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
