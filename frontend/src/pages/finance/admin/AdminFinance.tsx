import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Download, Loader2 } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";
import html2pdf from "html2pdf.js";

interface Transacao {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
}

interface DadosAdmin {
  receitaTotal: number;
  despesasPrevistas: number;
  inadimplencia: number;
  saldoOperacional: number;
  ultimasTransacoes: Transacao[];
}

export default function AdminFinance() {
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await api.get('/financeiro/admin');
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (dataStr: string) => dataStr.split("-").reverse().join("/");

  const handleGerarDRE = async () => {
    if (!dados) return;
    setGerandoRelatorio(true);

    // Calcula lucro/prejuízo
    const lucroPrejuizo = dados.receitaTotal - dados.despesasPrevistas;
    const margemLucro = dados.receitaTotal > 0 ? (lucroPrejuizo / dados.receitaTotal) * 100 : 0;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 1000px; margin: 0 auto; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; color: #0f172a;">Class Plus - Gestão Escolar</h1>
          <p style="margin: 5px 0; color: #64748b; font-size: 14px;">Demonstração do Resultado do Exercício (DRE)</p>
          <p style="margin: 5px 0; color: #94a3b8; font-size: 12px;">Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <h2 style="font-size: 18px; margin: 25px 0 15px 0; color: #334155;">Resumo Financeiro</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Receita Total (Mensalidade + Taxas)</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">${formatarMoeda(dados.receitaTotal)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>(-) Despesas Previstas (Folha, Impostos, Infra)</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #dc2626;">${formatarMoeda(dados.despesasPrevistas)}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>= Lucro / Prejuízo Operacional</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${lucroPrejuizo >= 0 ? '#059669' : '#dc2626'};">${formatarMoeda(lucroPrejuizo)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Margem de Lucro (%)</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${margemLucro.toFixed(2)}%</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Inadimplência (clientes em atraso)</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #f97316;">${dados.inadimplencia}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Saldo Operacional (Caixa Líquido)</strong></td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #2563eb;">${formatarMoeda(dados.saldoOperacional)}</td>
          </tr>
        </table>

        <h2 style="font-size: 18px; margin: 25px 0 15px 0; color: #334155;">Movimentações Recentes</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #e2e8f0;">
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Data</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Descrição</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Categoria</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${dados.ultimasTransacoes.map(t => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${formatarData(t.data)}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${t.descricao}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${t.categoria}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${formatarMoeda(t.valor)}</td>
              </tr>
            `).join('')}
            ${dados.ultimasTransacoes.length === 0 ? `
              <tr><td colspan="4" style="padding: 20px; text-align: center; color: #64748b;">Nenhuma transação registrada.</td></tr>
            ` : ''}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Este documento é uma representação gerencial dos dados financeiros e não substitui a escrituração contábil oficial.
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opcoes = {
      margin: 10,
      filename: `DRE_ClassPlus_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    try {
      await html2pdf().set(opcoes).from(container).save();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o relatório DRE. Tente novamente.");
    } finally {
      setGerandoRelatorio(false);
    }
  };

  if (loading || !dados) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Financeiro</h1>
              <p className="text-slate-500 dark:text-slate-400">Visão executiva do fluxo de caixa e inadimplência institucional.</p>
            </div>
            <button 
              onClick={handleGerarDRE}
              disabled={gerandoRelatorio}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-3 rounded-2xl font-semibold transition-all disabled:opacity-50"
            >
              {gerandoRelatorio ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Relatório DRE
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500"><TrendingUp size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Receita Total</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{formatarMoeda(dados.receitaTotal)}</h2>
              <p className="text-xs text-green-600 font-semibold mt-2">Valores confirmados em caixa</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><TrendingDown size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Despesas Previstas</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{formatarMoeda(dados.despesasPrevistas)}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-2">Folha, impostos e infra</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500"><AlertTriangle size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Inadimplência</p>
              <h2 className={`text-3xl font-black ${dados.inadimplencia > 5 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{dados.inadimplencia}%</h2>
              <p className="text-xs text-slate-400 font-semibold mt-2">Faturas vencidas não pagas</p>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl shadow-sm relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={64}/></div>
              <p className="text-sm font-bold text-blue-200 uppercase mb-2">Saldo Operacional</p>
              <h2 className="text-3xl font-black">{formatarMoeda(dados.saldoOperacional)}</h2>
              <p className="text-xs text-blue-100 font-semibold mt-2">Líquido estimado (Dinâmico)</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Últimas Transações Registradas</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data de Vencimento/Pgto</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Descrição / Favorecido</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.ultimasTransacoes.map((transacao) => (
                    <tr key={transacao.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatarData(transacao.data)}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{transacao.descricao}</td>
                      <td className="px-6 py-4 text-slate-500">{transacao.categoria}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">+ {formatarMoeda(transacao.valor)}</td>
                    </tr>
                  ))}
                  {dados.ultimasTransacoes.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-500">Nenhuma transação recebida até o momento.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}