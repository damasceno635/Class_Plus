import { useState, useEffect } from "react";
import { Users, DollarSign, Activity, FileText, Loader2, ArrowRight, Settings, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";

interface AdminData {
  usuariosAtivos: number;
  totalAlunos: number;
  totalFuncionarios: number;
  receitaTotal: number;
  requisicoesPendentes: number;
}

export default function AdminDashboard() {
  useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading || !data) return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4"> 
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">Visão Executiva (Admin)</h1>
                <p className="text-slate-400 text-lg max-w-2xl">Controlo total sobre os indicadores de crescimento, receitas e volume de utilizadores em tempo real.</p>
              </div>
              <button onClick={() => navigate('/relatorios')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                <PieChart size={18} /> Central de Relatórios
              </button>
            </div>
            <Activity size={200} className="absolute -right-10 -bottom-10 text-white opacity-5 pointer-events-none" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Painel de Métricas Core</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div onClick={() => navigate('/funcionarios')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Users size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{data.usuariosAtivos}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Massa Académica</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-4">{data.totalAlunos} alunos ativos</p>
            </div>

            <div onClick={() => navigate('/financeiro')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center dark:bg-green-900/30 dark:text-green-400"><DollarSign size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-green-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 truncate">{formatarMoeda(data.receitaTotal)}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Faturação Liquidada</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-4">Caixa consolidado atual</p>
            </div>

            <div onClick={() => navigate('/requisicoes')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400"><FileText size={28} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{data.requisicoesPendentes}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Protocolos Abertos</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-4">Volume da secretaria</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400"><Activity size={28} /></div>
              </div>
              <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">99.9%</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Uptime Servidor</p>
              <p className="text-xs text-slate-500 mt-4">Sistema estritamente operacional</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Ferramentas de Gestão</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => navigate('/alunos')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors text-left group">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><Users size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Gerir Utilizadores</h3><p className="text-xs text-slate-500">Alunos e Funcionários</p></div>
            </button>
            <button onClick={() => navigate('/financeiro')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-green-500 transition-colors text-left group">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform"><DollarSign size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Painel Financeiro</h3><p className="text-xs text-slate-500">Balanço e Mensalidades</p></div>
            </button>
            <button onClick={() => navigate('/backup')} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-500 transition-colors text-left group">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl group-hover:scale-110 transition-transform"><Settings size={24} /></div>
              <div><h3 className="font-bold text-slate-800 dark:text-white">Configurações</h3><p className="text-xs text-slate-500">Backups e Sistema</p></div>
            </button>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}