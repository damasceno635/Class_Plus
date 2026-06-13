import { useState, useEffect } from "react";
import { Users, DollarSign, Activity, FileText, Loader2, ArrowRight } from "lucide-react";
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
  const { user } = useAuth();
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

  if (loading || !data) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Geral Administrativa</h1>
            <p className="text-slate-500 dark:text-slate-400">Controlo total sobre a instituição em tempo real.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            
            {/* Card 1: Usuários */}
            <div onClick={() => navigate('/funcionarios')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Users size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{data.usuariosAtivos}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Utilizadores Ativos</p>
              <p className="text-xs text-slate-500 mt-2">{data.totalAlunos} alunos e {data.totalFuncionarios} funcionários</p>
            </div>

            {/* Card 2: Receita */}
            <div onClick={() => navigate('/financeiro')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center dark:bg-green-900/30 dark:text-green-400"><DollarSign size={24} /></div>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-green-500 transition-colors" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{formatarMoeda(data.receitaTotal)}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Receita Confirmada</p>
              <p className="text-xs text-green-600 font-semibold mt-2">Valores liquidados no sistema</p>
            </div>

            {/* Card 3: Status do Sistema */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/30 dark:text-purple-400"><Activity size={24} /></div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">Online</h2>
              <p className="text-sm font-bold text-slate-400 uppercase">Status do Servidor</p>
              <p className="text-xs text-slate-500 mt-2">Bancos de dados a operar normalmente</p>
            </div>

            {/* Card 4: Requisições */}
            <div onClick={() => navigate('/requisicoes')} className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 p-6 rounded-3xl shadow-sm text-white cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white"><FileText size={24} /></div>
                <ArrowRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-3xl font-black mb-1">{data.requisicoesPendentes}</h2>
              <p className="text-sm font-bold text-slate-300 uppercase">Protocolos Pendentes</p>
              <p className="text-xs text-amber-400 font-semibold mt-2">A aguardar ação da secretaria</p>
            </div>
          </div>
          
        </main>
        <Footer />
      </div>
    </div>
  );
}