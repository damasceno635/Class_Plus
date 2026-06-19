import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { 
  Search, Clock, CheckCircle2, XCircle, AlertCircle, Eye, X, Paperclip, Check, Download, FileText, Loader2, Upload, Trash2
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";
import html2pdf from "html2pdf.js";

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
  arquivoSecretaria?: string; // URL do documento enviado pela secretaria
}

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} /> },
  "Em Análise": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <AlertCircle size={16} /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} /> },
};

export default function SecretaryRequests() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState<Requisicao | null>(null);
  
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [arquivoRetorno, setArquivoRetorno] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Carregar requisições da API
  const carregarRequisicoes = async () => {
    try {
      const response = await api.get('/requisicoes');
      const formatadas = response.data.map((r: any) => ({
        id: r.id,
        realId: r.realId,
        solicitante: r.nomeAluno,
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
      console.error("Erro ao carregar requisições:", error);
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
    return requisicoes.filter(r => 
      r.tipo.toLowerCase().includes(term) || 
      r.solicitante.toLowerCase().includes(term) || 
      r.id.toLowerCase().includes(term)
    );
  }, [requisicoes, searchTerm]);

  // Gerar PDF e opcionalmente anexar automaticamente
  const handleGerarDocumento = async () => {
    if (!selectedReq) return;
    setGerandoPdf(true);

    const htmlContent = `...`; 

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opcoes = {
      margin: 15,
      filename: `${selectedReq.tipo.replace(/\s/g, '_')}_${selectedReq.matricula}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    try {
      const pdfBlob = await html2pdf().set(opcoes).from(container).output('blob');
      const pdfFile = new File([pdfBlob], `${selectedReq.tipo.replace(/\s/g, '_')}_${selectedReq.matricula}.pdf`, { type: 'application/pdf' });
      setArquivoRetorno(pdfFile);
      alert("PDF gerado e anexado automaticamente! Ele será enviado ao aluno quando você concluir a solicitação.");
    } catch (err) {
      alert("Erro ao gerar o PDF.");
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleAtualizarStatus = async (novoStatus: "Concluído" | "Negado" | "Em Análise") => {
    if (!selectedReq) return;
    if ((novoStatus === "Negado" || novoStatus === "Concluído") && !resposta.trim()) {
      alert("Por favor, preencha uma resposta para o aluno antes de finalizar o protocolo.");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("status", novoStatus);
      formData.append("respostaSecretaria", resposta);
      if (arquivoRetorno) formData.append("documento", arquivoRetorno);

      await api.put(`/requisicoes/${selectedReq.realId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await carregarRequisicoes();
      
      if (novoStatus === "Concluído" || novoStatus === "Negado") {
        setSelectedReq(null);
        setResposta("");
        setArquivoRetorno(null);
      } else {
        setSelectedReq({ ...selectedReq, status: novoStatus });
      }
    } catch (error) {
      alert("Erro ao atualizar a requisição.");
    } finally {
      setEnviando(false);
    }
  };

  const abrirModal = (req: Requisicao) => {
    setSelectedReq(req);
    setResposta(req.respostaSecretaria || "");
    setArquivoRetorno(null); // limpa anexo anterior ao abrir modal
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Central de Atendimento</h1>
            <p className="text-slate-500 dark:text-slate-400">Gerenciamento de solicitações e emissão de documentos para alunos.</p>
          </div>

          <div className="mb-6 max-w-md relative">
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
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Tipo</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Analisar</th>
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
                          <p className="text-xs text-slate-400">Matrícula: {req.matricula}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{req.tipo}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.icon} {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => abrirModal(req)} className={`p-2 rounded-xl transition-all duration-200 ${
                            req.status === 'Pendente' || req.status === 'Em Análise' 
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50" 
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            }`}>
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequisicoes.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-500">Nenhum protocolo encontrado no sistema.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Atendimento */}
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
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexo do aluno</span>
                      </div>
                      <a href={selectedReq.arquivoAluno} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"><Download size={14}/> Visualizar / Baixar</a>
                    </div>
                  )}
                </div>

                {/* Área de Resposta da Secretaria */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  {(selectedReq.status === "Pendente" || selectedReq.status === "Em Análise") ? (
                    <div className="space-y-4">
                      {selectedReq.status === "Pendente" && (
                        <button onClick={() => handleAtualizarStatus("Em Análise")} className="mb-2 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                          Mudar Status para "Em Análise"
                        </button>
                      )}
                      
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resposta ao Aluno *</label>                       
                        <button 
                          onClick={handleGerarDocumento}
                          disabled={gerandoPdf}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          {gerandoPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                          Gerar PDF e Anexar
                        </button>
                      </div>
                      
                      <textarea 
                        rows={3} 
                        value={resposta} 
                        onChange={(e) => setResposta(e.target.value)} 
                        placeholder="Digite o retorno que o aluno verá na área dele..." 
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                      />

                      {/* Campo de upload de arquivo para anexar documento (PDF, imagem, etc.) */}
                      <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4">
                        <label className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition">
                          <Upload size={18} />
                          <span>Clique para anexar um documento (PDF, imagem, etc.)</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setArquivoRetorno(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {arquivoRetorno && (
                          <div className="mt-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Paperclip size={16} className="text-slate-500" />
                              <span className="text-sm truncate max-w-[200px]">{arquivoRetorno.name}</span>
                            </div>
                            <button 
                              onClick={() => setArquivoRetorno(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => handleAtualizarStatus("Negado")} className="px-5 py-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-bold transition flex items-center gap-2">
                          <XCircle size={18} /> Negar
                        </button>
                        <button onClick={() => handleAtualizarStatus("Concluído")} disabled={enviando} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50">
                          {enviando ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Concluir e Enviar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-1">Status Final: {selectedReq.status}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2"><span className="font-bold">Sua Resposta:</span> {selectedReq.respostaSecretaria}</p>
                      {selectedReq.arquivoSecretaria && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-bold text-slate-500 mb-1">Documento anexado pela secretaria:</p>
                          <a href={selectedReq.arquivoSecretaria} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                            <Download size={14} /> Baixar documento
                          </a>
                        </div>
                      )}
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