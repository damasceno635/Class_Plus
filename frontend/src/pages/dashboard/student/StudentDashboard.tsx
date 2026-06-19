import { useState, useEffect } from "react";
import { GraduationCap, Target, DollarSign, ArrowRight, Loader2, BookOpen, FileText, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          {/* BANNER DE BOAS-VINDAS */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-black mb-2">Olá, {user?.nome?.split(' ')[0]}!</h1>
              <p className="text-blue-100 text-lg max-w-2xl">Bem-vindo(a) ao seu portal acadêmico. Acompanhe o seu progresso, veja as suas notas e fique em dia com os seus compromissos.</p>
            </div>
            <GraduationCap size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 pointer-events-none" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Resumo do Semestre</h2>

          {/* CARDS DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><GraduationCap size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.mediaGeral}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Média Geral</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(parseFloat(data.mediaGeral) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-900/30 dark:text-purple-400"><Target size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2">{data.freqGeral}%</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Frequência</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
                <div className={`h-2 rounded-full ${data.freqGeral >= 75 ? 'bg-purple-500' : 'bg-red-500'}`} style={{ width: `${data.freqGeral}%` }}></div>
              </div>
            </div>

            <div onClick={() => navigate('/financeiro')} className={`p-6 rounded-3xl shadow-md text-white cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group ${data.proximaFatura === 'Atrasado' ? 'bg-gradient-to-br from-red-600 to-rose-700' : data.proximaFatura === 'Pendente' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"><DollarSign size={28} /></div>
                <ArrowRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-3xl font-black mb-2 mt-4 leading-tight">
                {data.proximaFatura === 'Atrasado' ? 'Fatura\nAtrasada!' : data.proximaFatura === 'Pendente' ? 'Fatura\nPendente' : 'Mensalidade\nem Dia'}
              </h2>
              <p className="text-sm font-bold text-white/80 uppercase tracking-wider mt-4">Situação Financeira</p>
            </div>
          </div>

          {/* ACESSO RÁPIDO */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => navigate('/desempenho')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left group">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Meu Boletim</h3><p className="text-xs text-slate-500">Ver notas detalhadas</p></div>
            </button>
            <button onClick={() => navigate('/requisicoes')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors text-left group">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Protocolos</h3><p className="text-xs text-slate-500">Solicitar documentos</p></div>
            </button>
            <button onClick={() => navigate('/calendario')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform"><CalendarDays size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Calendário</h3><p className="text-xs text-slate-500">Feriados e Eventos</p></div>
            </button>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}