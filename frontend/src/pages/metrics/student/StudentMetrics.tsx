import { useState, useEffect, useMemo } from "react";
import { Trophy, Target, Activity, AlertTriangle, CheckCircle2, TrendingUp, BookOpen, Loader2 } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";

export default function StudentMetrics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ turma: "-", totalAlunos: 0, posicaoRanking: 0, mediaGeral: 0, frequenciaGeral: 100 });
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await api.get('/metricas/aluno');
        setStats(response.data.stats);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => b.media - a.media);
  }, [subjects]);

  const getStatusColor = (media: number) => {
    if (media >= 8.0) return "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (media >= 6.0) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    return "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  const getProgressColor = (media: number) => {
    if (media >= 8.0) return "bg-green-500";
    if (media >= 6.0) return "bg-amber-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Desempenho de {user?.nome || "Aluno"}</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhamento de médias e frequências acadêmicas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <Trophy size={120} className="absolute -right-6 -bottom-6 text-white opacity-10" />
              <div>
                <h3 className="text-blue-100 font-semibold mb-1 flex items-center gap-2"><TrendingUp size={18} /> Turma</h3>
                <p className="text-sm text-blue-200 mb-4">{stats.turma}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black">{stats.totalAlunos}</span>
                <span className="text-lg text-blue-200 font-medium">Alunos na sala</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2"><Target size={18} className="text-blue-500" /> Média Geral</h3>
              </div>
              <div>
                <div className="text-5xl font-black text-slate-800 dark:text-white mb-2">{stats.mediaGeral.toFixed(1)}</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats.mediaGeral / 10) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Frequência Geral</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-600" strokeWidth="3" strokeDasharray={`${stats.frequenciaGeral}, 100`} stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-xl font-bold text-slate-800 dark:text-white">{stats.frequenciaGeral}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="text-blue-500" /> Detalhamento por Disciplina</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Disciplina</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 w-1/3">Aproveitamento (Média)</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Faltas Incorridas</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map((subject) => {
                    const statusClass = getStatusColor(subject.media);
                    const progressClass = getProgressColor(subject.media);
                    const freqPercent = subject.aulasDadas > 0 ? Math.round(((subject.aulasDadas - subject.faltas) / subject.aulasDadas) * 100) : 100;

                    return (
                      <tr key={subject.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 dark:text-white text-base">{subject.nome}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{subject.aulasDadas} aulas cadastradas</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="w-8 font-black text-slate-800 dark:text-white text-right">{subject.media.toFixed(1)}</span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                              <div className={`${progressClass} h-2 rounded-full`} style={{ width: `${(subject.media / 10) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-slate-800 dark:text-white">{subject.faltas}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${freqPercent < 75 ? 'text-red-500' : 'text-slate-400'}`}>{freqPercent}% presenças</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${statusClass}`}>
                              {subject.media >= 8.0 && <CheckCircle2 size={14} />}
                              {subject.media >= 6.0 && subject.media < 8.0 && <Activity size={14} />}
                              {subject.media < 6.0 && <AlertTriangle size={14} />}
                              {subject.media >= 8.0 ? "Aprovado" : subject.media >= 6.0 ? "Na Média" : "Atenção"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedSubjects.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum registro acadêmico lançado ainda.</td></tr>
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