import { useState, useEffect } from "react";
import { Building2, TrendingUp, ShieldAlert, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

interface SegmentoMetrics {
  nome: string;
  mediaGeral: number;
  taxaAprovacao: number;
  totalAlunos: number;
}

export default function AdminPerformance() {
  const [loading, setLoading] = useState(true);
  const [global, setGlobal] = useState({ evasao: "0.0", media: "0.0", corte: "6.0" });
  const [segmentos, setSegmentos] = useState<SegmentoMetrics[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get('/metricas/admin');
        setGlobal(response.data.global);
        setSegmentos(response.data.segmentos);
      } catch (error) {
        console.error("Erro ao buscar métricas", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
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
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Indicadores Globais</h1>
            <p className="text-slate-500 dark:text-slate-400">Visão macro analítica do aproveitamento acadêmico institucional baseado no banco de dados.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Taxa de Evasão (Inativos)</h3>
                <ShieldAlert className="text-red-500" size={20} />
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{global.evasao}%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Média Geral da Instituição</h3>
                <Building2 className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{global.media}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(parseFloat(global.media) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Nota de Corte</h3>
                <TrendingUp className="text-purple-500" size={20} />
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{global.corte}</p>
              <span className="text-xs text-slate-400 mt-2">Aproveitamento mínimo do regimento</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-500" /> Rendimento por Nível de Ensino
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {segmentos.map((seg) => (
              <div key={seg.nome} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{seg.nome}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 font-medium">Estudantes Ativos</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{seg.totalAlunos}</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="text-slate-400 font-medium">Média Unificada</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{seg.mediaGeral.toFixed(1)} / 10</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${seg.mediaGeral * 10}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="text-slate-400 font-medium">Índice de Notas Acima da Média</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{seg.taxaAprovacao}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${seg.taxaAprovacao}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer hover:underline">
                    Ver alunos do nível <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}