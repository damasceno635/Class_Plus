import { useState, useEffect } from "react";
import { FileCheck, Activity, Calendar as CalendarIcon, ArrowRight, Loader2 } from "lucide-react";
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

  if (loading || !data) return <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Olá, {user?.nome}!</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhe o desempenho das turmas e avalie os planos pedagógicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div onClick={() => navigate('/roteiro-aula')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400"><FileCheck size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-1">{data.roteirosPendentes}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Roteiros Pendentes</p>
              <p className="text-xs text-amber-600 font-semibold mt-2">A aguardar a sua aprovação</p>
            </div>

            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Activity size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-1">{data.mediaGeral}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Média Institucional</p>
              <p className="text-xs text-blue-600 font-semibold mt-2">Aproveitamento acadêmico global</p>
            </div>

            <div onClick={() => navigate('/calendario')} className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-sm text-white cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white"><CalendarIcon size={24} /></div>
                <ArrowRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-4xl font-black mb-1">{data.eventosHoje}</h2>
              <p className="text-sm font-bold text-purple-200 uppercase">Eventos Hoje</p>
              <p className="text-xs text-white font-semibold mt-2">Reuniões e feriados no calendário</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}