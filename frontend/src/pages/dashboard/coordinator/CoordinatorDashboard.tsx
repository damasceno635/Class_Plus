import { useState, useEffect } from "react";
import { FileCheck, Activity, Calendar as CalendarIcon, ArrowRight, Loader2, Award, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/coordinator').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-black mb-2">Coordenação Pedagógica</h1>
              <p className="text-purple-100 text-lg max-w-2xl">Olá, {user?.nome?.split(' ')[0]}! Aqui você tem a visão macro do desempenho acadêmico e planos de aula pendentes.</p>
            </div>
            <Award size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 pointer-events-none" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Indicadores de Qualidade</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div onClick={() => navigate('/roteiro-aula')} className={`p-6 rounded-3xl shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group ${data.roteirosPendentes > 0 ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400"><FileCheck size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.roteirosPendentes}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Roteiros à Espera</p>
              <p className={`text-xs font-semibold mt-4 ${data.roteirosPendentes > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500'}`}>Pendentes de aprovação</p>
            </div>

            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Activity size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.mediaGeral}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Média Institucional</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(parseFloat(data.mediaGeral) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div onClick={() => navigate('/calendario')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400"><CalendarIcon size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2 mt-2">{data.eventosHoje}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Eventos Hoje</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-4">Reuniões e feriados</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Gestão Pedagógica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/roteiro-aula')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors text-left group">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform"><FileCheck size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Analisar Planos de Aula</h3><p className="text-xs text-slate-500">Aprovar ou solicitar revisão</p></div>
            </button>
            <button onClick={() => navigate('/relatorios')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors text-left group">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Emitir Relatórios</h3><p className="text-xs text-slate-500">Estatísticas de aprovação da escola</p></div>
            </button>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}