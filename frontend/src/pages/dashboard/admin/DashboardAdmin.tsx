import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MetricCard from "../../../components/layout/MetricCard";
import { Users, School, BookOpen, TrendingUp, Calendar as CalendarIcon, Clock } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const matriculasData = [
  { mes: "Jan", alunos: 1000 },
  { mes: "Fev", alunos: 1100 },
  { mes: "Mar", alunos: 1200 },
  { mes: "Abr", alunos: 1245 },
  { mes: "Mai", alunos: 1300 },
  { mes: "Jun", alunos: 1350 },
];

const agendaEventos = [
  { horario: "08:00", titulo: "Reunião Pedagógica", descricao: "Planejamento do próximo bimestre" },
  { horario: "10:30", titulo: "Avaliação Matemática", descricao: "Prova bimestral - 3º ano" },
  { horario: "14:00", titulo: "Conselho Escolar", descricao: "Discussão sobre melhorias" },
  { horario: "16:00", titulo: "Entrega de Boletins", descricao: "Reunião com pais e responsáveis" },
];

export default function DashboardAdmin() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard Administrativo
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Visão geral da gestão escolar
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <MetricCard title="Alunos" value="1.245" icon={<Users />} trend={12} />
            <MetricCard title="Funcionários" value="87" icon={<School />} trend={5} />
            <MetricCard title="Turmas" value="32" icon={<BookOpen />} />
            <MetricCard title="Frequência" value="94%" icon={<TrendingUp />} trend={2} />
          </div>

          {/* Gráficos e Calendário */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 md:mt-8">
            {/* Calendário */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-5">
                <CalendarIcon className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Calendário Escolar
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Calendar className="border-none rounded-xl w-full" />
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
                Evolução de Matrículas
              </h2>
              <div className="h-64 sm:h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={matriculasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="alunos" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-6 md:mt-8">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Agenda Escolar
              </h2>
            </div>
            <div className="space-y-3 md:space-y-4">
              {agendaEventos.map((evento, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-16 md:w-20">
                      <strong className="text-blue-600 dark:text-blue-400">{evento.horario}</strong>
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-200 font-medium">{evento.titulo}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{evento.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}