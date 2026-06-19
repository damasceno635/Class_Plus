import { useState, useEffect } from "react";
import { BookOpen, Edit3, Calendar as CalendarIcon, ArrowRight, Loader2, Users, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/teacher').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-black mb-2">Bom dia, Prof. {user?.nome?.split(' ')[0]}!</h1>
              <p className="text-emerald-100 text-lg max-w-2xl">Preparado(a) para mais um dia de aulas? Aqui está o resumo das suas turmas e atividades pendentes.</p>
            </div>
            <BookOpen size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 pointer-events-none" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Panorama Académico</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Users size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.turmas}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Minhas Turmas</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-4">Diários alocados a si</p>
            </div>

            <div onClick={() => navigate('/roteiro-aula')} className={`p-6 rounded-3xl shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group ${data.roteirosAcao > 0 ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/40 dark:text-amber-400"><Edit3 size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.roteirosAcao}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Roteiros Pendentes</p>
              <p className={`text-xs font-semibold mt-4 ${data.roteirosAcao > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500'}`}>Necessitam revisão ou envio</p>
            </div>

            <div onClick={() => navigate('/calendario')} className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 p-6 rounded-3xl shadow-md text-white cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"><CalendarIcon size={28} /></div>
                <ArrowRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-5xl font-black mb-2 mt-2">{data.eventosHoje}</h2>
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Eventos Hoje</p>
              <p className="text-xs text-white/70 font-semibold mt-4">No calendário da escola</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Sala de Professores (Ações)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/desempenho')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors text-left group">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Lançar Frequência e Notas</h3><p className="text-xs text-slate-500">Abrir Diário de Classe</p></div>
            </button>
            <button onClick={() => navigate('/roteiro-aula')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors text-left group">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform"><FileCheck size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Novo Plano de Aula</h3><p className="text-xs text-slate-500">Criar e enviar para coordenação</p></div>
            </button>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}