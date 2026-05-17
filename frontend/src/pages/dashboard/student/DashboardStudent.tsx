import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MetricCard from "../../../components/layout/MetricCard";
import { 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award,
  Target,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Download,
  FileText
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

// Dados mockados do aluno
const notasPorBimestre = [
  { bimestre: "1º", matematica: 7.5, portugues: 8.0, ciencia: 7.0, historia: 8.5 },
  { bimestre: "2º", matematica: 8.0, portugues: 8.5, ciencia: 7.5, historia: 9.0 },
  { bimestre: "3º", matematica: 8.5, portugues: 9.0, ciencia: 8.0, historia: 8.5 },
  { bimestre: "4º", matematica: 9.0, portugues: 9.5, ciencia: 8.5, historia: 9.0 },
];

const desempenhoDisciplinas = [
  { subject: "Matemática", value: 8.2, fullMark: 10 },
  { subject: "Português", value: 8.8, fullMark: 10 },
  { subject: "Ciências", value: 7.8, fullMark: 10 },
  { subject: "História", value: 8.5, fullMark: 10 },
  { subject: "Geografia", value: 8.0, fullMark: 10 },
  { subject: "Inglês", value: 9.0, fullMark: 10 },
];

const atividadesPendentes = [
  { id: 1, disciplina: "Matemática", atividade: "Lista de Exercícios - Funções", entrega: "15/06/2026", status: "pendente" },
  { id: 2, disciplina: "Português", atividade: "Redação Dissertativa", entrega: "18/06/2026", status: "pendente" },
  { id: 3, disciplina: "Ciências", atividade: "Pesquisa sobre Ecossistemas", entrega: "20/06/2026", status: "concluido" },
];

const horarioAulas = [
  { horario: "07:30 - 08:15", segunda: "Matemática", terca: "Português", quarta: "Ciências", quinta: "História", sexta: "Educação Física" },
  { horario: "08:15 - 09:00", segunda: "Português", terca: "Matemática", quarta: "História", quinta: "Geografia", sexta: "Artes" },
  { horario: "09:30 - 10:15", segunda: "Ciências", terca: "Geografia", quarta: "Matemática", quinta: "Português", sexta: "Inglês" },
  { horario: "10:15 - 11:00", segunda: "História", terca: "Ciências", quarta: "Inglês", quinta: "Matemática", sexta: "Português" },
];

const boletim = [
  { disciplina: "Matemática", nota1: 7.5, nota2: 8.0, nota3: 8.5, nota4: 9.0, media: 8.25, faltas: 4 },
  { disciplina: "Português", nota1: 8.0, nota2: 8.5, nota3: 9.0, nota4: 9.5, media: 8.75, faltas: 2 },
  { disciplina: "Ciências", nota1: 7.0, nota2: 7.5, nota3: 8.0, nota4: 8.5, media: 7.75, faltas: 5 },
  { disciplina: "História", nota1: 8.5, nota2: 9.0, nota3: 8.5, nota4: 9.0, media: 8.75, faltas: 3 },
];

export default function DashboardAluno() {
  const [selectedDay, setSelectedDay] = useState("segunda");

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Olá, Maria! 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acompanhe seu desempenho acadêmico e atividades
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <MetricCard title="Média Geral" value="8.4/10" icon={<TrendingUp />} trend={5} />
            <MetricCard title="Frequência" value="92%" icon={<Calendar />} trend={2} />
            <MetricCard title="Disciplinas" value="8" icon={<BookOpen />} />
            <MetricCard title="Ranking" value="15º lugar" icon={<Award />} />
          </div>

          {/* Gráficos de Desempenho */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
            {/* Evolução das Notas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Evolução das Notas por Bimestre
              </h2>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={notasPorBimestre}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bimestre" />
                    <YAxis domain={[6, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="matematica" name="Matemática" stroke="#2563eb" />
                    <Line type="monotone" dataKey="portugues" name="Português" stroke="#10b981" />
                    <Line type="monotone" dataKey="ciencia" name="Ciências" stroke="#f59e0b" />
                    <Line type="monotone" dataKey="historia" name="História" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar de Desempenho */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Desempenho por Disciplina
              </h2>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={desempenhoDisciplinas}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar name="Aluno" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Boletim */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                Boletim Escolar 2026
              </h2>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Download size={18} /> Baixar Boletim
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-3 px-3">Disciplina</th>
                    <th className="text-center py-3 px-3">1º Bim</th>
                    <th className="text-center py-3 px-3">2º Bim</th>
                    <th className="text-center py-3 px-3">3º Bim</th>
                    <th className="text-center py-3 px-3">4º Bim</th>
                    <th className="text-center py-3 px-3">Média</th>
                    <th className="text-center py-3 px-3">Faltas</th>
                    <th className="text-center py-3 px-3">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {boletim.map((item) => (
                    <tr key={item.disciplina} className="border-b dark:border-slate-800">
                      <td className="py-3 px-3 font-medium">{item.disciplina}</td>
                      <td className="text-center py-3 px-3">{item.nota1}</td>
                      <td className="text-center py-3 px-3">{item.nota2}</td>
                      <td className="text-center py-3 px-3">{item.nota3}</td>
                      <td className="text-center py-3 px-3">{item.nota4}</td>
                      <td className="text-center py-3 px-3 font-semibold text-blue-600">{item.media}</td>
                      <td className="text-center py-3 px-3">{item.faltas}</td>
                      <td className="text-center py-3 px-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          item.media >= 7 
                            ? 'bg-green-100 text-green-700' 
                            : item.media >= 5 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.media >= 7 ? 'Aprovado' : item.media >= 5 ? 'Recuperação' : 'Reprovado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Horário de Aulas e Atividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horário de Aulas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-blue-500" size={24} />
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                  Horário de Aulas
                </h2>
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {["segunda", "terca", "quarta", "quinta", "sexta"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      selectedDay === day 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {horarioAulas.map((horario, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-sm font-medium text-blue-600 w-28">{horario.horario}</span>
                    <span className="flex-1 text-center">
                      {horario[selectedDay as keyof typeof horario]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades Pendentes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-green-500" size={24} />
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                    Atividades Pendentes
                  </h2>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-semibold">
                  {atividadesPendentes.filter(a => a.status === 'pendente').length}
                </span>
              </div>
              <div className="space-y-3">
                {atividadesPendentes.map((atividade) => (
                  <div key={atividade.id} className={`p-3 rounded-xl border-l-4 ${
                    atividade.status === 'concluido' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{atividade.atividade}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{atividade.disciplina}</p>
                        <p className="text-xs text-slate-500">Entrega: {atividade.entrega}</p>
                      </div>
                      {atividade.status === 'concluido' ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <AlertCircle className="text-yellow-500" size={20} />
                      )}
                    </div>
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