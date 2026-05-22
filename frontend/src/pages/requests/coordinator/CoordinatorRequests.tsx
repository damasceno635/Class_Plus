import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Search, CheckCircle2, XCircle, Clock, Eye, X, ThumbsUp, ThumbsDown } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

type StatusRequisicao = "Pendente" | "Aprovado" | "Concluído" | "Negado";

interface RequisicaoInfra {
  id: string;
  professor: string;
  categoria: string;
  dataAlvo: string;
  status: StatusRequisicao;
  detalhes: string;
  observacao?: string;
}

const MOCK_REQUISICOES: RequisicaoInfra[] = [
  { id: "OP-2026-112", professor: "Maria Silva (Matemática)", categoria: "Reprografia (Impressões)", dataAlvo: "2026-05-25", status: "Pendente", detalhes: "Impressão de 35 cópias da Prova Bimestral de Matemática para o 8º Ano A." },
  { id: "OP-2026-095", professor: "Carlos Ferreira (Física)", categoria: "Reserva de Laboratório", dataAlvo: "2026-05-18", status: "Concluído", detalhes: "Reserva do Laboratório de Ciências para aula prática no 3º e 4º horários.", observacao: "Chave liberada." },
];

const statusStylesMap: Record<StatusRequisicao, { bg: string; text: string; icon: ReactNode }> = {
  "Concluído": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={16} /> },
  "Aprovado": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <CheckCircle2 size={16} /> },
  "Pendente": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={16} /> },
  "Negado": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={16} /> },
};

export default function CoordinatorRequests() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoInfra[]>(MOCK_REQUISICOES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState<RequisicaoInfra | null>(null);
  const [observacao, setObservacao] = useState("");

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(r => r.professor.toLowerCase().includes(searchTerm.toLowerCase()) || r.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [requisicoes, searchTerm]);

  const handleAprovarNegar = (status: "Aprovado" | "Negado") => {
    if (!selectedReq) return;
    setRequisicoes(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status, observacao } : r));
    setSelectedReq(null);
    setObservacao("");
  };

  const abrirModal = (req: RequisicaoInfra) => {
    setSelectedReq(req);
    setObservacao(req.observacao || "");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Aprovação Operacional</h1>
            <p className="text-slate-500 dark:text-slate-400">Gerenciamento de recursos, laboratórios e impressões solicitados pelos professores.</p>
          </div>

          <div className="mb-6 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar professor ou categoria..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Professor</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data Alvo</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisicoes.map((req) => {
                    const style = statusStylesMap[req.status];
                    return (
                      <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{req.professor}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{req.categoria}</td>
                        <td className="px-6 py-4 text-slate-500">{req.dataAlvo.split("-").reverse().join("/")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>{style.icon} {req.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => abrirModal(req)} className={`action-btn inline-flex items-center justify-center ${req.status === 'Pendente' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}><Eye size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedReq && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedReq.categoria}</h2>
                    <p className="text-sm text-slate-500 mt-1">Solicitado por: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedReq.professor}</span></p>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-2">Detalhes da Necessidade</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReq.detalhes}</p>
                </div>

                {selectedReq.status === "Pendente" ? (
                  <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observação para o Professor (Opcional)</label>
                      <textarea rows={3} value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full p-3 mt-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleAprovarNegar("Negado")} className="px-5 py-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold transition flex items-center gap-2"><ThumbsDown size={18} /> Negar</button>
                      <button onClick={() => handleAprovarNegar("Aprovado")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"><ThumbsUp size={18} /> Aprovar Pedido</button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <p className="text-sm font-bold text-slate-500 mb-1">Feedback fornecido:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReq.observacao || "Sem observações adicionais."}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}