import { useState } from "react";
import {
  Search,
  DollarSign,
  FileText,
  AlertTriangle,
  Download,
  Eye,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

/* ===================================================== */
/* MOCK DATA */
/* ===================================================== */

const pagamentosMock = [
  { id: 1, aluno: "Maria Silva", turma: "2º Ano A", valor: "R$ 850,00", vencimento: "10/05/2026", status: "Pago" },
  { id: 2, aluno: "João Santos", turma: "3º Ano B", valor: "R$ 850,00", vencimento: "10/05/2026", status: "Pendente" },
  { id: 3, aluno: "Ana Costa", turma: "1º Ano C", valor: "R$ 850,00", vencimento: "10/05/2026", status: "Atrasado" },
  { id: 4, aluno: "Pedro Lima", turma: "2º Ano A", valor: "R$ 850,00", vencimento: "10/05/2026", status: "Pago" },
  { id: 5, aluno: "Carla Souza", turma: "3º Ano B", valor: "R$ 850,00", vencimento: "10/05/2026", status: "Pendente" },
];

const chartData = [
  { mes: "Jan", receita: 18000 },
  { mes: "Fev", receita: 22000 },
  { mes: "Mar", receita: 24000 },
  { mes: "Abr", receita: 26000 },
  { mes: "Mai", receita: 28500 },
  { mes: "Jun", receita: 31000 },
];

/* ===================================================== */
/* MAIN COMPONENT */
/* ===================================================== */

export default function Financeiro() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const filtrados = pagamentosMock.filter((item) => {
    const matchBusca = item.aluno.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro ? item.status === statusFiltro : true;
    return matchBusca && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Financeiro
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2">
              Controle financeiro escolar
            </p>
          </div>

          {/* CARDS (Estilo Novo com Tendências) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <StatCard title="Receita Mensal" value="R$ 31.000" trend="+12.5%" icon={<DollarSign />} color="blue" />
            <StatCard title="Pagamentos" value="458" trend="+8%" icon={<FileText />} color="emerald" />
            <StatCard title="Inadimplentes" value="24" trend="-2%" icon={<AlertTriangle />} color="red" />
            <StatCard title="Total Recebido" value="R$ 124.500" trend="+15%" icon={<TrendingUp />} color="violet" />
          </div>

          {/* GRÁFICO */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Receita Mensal
              </h2>
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors w-full sm:w-auto text-sm md:text-base">
                <Download size={18} /> Exportar Dados
              </button>
            </div>
            <div className="h-64 sm:h-72 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="receita" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* FILTROS (Estilo Original) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
              </select>

              <button 
                onClick={() => { setBusca(""); setStatusFiltro(""); }}
                className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </section>

          {/* TABELA (Estilo Original) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Mensalidades
              </h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm md:text-base">
                  <FileText size={18} /> Relatório
                </button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
              <table className="w-full min-w-[700px] md:min-w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Aluno</th>
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Turma</th>
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Valor</th>
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Vencimento</th>
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Status</th>
                    <th className="text-left py-3 md:py-4 px-2 md:px-3 font-semibold text-slate-600 dark:text-slate-400 text-sm md:text-base">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((item) => (
                    <tr key={item.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 md:py-4 px-2 md:px-3 text-slate-800 dark:text-white text-sm md:text-base">{item.aluno}</td>
                      <td className="py-3 md:py-4 px-2 md:px-3 text-slate-600 dark:text-slate-300 text-sm md:text-base">{item.turma}</td>
                      <td className="py-3 md:py-4 px-2 md:px-3 text-slate-800 dark:text-white font-semibold text-sm md:text-base">{item.valor}</td>
                      <td className="py-3 md:py-4 px-2 md:px-3 text-slate-600 dark:text-slate-300 text-sm md:text-base">{item.vencimento}</td>
                      <td className="py-3 md:py-4 px-2 md:px-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs md:text-sm font-semibold ${
                          item.status === "Pago" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                          item.status === "Pendente" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-3">
                        <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm">
                          <Eye className="md:size-3" /> 
                          <span className="hidden sm:inline">Comprovante</span>
                          <span className="sm:hidden">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filtrados.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                Nenhum pagamento encontrado.
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ===================================================== */
/* HELPER COMPONENTS */
/* ===================================================== */

function StatCard({ title, value, trend, icon, color }: { title: string; value: string; trend: string; icon: React.ReactNode; color: string }) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
      <h2 className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</h2>
      <p className="text-2xl md:text-3xl font-bold mt-1 text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}