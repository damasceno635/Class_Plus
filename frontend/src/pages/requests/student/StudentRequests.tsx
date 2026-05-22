import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Paperclip,
  Eye,
  X,
  AlertCircle
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

type StatusRequisicao = "Pendente" | "Em Análise" | "Concluído" | "Negado";

interface RequisicaoAluno {
  id: string;
  tipo: string;
  dataSolicitacao: string;
  status: StatusRequisicao;
  descricao: string;
  respostaSecretaria?: string;
  arquivoAnexo?: string;
}

const MOCK_REQUISICOES: RequisicaoAluno[] = [
  {
    id: "REQ-2026-001",
    tipo: "Declaração de Vínculo Escolar",
    dataSolicitacao: "2026-05-10",
    status: "Concluído",
    descricao: "Necessito da declaração para renovação do passe livre estudantil.",
    respostaSecretaria: "Declaração emitida e assinada digitalmente. O documento encontra-se em anexo.",
    arquivoAnexo: "declaracao_vinculo_assinada.pdf"
  },
  {
    id: "REQ-2026-042",
    tipo: "Justificativa de Falta",
    dataSolicitacao: "2026-05-18",
    status: "Em Análise",
    descricao: "Faltei no dia 17/05 por motivos de saúde. Atestado médico em anexo.",
    arquivoAnexo: "atestado_medico.jpg"
  },
  {
    id: "REQ-2026-088",
    tipo: "Histórico Escolar Parcial",
    dataSolicitacao: "2026-05-21",
    status: "Pendente",
    descricao: "Solicito o histórico parcial para inscrição em curso de idiomas.",
  }
];

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" /> },
  "Em Análise": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} className="text-red-600 dark:text-red-400" /> },
};

export default function StudentRequests() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoAluno[]>(MOCK_REQUISICOES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequisicaoAluno | null>(null);

  // Form states
  const [formTipo, setFormTipo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");

  const filteredRequisicoes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return requisicoes;
    return requisicoes.filter(r => r.tipo.toLowerCase().includes(term) || r.id.toLowerCase().includes(term));
  }, [requisicoes, searchTerm]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTipo || !formDescricao) return;

    const novo: RequisicaoAluno = {
      id: `REQ-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      tipo: formTipo,
      descricao: formDescricao,
      dataSolicitacao: new Date().toISOString().split("T")[0],
      status: "Pendente"
    };

    setRequisicoes([novo, ...requisicoes]);
    setIsNewModalOpen(false);
    setFormTipo("");
    setFormDescricao("");
  };

  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

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
            <input
              type="text"
              placeholder="Buscar por protocolo ou tipo..."
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
                          <button onClick={() => setSelectedReq(req)} className="action-btn bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center cursor-pointer" title="Ver Detalhes">
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
                      <option value="2ª Via de Carteirinha">2ª Via de Carteirinha</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo / Descrição *</label>
                    <textarea required rows={4} value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} placeholder="Detalhe sua solicitação..." className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anexo (Opcional, Ex: Atestado)</label>
                    <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer" />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md">Enviar Pedido</button>
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

                  {selectedReq.arquivoAnexo && (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                          <Paperclip size={18} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedReq.arquivoAnexo}</span>
                      </div>
                      <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Baixar</button>
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