import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Download } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

export default function AdminFinance() {
  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-3 rounded-2xl font-semibold transition-all">
              <Download size={18} /> Relatório DRE
            </button>
          </div>

          {/* Cards de KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500"><TrendingUp size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Receita Total (Mês)</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{formatarMoeda(452800)}</h2>
              <p className="text-xs text-green-600 font-semibold mt-2">+5.2% vs mês passado</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><TrendingDown size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Despesas Previstas</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{formatarMoeda(318500)}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-2">Folha, impostos e infra</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500"><AlertTriangle size={64}/></div>
              <p className="text-sm font-bold text-slate-400 uppercase mb-2">Inadimplência</p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">8.4%</h2>
              <p className="text-xs text-red-500 font-semibold mt-2">Acima da meta (5%)</p>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl shadow-sm relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={64}/></div>
              <p className="text-sm font-bold text-blue-200 uppercase mb-2">Saldo Operacional</p>
              <h2 className="text-3xl font-black">{formatarMoeda(134300)}</h2>
              <p className="text-xs text-blue-100 font-semibold mt-2">Líquido estimado</p>
            </div>
          </div>

          {/* Tabela de Fluxo de Caixa Recente */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Últimas Transações</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Descrição / Favorecido</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">22/05/2026</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">Lote de Mensalidades (PIX)</td>
                    <td className="px-6 py-4 text-slate-500">Receita Acadêmica</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">+ 12.450,00</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">21/05/2026</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">Limpeza e Conservação Ltda</td>
                    <td className="px-6 py-4 text-slate-500">Despesa Terceirizados</td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">- 8.200,00</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">20/05/2026</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">Aquisição de Licenças de Software</td>
                    <td className="px-6 py-4 text-slate-500">Infraestrutura TI</td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">- 1.450,00</td>
                  </tr>
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