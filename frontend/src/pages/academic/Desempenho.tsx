import { useState } from "react";
import { 
  Search, 
  FileText, 
  Eye, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Filter, 
  X, 
  Download 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

/* ===================================================== */
/* MOCK DATA */
/* ===================================================== */

const desempenhoMock = [
  { id: 1, aluno: "Maria Silva", turma: "2º Ano A", media: 8.9, frequencia: "96%", situacao: "Aprovado" },
  { id: 2, aluno: "João Santos", turma: "3º Ano B", media: 6.7, frequencia: "84%", situacao: "Recuperação" },
  { id: 3, aluno: "Ana Costa", turma: "1º Ano C", media: 5.4, frequencia: "72%", situacao: "Risco" },
  { id: 4, aluno: "Pedro Lima", turma: "2º Ano A", media: 9.4, frequencia: "98%", situacao: "Aprovado" },
];

const notasData = [
  { bimestre: "1º", media: 7.2 },
  { bimestre: "2º", media: 7.8 },
  { bimestre: "3º", media: 8.1 },
  { bimestre: "4º", media: 8.4 },
];

const turmaData = [
  { turma: "1A", alunos: 34 },
  { turma: "2A", alunos: 31 },
  { turma: "3B", alunos: 28 },
  { turma: "1C", alunos: 36 },
];

/* ===================================================== */
/* MAIN COMPONENT */
/* ===================================================== */

export default function DesempenhoAcademico() {
  const [busca, setBusca] = useState("");
  const [turma, setTurma] = useState("");
  const [situacao, setSituacao] = useState("");

  const limparFiltros = () => {
    setBusca("");
    setTurma("");
    setSituacao("");
  };

  const filtrados = desempenhoMock.filter((item) => {
    const matchBusca = item.aluno.toLowerCase().includes(busca.toLowerCase());
    const matchTurma = turma ? item.turma === turma : true;
    const matchSituacao = situacao ? item.situacao === situacao : true;
    return matchBusca && matchTurma && matchSituacao;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Desempenho Acadêmico
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitoramento pedagógico e análise de indicadores
            </p>
          </div>

          {/* StatCards com Tendências */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <StatCard title="Média Geral" value="8.1" trend="+0.3" icon={<TrendingUp size={20}/>} color="blue" />
            <StatCard title="Alunos Avaliados" value="1.245" trend="+5%" icon={<Users size={20}/>} color="violet" />
            <StatCard title="Disciplinas" value="12" trend="Ativas" icon={<BookOpen size={20}/>} color="emerald" />
            <StatCard title="Frequência Média" value="92%" trend="+2%" icon={<TrendingUp size={20}/>} color="amber" />
          </div>

          {/* Seção de Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Evolução das Médias (Bimestral)">
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={notasData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="bimestre" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="media" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Distribuição por Turma">
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turmaData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="turma" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip labelKey="Alunos" />} />
                    <Bar dataKey="alunos" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40}>
                       {turmaData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Filtros Estilo Original */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                value={turma} 
                onChange={(e) => setTurma(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas turmas</option>
                <option value="1º Ano C">1º Ano C</option>
                <option value="2º Ano A">2º Ano A</option>
                <option value="3º Ano B">3º Ano B</option>
              </select>

              <select 
                value={situacao} 
                onChange={(e) => setSituacao(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas situações</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Recuperação">Recuperação</option>
                <option value="Risco">Risco</option>
              </select>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors">
                  <Filter size={18} /> Aplicar
                </button>
                {(busca || turma || situacao) && (
                  <button 
                    onClick={limparFiltros}
                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Tabela de Desempenho */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Desempenho por Aluno
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <FileText size={16} /> Gerar PDF
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <Download size={16} /> CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b dark:border-slate-700 text-slate-500 text-sm">
                    <th className="text-left py-4 px-3 font-semibold">Aluno</th>
                    <th className="text-left py-4 px-3 font-semibold">Turma</th>
                    <th className="text-left py-4 px-3 font-semibold">Média</th>
                    <th className="text-left py-4 px-3 font-semibold">Frequência</th>
                    <th className="text-left py-4 px-3 font-semibold">Situação</th>
                    <th className="text-right py-4 px-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filtrados.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-3 text-slate-800 dark:text-white font-medium">{item.aluno}</td>
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-400">{item.turma}</td>
                      <td className="py-4 px-3">
                        <span className={`font-bold ${
                          item.media >= 7 ? 'text-green-600' : item.media >= 5 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {item.media.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-400">{item.frequencia}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                          item.situacao === 'Aprovado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.situacao === 'Recuperação' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.situacao}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center shadow-sm">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtrados.length === 0 && (
              <div className="text-center py-12 text-slate-400">Nenhum aluno encontrado.</div>
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

function StatCard({ title, value, trend, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-green-500' : trend.includes('%') ? 'text-blue-500' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function CustomTooltip({ active, payload, labelKey = "Média" }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border-none text-xs">
        <p className="font-bold mb-1">{payload[0].payload.bimestre || payload[0].payload.turma}</p>
        <p className="text-blue-400">{labelKey}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}