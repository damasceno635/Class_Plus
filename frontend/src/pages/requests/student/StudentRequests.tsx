import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { Plus, Search, Clock, CheckCircle2, XCircle, Paperclip, Eye, X, AlertCircle, Loader2, FileText } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

type StatusRequisicao = "Pendente" | "Em Análise" | "Concluído" | "Negado";

interface RequisicaoAluno {
  id: string; // Protocolo
  realId?: string; // ID do banco
  tipo: string;
  dataSolicitacao: string;
  status: StatusRequisicao;
  descricao: string;
  respostaSecretaria?: string;
  arquivoAnexo?: string;
  arquivoSecretaria?: string; 
}

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" /> },
  "Em Análise": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} className="text-red-600 dark:text-red-400" /> },
};

export default function StudentRequests() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoAluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequisicaoAluno | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Form states
  const [formTipo, setFormTipo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formArquivo, setFormArquivo] = useState<File | null>(null);

  // Carregar dados da API
  const carregarRequisicoes = async () => {
    try {
      const response = await api.get('/requisicoes');
      setRequisicoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar requisições", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRequisicoes();
  }, []);

  const filteredRequisicoes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return requisicoes;
    return requisicoes.filter(r => r.tipo.toLowerCase().includes(term) || r.id.toLowerCase().includes(term));
  }, [requisicoes, searchTerm]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTipo || !formDescricao) return;

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("tipo", formTipo);
      formData.append("descricao", formDescricao);
      if (formArquivo) formData.append("anexo", formArquivo);

      await api.post('/requisicoes', formData, { headers: { "Content-Type": "multipart/form-data" } });
      
      await carregarRequisicoes(); // Recarrega a lista
      setIsNewModalOpen(false);
      setFormTipo("");
      setFormDescricao("");
      setFormArquivo(null);
    } catch (error) {
      alert("Erro ao enviar a requisição.");
    } finally {
      setEnviando(false);
    }
  };

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
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Minhas Requisições</h1>
              <p className="text-slate-500 dark:text-slate-400">Solicite documentos e acompanhe seus pedidos na secretaria.</p>
            </div>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all shadow-md w-fit cursor-pointer"
            >
              <Plus size={18} /> Novo Pedido
            </button>
          </div>

          <div className="mb-6 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por protocolo ou tipo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Protocolo</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Solicitação</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisicoes.map((req) => {
                    const style = statusStylesMap[req.status];
                    return (
                      <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">{req.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{req.tipo}</td>
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
                    <tr><td colSpan={5} className="text-center py-12 text-slate-500">Nenhuma requisição encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Novo Pedido */}
          {isNewModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nova Requisição</h2>
                  <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Documento/Serviço *</label>
                    <select required value={formTipo} onChange={(e) => setFormTipo(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione...</option>
                      <option value="Declaração de Vínculo Escolar">Declaração de Vínculo Escolar</option>
                      <option value="Histórico Escolar Parcial">Histórico Escolar Parcial</option>
                      <option value="Justificativa de Falta">Justificativa de Falta</option>
                      <option value="Revisão de Nota">Revisão de Nota</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo / Descrição *</label>
                    <textarea required rows={4} value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} placeholder="Detalhe sua solicitação..." className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anexo (Ex: Atestado Médico)</label>
                    <input type="file" onChange={(e) => setFormArquivo(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer" />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={enviando} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                      {enviando && <Loader2 size={18} className="animate-spin" />}
                      {enviando ? "Enviando..." : "Enviar Pedido"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detalhes */}
          {selectedReq && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${statusStylesMap[selectedReq.status].bg} ${statusStylesMap[selectedReq.status].text}`}>
                      {selectedReq.status}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedReq.tipo}</h2>
                    <p className="text-sm font-mono text-slate-400 mt-1">Protocolo: {selectedReq.id}</p>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Sua Solicitação</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReq.descricao}</p>
                  </div>

                  {selectedReq.respostaSecretaria && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                      <p className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Resposta da Secretaria</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">{selectedReq.respostaSecretaria}</p>
                    </div>
                  )}

                  {selectedReq.arquivoSecretaria && (
                    <div className="flex items-center justify-between p-3 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 mt-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400">
                          <FileText size={18} />
                        </div>
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Documento Oficial Emitido</span>
                      </div>
                      <a href={selectedReq.arquivoSecretaria} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Visualizar / Baixar</a>
                    </div>
                  )}

                  {selectedReq.arquivoAnexo && (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Paperclip size={18} /></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">Documento Anexado</span>
                      </div>
                      <a href={selectedReq.arquivoAnexo} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Ver / Baixar</a>
                    </div>
                  )}
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