import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MetricCard from "../../../components/layout/MetricCard";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  FileText, 
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Dados mockados
const desempenhoPorTurma = [
  { turma: "1º A", media: 7.8, frequencia: 92, aprovados: 32, total: 35 },
  { turma: "1º B", media: 7.2, frequencia: 88, aprovados: 30, total: 34 },
  { turma: "2º A", media: 8.1, frequencia: 94, aprovados: 33, total: 35 },
  { turma: "2º B", media: 7.5, frequencia: 89, aprovados: 31, total: 36 },
  { turma: "3º A", media: 8.4, frequencia: 95, aprovados: 34, total: 35 },
  { turma: "3º B", media: 7.9, frequencia: 91, aprovados: 32, total: 34 },
];

const evolucaoMensal = [
  { mes: "Fev", media: 7.2, aprovacao: 85 },
  { mes: "Mar", media: 7.5, aprovacao: 87 },
  { mes: "Abr", media: 7.8, aprovacao: 89 },
  { mes: "Mai", media: 8.0, aprovacao: 91 },
  { mes: "Jun", media: 8.2, aprovacao: 93 },
];

const situacaoAlunos = [
  { name: "Aprovados", value: 145, color: "#10b981" },
  { name: "Recuperação", value: 35, color: "#f59e0b" },
  { name: "Risco", value: 12, color: "#ef4444" },
];

const alertasPedagogicos = [
  { id: 1, aluno: "Ana Costa", turma: "2º A", motivo: "Baixa frequência (65%)", gravidade: "alta" },
  { id: 2, aluno: "João Silva", turma: "3º B", motivo: "Média abaixo de 5.0", gravidade: "alta" },
  { id: 3, aluno: "Maria Santos", turma: "1º A", motivo: "3 faltas consecutivas", gravidade: "media" },
  { id: 4, aluno: "Pedro Lima", turma: "2º B", motivo: "Dificuldade em Matemática", gravidade: "media" },
];

export default function DashboardCoordinator() {
  const [periodo, setPeriodo] = useState("2026");

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Dashboard Coordenação
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Acompanhamento pedagógico e desempenho acadêmico
                </p>
              </div>
              <select 
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {/* Cards Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <MetricCard 
              title="Média Geral" 
              value="7.9" 
              icon={<TrendingUp />} 
              trend={5}
            />
            <MetricCard 
              title="Taxa de Aprovação" 
              value="89%" 
              icon={<Award />} 
              trend={3}
            />
            <MetricCard 
              title="Turmas Ativas" 
              value="12" 
              icon={<BookOpen />} 
            />
            <MetricCard 
              title="Frequência Média" 
              value="91.5%" 
              icon={<Calendar />} 
              trend={2}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
            {/* Evolução Acadêmica */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Evolução Acadêmica 2026
              </h2>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" domain={[6, 10]} />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="media" 
                      name="Média" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="aprovacao" 
                      name="Aprovação (%)" 
                      stroke="#10b981" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Situação dos Alunos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Situação dos Alunos
              </h2>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={situacaoAlunos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {situacaoAlunos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Desempenho por Turma */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Desempenho por Turma
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Turma</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Média</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Frequência</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Aprovados</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Situação</th>
                   </tr>
                </thead>
                <tbody>
                  {desempenhoPorTurma.map((turma) => (
                    <tr key={turma.turma} className="border-b dark:border-slate-800">
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-white">{turma.turma}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${
                          turma.media >= 8 ? 'text-green-600' : 
                          turma.media >= 7 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {turma.media}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${turma.frequencia}%` }}
                            />
                          </div>
                          <span className="text-sm">{turma.frequencia}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">{turma.aprovados}/{turma.total}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          (turma.aprovados / turma.total) >= 0.85 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {((turma.aprovados / turma.total) * 100).toFixed(0)}% Aprovação
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas e Recomendações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas Pedagógicos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-500" size={24} />
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                  Alertas Pedagógicos
                </h2>
              </div>
              <div className="space-y-3">
                {alertasPedagogicos.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`p-3 rounded-xl border-l-4 ${
                      alerta.gravidade === 'alta' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{alerta.aluno}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{alerta.turma}</p>
                        <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">{alerta.motivo}</p>
                      </div>
                      {alerta.gravidade === 'alta' ? (
                        <XCircle className="text-red-500" size={20} />
                      ) : (
                        <AlertCircle className="text-yellow-500" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações Recomendadas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-500" size={24} />
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                  Ações Recomendadas
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { acao: "Reunião de pais - Turma 2º A", data: "15/06/2026", prioridade: "alta" },
                  { acao: "Plano de recuperação - Matemática", data: "20/06/2026", prioridade: "media" },
                  { acao: "Avaliação diagnóstica - 1º ano", data: "25/06/2026", prioridade: "baixa" },
                  { acao: "Capacitação de professores", data: "30/06/2026", prioridade: "media" },
                ].map((acao, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{acao.acao}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{acao.data}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}