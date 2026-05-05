import React, { useEffect, useState } from 'react';
import { getOrdens, CORRETORA_ID } from '../services/api';

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function Ordens() {
  const [ordens, setOrdens] = useState([]);
  const [filtro, setFiltro] = useState('TODAS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrdens(CORRETORA_ID)
      .then(o => setOrdens((o || []).reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtradas = filtro === 'TODAS' ? ordens : ordens.filter(o => o.status === filtro);
  const volumeTotal = ordens.filter(o => o.status === 'EXECUTADA')
    .reduce((acc, o) => acc + o.precoUnitario * o.quantidade, 0);

  const getTipo = (o) => {
    if (o.tipoOrdem) return o.tipoOrdem;
    return 'ORDEM';
  };

  if (loading) return <div style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:80 }}>Carregando ordens... 🐝</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ordens</h1>
          <p className="page-subtitle">Histórico completo de operações</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['TODAS','EXECUTADA','PENDENTE','CANCELADA'].map(f => (
            <button key={f}
              className={`btn ${filtro === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding:'7px 14px', fontSize:12 }}
              onClick={() => setFiltro(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="label">Total de Ordens</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, marginTop:8 }}>{ordens.length}</div>
        </div>
        <div className="card card-yellow">
          <div className="label">Volume Executado</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--yellow)', marginTop:8 }}>
            {fmt(volumeTotal)}
          </div>
        </div>
        <div className="card">
          <div className="label">Executadas</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--green)', marginTop:8 }}>
            {ordens.filter(o => o.status === 'EXECUTADA').length}
          </div>
        </div>
      </div>

      <div className="card">
        {filtradas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)' }}>
            Nenhuma ordem encontrada
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Ativo</th>
                  <th>Cliente</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((o, i) => {
                  const tipo = getTipo(o);
                  const isCompra = tipo === 'COMPRA' || tipo?.includes('Compra');
                  return (
                    <tr key={i}>
                      <td style={{ color:'var(--text-muted)', fontSize:12 }}>{o.id || i+1}</td>
                      <td>
                        <span className={`chip chip-${isCompra ? 'green' : 'red'}`}>
                          {isCompra ? '▲ COMPRA' : '▼ VENDA'}
                        </span>
                      </td>
                      <td style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--yellow)' }}>
                        {o.ativo?.ticker || '—'}
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{o.cliente?.nome || '—'}</td>
                      <td style={{ fontWeight:600 }}>{o.quantidade}</td>
                      <td>{fmt(o.precoUnitario)}</td>
                      <td style={{ fontWeight:600 }}>{fmt(o.precoUnitario * o.quantidade)}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:12 }}>
                        {o.dataHora ? new Date(o.dataHora).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td>
                        <span className={`chip chip-${o.status === 'EXECUTADA' ? 'green' : o.status === 'CANCELADA' ? 'red' : 'yellow'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
