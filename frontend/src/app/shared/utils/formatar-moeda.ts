// Usa a API nativa Intl do navegador (via toLocaleString) em vez do
// CurrencyPipe do Angular — o CurrencyPipe exige registrar os dados de
// locale pt-BR manualmente (registerLocaleData) para formatar direito;
// a API nativa já resolve isso sozinha, sem essa etapa extra.
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
