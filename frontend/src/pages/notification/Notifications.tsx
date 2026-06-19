import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, Loader2, Info } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

export default function Notifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarNotificacoes = async () => {
    try {
      const response = await api.get('/notificacoes');
      setNotificacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      await api.put(`/notificacoes/${id}/lida`);
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error("Erro ao marcar como lida", error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.put('/notificacoes/lidas');
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error("Erro ao limpar notificações", error);
    }
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(data);
  };

  const temNaoLidas = notificacoes.some(n => !n.lida);

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
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full min-w-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl">
                <Bell size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Notificações</h1>
                <p className="text-slate-500 dark:text-slate-400">Fique por dentro das novidades do sistema.</p>
              </div>
            </div>
            
            {temNaoLidas && (
              <button onClick={marcarTodasComoLidas} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors">
                <Check size={18} /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="space-y-4">
            {notificacoes.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 rounded-3xl border transition-all flex gap-4 ${notif.lida ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-75' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm'}`}
              >
                <div className="mt-1">
                  {notif.lida ? (
                    <CheckCircle2 size={24} className="text-slate-400" />
                  ) : (
                    <Info size={24} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                    <h3 className={`font-bold ${notif.lida ? 'text-slate-700 dark:text-slate-300' : 'text-blue-900 dark:text-blue-100'}`}>{notif.titulo}</h3>
                    <span className="text-xs font-semibold text-slate-400">{formatarData(notif.criadoEm)}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.lida ? 'text-slate-500 dark:text-slate-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    {notif.mensagem}
                  </p>
                  
                  {!notif.lida && (
                    <button onClick={() => marcarComoLida(notif.id)} className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))}

            {notificacoes.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Tudo limpo por aqui!</h3>
                <p className="text-slate-500">Você não possui nenhuma notificação no momento.</p>
              </div>
            )}
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}