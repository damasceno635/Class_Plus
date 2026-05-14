import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Footer from "../../components/layout/Footer";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { mes: "Jan", alunos: 1000 },
  { mes: "Fev", alunos: 1100 },
  { mes: "Mar", alunos: 1200 },
  { mes: "Abr", alunos: 1245 },
];

export default function Dashboard() {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-950 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
            Dashboard
          </h1>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card title="Alunos" value="1.245" />
            <Card title="Funcionários" value="87" />
            <Card title="Turmas" value="32" />
            <Card title="Frequência" value="94%" />
          </div>

          {/* Calendário e Gráfico */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
                Calendário Escolar
              </h2>
              <Calendar className="border-none rounded-xl" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
                Evolução de Matrículas
              </h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="alunos"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: "#2563eb", strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Agenda Escolar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow mt-8">
            <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
              Agenda Escolar
            </h2>

            <div className="space-y-4">
              <AgendaCard
                horario="08:00"
                titulo="Reunião Pedagógica"
              />
              <AgendaCard
                horario="10:30"
                titulo="Avaliação Matemática"
              />
              <AgendaCard
                horario="14:00"
                titulo="Conselho Escolar"
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* COMPONENTES AUXILIARES */

interface CardProps {
  title: string;
  value: string;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
        {title}
      </h2>
      <p className="text-4xl font-bold mt-4 text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

interface AgendaCardProps {
  horario: string;
  titulo: string;
}

function AgendaCard({ horario, titulo }: AgendaCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      <strong className="text-blue-600 dark:text-blue-400">
        {horario}
      </strong>
      <span className="text-slate-700 dark:text-slate-200">
        {titulo}
      </span>
    </div>
  );
}