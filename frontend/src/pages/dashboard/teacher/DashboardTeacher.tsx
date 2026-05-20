import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MetricCard from "../../../components/layout/MetricCard";
import { BookOpen, Users, TrendingUp, Clock, CheckSquare } from "lucide-react";

export default function DashboardTeacher() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard do Professor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Bem-vindo(a)! Acompanhe suas turmas e atividades
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <MetricCard title="Minhas Turmas" value="5" icon={<BookOpen />} />
            <MetricCard title="Total de Alunos" value="147" icon={<Users />} />
            <MetricCard title="Frequência Média" value="92%" icon={<TrendingUp />} trend={3} />
            <MetricCard title="Atividades Pendentes" value="8" icon={<CheckSquare />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 md:mt-8">
            {/* Próximas Aulas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
                Próximas Aulas
              </h2>
              <div className="space-y-3">
                {[
                  { horario: "07:30 - 08:15", turma: "2º Ano A", disciplina: "Matemática" },
                  { horario: "08:15 - 09:00", turma: "2º Ano B", disciplina: "Matemática" },
                  { horario: "09:30 - 10:15", turma: "3º Ano A", disciplina: "Geometria" },
                ].map((aula, index) => (
                  <div key={index} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{aula.disciplina}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{aula.turma}</p>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{aula.horario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades para Corrigir */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">
                Atividades para Corrigir
              </h2>
              <div className="space-y-3">
                {[
                  { titulo: "Prova Bimestral", turma: "2º Ano A", entregues: 28, total: 32 },
                  { titulo: "Trabalho em Grupo", turma: "3º Ano B", entregues: 25, total: 30 },
                  { titulo: "Lista de Exercícios", turma: "1º Ano C", entregues: 30, total: 35 },
                ].map((atividade, index) => (
                  <div key={index} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-800 dark:text-white">{atividade.titulo}</p>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">
                        {atividade.entregues}/{atividade.total}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{atividade.turma}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(atividade.entregues / atividade.total) * 100}%` }}
                      />
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