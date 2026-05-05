const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/api';

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Erro ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Empresas
export const getEmpresas = () => req('/empresas');
export const createEmpresa = (data) => req('/empresas', { method: 'POST', body: JSON.stringify(data) });

// Ativos
export const getAtivos = () => req('/ativos');
export const getAtivo = (id) => req(`/ativos/${id}`);
export const updatePreco = (id, preco) => req(`/ativos/${id}/preco`, { method: 'PATCH', body: JSON.stringify({ preco }) });

// Cotacoes Alpha Vantage
export const sincronizarPrecos = async () => {
  const resultado = await req('/cotacoes/atualizar-todos', { method: 'POST' });
  const mapa = {};
  (resultado?.cotacoes || []).forEach(c => { mapa[c.ticker] = c; });
  return mapa;
};
export const getCotacao = (ticker) => req(`/cotacoes/${ticker}`);
export const getHistoricoCotacao = (ticker) => req(`/cotacoes/${ticker}/historico`);

// Clientes
export const getClientes = () => req('/clientes');
export const getCliente = (id) => req(`/clientes/${id}`);
export const createCliente = (data) => req('/clientes', { method: 'POST', body: JSON.stringify(data) });
export const depositar = (id, valor) => req(`/clientes/${id}/depositar`, { method: 'POST', body: JSON.stringify({ valor }) });
export const comprar = (id, data) => req(`/clientes/${id}/comprar`, { method: 'POST', body: JSON.stringify(data) });
export const vender = (id, data) => req(`/clientes/${id}/vender`, { method: 'POST', body: JSON.stringify(data) });

// Corretora
export const getPortfolio = (id) => req(`/corretoras/${id}/portfolio`);
export const getOrdens = (id) => req(`/corretoras/${id}/ordens`);
export const createCorretora = (data) => req('/corretoras', { method: 'POST', body: JSON.stringify(data) });
export const addAtivoPortfolio = (id, data) => req(`/corretoras/${id}/portfolio`, { method: 'POST', body: JSON.stringify(data) });

export const CORRETORA_ID = 1;
