import { useState, useEffect } from "react";
import { GraduationCap, Target, DollarSign, ArrowRight, Loader2 } from "lucide-react";
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

  if (loading || !data) return <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Olá, {user?.nome}!</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhe o seu progresso escolar e financeiro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><GraduationCap size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-1">{data.mediaGeral}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Minha Média Geral</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(parseFloat(data.mediaGeral) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div onClick={() => navigate('/desempenho')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/30 dark:text-purple-400"><Target size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-1">{data.freqGeral}%</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Minha Frequência</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${data.freqGeral}%` }}></div>
              </div>
            </div>

            <div onClick={() => navigate('/financeiro')} className={`p-6 rounded-3xl shadow-sm text-white cursor-pointer hover:shadow-lg transition-all group ${data.proximaFatura === 'Atrasado' ? 'bg-gradient-to-br from-red-600 to-rose-700' : data.proximaFatura === 'Pendente' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white"><DollarSign size={24} /></div>
                <ArrowRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-3xl font-black mb-1">
                {data.proximaFatura === 'Atrasado' ? 'Fatura Atrasada!' : data.proximaFatura === 'Pendente' ? 'Fatura Pendente' : 'Tudo em Dia'}
              </h2>
              <p className="text-sm font-bold text-white/80 uppercase mt-2">Situação Financeira</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}