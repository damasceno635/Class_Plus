import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { 
  CheckCircle2, Clock, FileText, Search, Eye, X, 
  Paperclip, Download, AlertCircle, XCircle, Loader2 
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

type StatusRequisicao = "Pendente" | "Em Análise" | "Concluído" | "Negado";

interface Requisicao {
  id: string;
  realId?: string;
  solicitante: string;
  matricula: string;
  tipo: string;
  dataSolicitacao: string;
  status: StatusRequisicao;
  descricao: string;
  arquivoAluno?: string;
  respostaSecretaria?: string;
  arquivoSecretaria?: string;
}

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} /> },
  "Em Análise": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <AlertCircle size={16} /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} /> },
};

export default function AdminRequests() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState<Requisicao | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega todos os protocolos da escola
  useEffect(() => {
    async function carregarRequisicoes() {
      try {
        const response = await api.get('/requisicoes');
        const formatadas = response.data.map((r: any) => ({
          id: r.id,
          realId: r.realId,
          solicitante: r.nomeAluno || "Aluno Desconhecido",
          matricula: r.matricula,
          tipo: r.tipo,
          dataSolicitacao: r.dataSolicitacao,
          status: r.status,
          descricao: r.descricao,
          arquivoAluno: r.arquivoAnexo,
          respostaSecretaria: r.respostaSecretaria || "",
          arquivoSecretaria: r.arquivoSecretaria
        }));
        setRequisicoes(formatadas);
      } catch (error) {
        console.error("Erro ao carregar log de requisições:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarRequisicoes();
  }, []);

  const totalRecebido = requisicoes.length;
  const pendentes = requisicoes.filter(r => r.status === "Pendente").length;
  const emAnalise = requisicoes.filter(r => r.status === "Em Análise").length;
  const rejeitados = requisicoes.filter(r => r.status === "Negado").length;

  const filteredRequisicoes = useMemo(() => {
    // O Admin só visualiza as Concluídas no log
    const apenasConcluidos = requisicoes.filter(r => r.status === "Concluído");
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) return apenasConcluidos;
    
    return apenasConcluidos.filter(r => 
      r.id.toLowerCase().includes(term) || 
      r.tipo.toLowerCase().includes(term) ||
      r.solicitante.toLowerCase().includes(term)
    );
  }, [requisicoes, searchTerm]);

  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Geral de Protocolos</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhamento institucional do volume de requisições operacionais e acadêmicas.</p>
          </div>

          {/* GRID COM CARDS DE CONTAGEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Card 1: Total Recebido */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
                <FileText size={20} /> <span className="font-bold text-sm uppercase">Total Recebido</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{totalRecebido}</p>
            </div>

            {/* Card 2: Pendentes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2 text-amber-500">
                <Clock size={20} /> <span className="font-bold text-sm uppercase">Pendentes</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{pendentes}</p>
            </div>

            {/* Card 3: Em Análise */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2 text-cyan-500 dark:text-cyan-400">
                <AlertCircle size={20} /> <span className="font-bold text-sm uppercase">Em Análise</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{emAnalise}</p>
            </div>

            {/* Card 4: Rejeitados / Negados */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2 text-rose-500">
                <XCircle size={20} /> <span className="font-bold text-sm uppercase">Rejeitados</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{rejeitados}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Log de Movimentações (Concluídas)</h2>
          
          <div className="mb-4 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por protocolo, aluno ou tipo..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Protocolo</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Solicitante</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Inspecionar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisicoes.map((req) => {
                    const style = statusStylesMap[req.status];
                    return (
                      <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{req.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-white">{req.solicitante}</p>
                          <p className="text-xs text-slate-400">{req.tipo}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatarData(req.dataSolicitacao)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.icon} {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setSelectedReq(req)} className="p-2 rounded-xl transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50" title="Visualizar">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequisicoes.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">Nenhum protocolo concluído encontrado no log.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Auditoria (Visualização) */}
          {selectedReq && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedReq.tipo}</h2>
                    <p className="text-sm text-slate-500 mt-1">Solicitado por: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedReq.solicitante}</span> (Matrícula: {selectedReq.matricula})</p>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs uppercase font-bold text-slate-400 mb-2">Mensagem do Aluno</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReq.descricao}</p>
                  </div>

                  {selectedReq.arquivoAluno && (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <Paperclip size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexo do aluno enviado</span>
                      </div>
                      <a href={selectedReq.arquivoAluno} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"><Download size={14}/> Visualizar</a>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStylesMap[selectedReq.status].bg} ${statusStylesMap[selectedReq.status].text}`}>
                        {statusStylesMap[selectedReq.status].icon} {selectedReq.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">Status do Atendimento</span>
                    </div>
                    
                    {selectedReq.respostaSecretaria ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2"><span className="font-bold">Resposta da Secretaria:</span> {selectedReq.respostaSecretaria}</p>
                    ) : (
                      <p className="text-sm text-slate-500 italic mt-2">Nenhuma resposta registrada pela secretaria até o momento.</p>
                    )}

                    {selectedReq.arquivoSecretaria && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 mb-2">Documento oficial anexado pela secretaria:</p>
                        <a href={selectedReq.arquivoSecretaria} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
                          <FileText size={16} /> Visualizar Documento Emitido
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}