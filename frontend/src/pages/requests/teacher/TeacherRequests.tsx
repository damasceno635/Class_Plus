import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  X,
  AlertCircle,
  Printer,
  MonitorPlay,
  FlaskConical
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

type StatusRequisicao = "Pendente" | "Aprovado" | "Concluído" | "Negado";

interface RequisicaoProfessor {
  id: string;
  categoria: string;
  dataSolicitacao: string;
  dataAlvo: string;
  status: StatusRequisicao;
  detalhes: string;
  observacaoCoordenacao?: string;
}

const MOCK_REQUISICOES: RequisicaoProfessor[] = [
  {
    id: "OP-2026-112",
    categoria: "Reprografia (Impressões)",
    dataSolicitacao: "2026-05-20",
    dataAlvo: "2026-05-25",
    status: "Pendente",
    detalhes: "Impressão de 35 cópias da Prova Bimestral de Matemática para o 8º Ano A. Arquivo enviado via sistema interno.",
  },
  {
    id: "OP-2026-095",
    categoria: "Reserva de Laboratório",
    dataSolicitacao: "2026-05-15",
    dataAlvo: "2026-05-18",
    status: "Concluído",
    detalhes: "Reserva do Laboratório de Ciências para aula prática de Óptica Geométrica (Física - 2º Ano B) no 3º e 4º horários.",
    observacaoCoordenacao: "Reserva confirmada. Chave disponível na portaria."
  },
  {
    id: "OP-2026-080",
    categoria: "Equipamento Audiovisual",
    dataSolicitacao: "2026-05-10",
    dataAlvo: "2026-05-12",
    status: "Negado",
    detalhes: "Solicito projetor multimídia para a sala 12 no 1º horário.",
    observacaoCoordenacao: "Todos os projetores já estão reservados para este horário. Sugerimos utilizar a Sala Multimídia 2 que possui projetor fixo."
  }
];

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" /> },
  "Aprovado": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} className="text-red-600 dark:text-red-400" /> },
};

const categoriaIcons: Record<string, ReactNode> = {
  "Reprografia (Impressões)": <Printer size={18} className="text-slate-500" />,
  "Reserva de Laboratório": <FlaskConical size={18} className="text-slate-500" />,
  "Equipamento Audiovisual": <MonitorPlay size={18} className="text-slate-500" />
};

export default function TeacherRequests() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoProfessor[]>(MOCK_REQUISICOES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequisicaoProfessor | null>(null);

  // Form states
  const [formCategoria, setFormCategoria] = useState("Reprografia (Impressões)");
  const [formDataAlvo, setFormDataAlvo] = useState("");
  const [formDetalhes, setFormDetalhes] = useState("");

  const filteredRequisicoes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return requisicoes;
    return requisicoes.filter(r => r.categoria.toLowerCase().includes(term) || r.id.toLowerCase().includes(term));
  }, [requisicoes, searchTerm]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoria || !formDataAlvo || !formDetalhes) return;

    const novo: RequisicaoProfessor = {
      id: `OP-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      categoria: formCategoria,
      detalhes: formDetalhes,
      dataAlvo: formDataAlvo,
      dataSolicitacao: new Date().toISOString().split("T")[0],
      status: "Pendente"
    };

    setRequisicoes([novo, ...requisicoes]);
    setIsNewModalOpen(false);
    setFormDataAlvo("");
    setFormDetalhes("");
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Suporte Operacional</h1>
              <p className="text-slate-500 dark:text-slate-400">Solicitação de materiais, impressões e agendamento de espaços.</p>
            </div>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all shadow-md w-fit cursor-pointer"
            >
              <Plus size={18} /> Nova Solicitação
            </button>
          </div>

          <div className="mb-6 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID ou categoria..."
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
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data Necessária</th>
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {categoriaIcons[req.categoria] || <AlertCircle size={18} className="text-slate-500" />}
                            <span className="font-bold text-slate-800 dark:text-white">{req.categoria}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                          {formatarData(req.dataAlvo)}
                        </td>
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

          {/* Modal Nova Solicitação */}
          {isNewModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Novo Pedido Operacional</h2>
                  <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoria *</label>
                      <select required value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="Reprografia (Impressões)">Reprografia (Impressões)</option>
                        <option value="Reserva de Laboratório">Reserva de Laboratório</option>
                        <option value="Equipamento Audiovisual">Equipamento Audiovisual</option>
                        <option value="Manutenção em Sala">Manutenção em Sala</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Para quando? *</label>
                      <input type="date" required value={formDataAlvo} onChange={(e) => setFormDataAlvo(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Detalhamento (Horários, Quantidade, etc) *</label>
                    <textarea required rows={4} value={formDetalhes} onChange={(e) => setFormDetalhes(e.target.value)} placeholder="Especifique os detalhes do pedido..." className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
                  </div>
                  
                  {formCategoria === "Reprografia (Impressões)" && (
                    <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                      <label className="text-xs font-bold text-blue-800 dark:text-blue-300">Anexar Arquivo para Impressão</label>
                      <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition">Cancelar</button>
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md">Registrar Pedido</button>
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
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {categoriaIcons[selectedReq.categoria]} {selectedReq.categoria}
                    </h2>
                    <p className="text-sm font-mono text-slate-400 mt-1">ID: {selectedReq.id}</p>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold mb-2">
                    <Clock size={16} /> Data Alvo / Limite: <span className="text-slate-800 dark:text-white">{formatarData(selectedReq.dataAlvo)}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Detalhes do Pedido</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReq.detalhes}</p>
                  </div>

                  {selectedReq.observacaoCoordenacao && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                      <p className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Retorno / Observação da Gestão</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">{selectedReq.observacaoCoordenacao}</p>
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