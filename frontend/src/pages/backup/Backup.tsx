import { useState } from "react";
import { DownloadCloud, UploadCloud, RefreshCw, Settings, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

export default function Backup() {
  const [exportando, setExportando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [arquivoRestauracao, setArquivoRestauracao] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. GERAR BACKUP MANUAL (DOWNLOAD DO JSON)
  const handleBackupManual = async () => {
    setExportando(true);
    setFeedback(null);
    try {
      const response = await api.get('/backup/export');
      
      // Converte o JSON num ficheiro Blob para download
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      
      // Cria um link invisível e clica nele para forçar o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_classplus_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setFeedback({ type: "success", message: "Backup gerado e descarregado com sucesso!" });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao gerar o backup do sistema." });
    } finally {
      setExportando(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // 2. RESTAURAR BACKUP (UPLOAD)
  const handleRestaurar = async () => {
    if (!arquivoRestauracao) {
      alert("Selecione um ficheiro JSON de backup primeiro.");
      return;
    }

    if (!confirm("Atenção! A restauração irá substituir todos os dados atuais. Deseja prosseguir?")) {
      return;
    }

    setRestaurando(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivoRestauracao);

      await api.post('/backup/restore', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFeedback({ type: "success", message: "Sistema restaurado com sucesso a partir do backup!" });
      setArquivoRestauracao(null);
    } catch (error) {
      setFeedback({ type: "error", message: "Ficheiro corrompido ou erro na restauração." });
    } finally {
      setRestaurando(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Segurança e Backups</h1>
            <p className="text-slate-500 dark:text-slate-400">Proteja a integridade dos dados escolares através de exportações e configurações de segurança.</p>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold ${feedback.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: BACKUP MANUAL */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-14 h-14 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                  <DownloadCloud size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Backup Manual</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gere um ficheiro JSON instantâneo contendo todas as tabelas, faturas, alunos e funcionários registados no sistema.
                </p>
              </div>
              <button 
                onClick={handleBackupManual}
                disabled={exportando}
                className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {exportando ? <Loader2 size={20} className="animate-spin" /> : <DownloadCloud size={20} />}
                {exportando ? "A empacotar dados..." : "Descarregar Backup"}
              </button>
            </div>

            {/* CARD 2: CONFIGURAÇÃO AUTOMÁTICA */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <RefreshCw size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Backup Automático</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configure o sistema para realizar cópias de segurança diárias para a nuvem às 03:00 da manhã.
                </p>
              </div>
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Settings size={18} className="text-slate-400" /> Ativar Rotina
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* CARD 3: RESTAURAÇÃO */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-red-200 dark:border-red-900/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-14 h-14 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
                  <UploadCloud size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Restaurar Dados</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Faça o upload de um ficheiro de backup (.json) para reverter o sistema para um estado anterior.
                </p>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={(e) => setArquivoRestauracao(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/30 dark:file:text-red-400 cursor-pointer"
                />
              </div>
              <button 
                onClick={handleRestaurar}
                disabled={restaurando || !arquivoRestauracao}
                className="mt-6 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {restaurando ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                {restaurando ? "A processar matriz..." : "Executar Restauração"}
              </button>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}