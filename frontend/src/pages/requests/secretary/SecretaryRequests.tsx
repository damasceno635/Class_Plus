import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { 
  Search, Clock, CheckCircle2, XCircle, AlertCircle, Eye, X, Paperclip, Send, Check, Download
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

type StatusRequisicao = "Pendente" | "Em Análise" | "Concluído" | "Negado";

interface Requisicao {
  id: string;
  solicitante: string;
  matricula: string;
  tipo: string;
  dataSolicitacao: string;
  status: StatusRequisicao;
  descricao: string;
  arquivoAluno?: string; // Ex: atestado enviado pelo aluno
  respostaSecretaria?: string;
  arquivoSecretaria?: string; // Ex: PDF gerado pela secretaria
}

const MOCK_REQUISICOES: Requisicao[] = [
  {
    id: "REQ-2026-042",
    solicitante: "Carlos Eduardo Mendes",
    matricula: "202602",
    tipo: "Justificativa de Falta",
    dataSolicitacao: "2026-05-18",
    status: "Pendente",
    descricao: "Faltei no dia 17/05 por motivos de saúde. Atestado médico em anexo.",
    arquivoAluno: "atestado_medico_carlos.jpg"
  },
  {
    id: "REQ-2026-088",
    solicitante: "Fernanda Costa Silva",
    matricula: "202603",
    tipo: "Histórico Escolar Parcial",
    dataSolicitacao: "2026-05-21",
    status: "Em Análise",
    descricao: "Solicito o histórico parcial para inscrição em curso de idiomas.",
  },
  {
    id: "REQ-2026-001",
    solicitante: "Ana Beatriz Souza",
    matricula: "202601",
    tipo: "Declaração de Vínculo Escolar",
    dataSolicitacao: "2026-05-10",
    status: "Concluído",
    descricao: "Necessito da declaração para renovação do passe livre estudantil.",
    respostaSecretaria: "Declaração emitida e assinada digitalmente.",
    arquivoSecretaria: "declaracao_vinculo_ana.pdf"
  }
];

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} /> },
  "Em Análise": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <AlertCircle size={16} /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} /> },
};

export default function SecretaryRequests() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>(MOCK_REQUISICOES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState<Requisicao | null>(null);

  const [resposta, setResposta] = useState("");

  const filteredRequisicoes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return requisicoes;
    return requisicoes.filter(r => 
      r.tipo.toLowerCase().includes(term) || 
      r.solicitante.toLowerCase().includes(term) || 
      r.id.toLowerCase().includes(term)
    );
  }, [requisicoes, searchTerm]);

  const handleAtualizarStatus = (novoStatus: "Concluído" | "Negado" | "Em Análise") => {
    if (!selectedReq) return;
    if ((novoStatus === "Negado" || novoStatus === "Concluído") && !resposta.trim()) {
      alert("Por favor, preencha uma resposta para o aluno antes de finalizar o protocolo.");
      return;
    }

    setRequisicoes(prev => prev.map(r => 
      r.id === selectedReq.id ? { ...r, status: novoStatus, respostaSecretaria: resposta } : r
    ));
    setSelectedReq(null);
    setResposta("");
  };

  const abrirModal = (req: Requisicao) => {
    setSelectedReq(req);
    setResposta(req.respostaSecretaria || "");
  };

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
                          <button onClick={() => abrirModal(req)} className={`action-btn inline-flex items-center justify-center ${req.status === 'Pendente' || req.status === 'Em Análise' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}>
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                    <p className="text-sm text-slate-500 mt-1">Solicitado por: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedReq.solicitante}</span></p>
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
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexo do aluno: {selectedReq.arquivoAluno}</span>
                      </div>
                      <button className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"><Download size={14}/> Baixar</button>
                    </div>
                  )}
                </div>

                {/* Área de Resposta da Secretaria */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  {(selectedReq.status === "Pendente" || selectedReq.status === "Em Análise") ? (
                    <div className="space-y-4">
                      {selectedReq.status === "Pendente" && (
                        <button onClick={() => handleAtualizarStatus("Em Análise")} className="mb-2 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                          Marcar como "Em Análise"
                        </button>
                      )}
                      
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resposta ao Aluno *</label>
                        <textarea rows={3} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Digite o retorno que o aluno verá..." className="w-full p-3 mt-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>

                      <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <label className="text-xs font-bold text-blue-800 dark:text-blue-300">Anexar Documento de Retorno (Opcional, Ex: PDF do Histórico)</label>
                        <input type="file" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer" />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => handleAtualizarStatus("Negado")} className="px-5 py-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-bold transition flex items-center gap-2">
                          <XCircle size={18} /> Negar
                        </button>
                        <button onClick={() => handleAtualizarStatus("Concluído")} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2">
                          <Check size={18} /> Concluir e Enviar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-1">Status Final: {selectedReq.status}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2"><span className="font-bold">Sua Resposta:</span> {selectedReq.respostaSecretaria}</p>
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