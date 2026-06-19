import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { 
  Eye, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown 
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

type StatusRoteiro = "Pendente" | "Aprovado" | "Rejeitado";

interface Roteiro {
  id: string;
  professor: string;
  titulo: string;
  disciplina: string;
  turma: string;
  dataAplicacao: string;
  status: StatusRoteiro;
  conteudo: string;
  metodologia: string;
  feedbackCoordenador?: string;
}

const statusStylesMap: Record<StatusRoteiro, { bg: string; text: string; icon: ReactNode }> = {
  Aprovado: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
  },
  Pendente: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" />
  },
  Rejeitado: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle size={16} className="text-red-600 dark:text-red-400" />
  }
};

export default function CoordinatorClassPlan() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoteiro, setSelectedRoteiro] = useState<Roteiro | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    async function fetchRoteiros() {
      try {
        const response = await api.get('/roteiros');
        setRoteiros(response.data);
      } catch (error) { console.error(error); }
    }
    fetchRoteiros();
  }, []);

  const filteredRoteiros = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return roteiros;
    return roteiros.filter(
      (r) =>
        r.professor.toLowerCase().includes(term) ||
        r.titulo.toLowerCase().includes(term) ||
        r.turma.toLowerCase().includes(term)
    );
  }, [roteiros, searchTerm]);

  const handleAvaliar = async (status: "Aprovado" | "Rejeitado") => {
    if (status === "Rejeitado" && !feedbackText.trim()) {
      alert("Para rejeitar um roteiro, é obrigatório fornecer um feedback.");
      return;
    }

    try {
      await api.put(`/roteiros/${selectedRoteiro?.id}`, {
        status,
        feedbackCoordenador: feedbackText
      });

      setRoteiros((prev) => 
        prev.map((r) => 
          r.id === selectedRoteiro?.id ? { ...r, status, feedbackCoordenador: feedbackText } : r
        )
      );
      setSelectedRoteiro(null);
      setFeedbackText("");
    } catch (error) {
      alert("Erro ao enviar avaliação.");
    }
  };

  const abrirModal = (roteiro: Roteiro) => {
    setSelectedRoteiro(roteiro);
    setFeedbackText(roteiro.feedbackCoordenador || "");
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Análise de Roteiros</h1>
            <p className="text-slate-500 dark:text-slate-400">Avalie os planos de aula enviados pelos professores.</p>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por professor, título ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <Th>Professor</Th>
                    <Th>Data</Th>
                    <Th>Título do Plano</Th>
                    <Th>Turma</Th>
                    <Th>Status</Th>
                    <Th className="text-center">Ação</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoteiros.map((roteiro) => {
                    const style = statusStylesMap[roteiro.status];
                    return (
                      <tr key={roteiro.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <Td className="font-semibold text-slate-800 dark:text-white">{roteiro.professor}</Td>
                        <Td className="text-slate-600 dark:text-slate-400">{formatarData(roteiro.dataAplicacao)}</Td>
                        <Td className="truncate max-w-xs">{roteiro.titulo}</Td>
                        <Td>{roteiro.turma}</Td>
                        <Td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.icon} {roteiro.status}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => abrirModal(roteiro)}
                              title={roteiro.status === "Pendente" ? "Avaliar Roteiro" : "Visualizar"}
                              className={`p-2 rounded-xl transition-all duration-200 ${
                                roteiro.status === "Pendente" 
                                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50" 
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"}`}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {selectedRoteiro && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{selectedRoteiro.titulo}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Enviado por: <span className="font-semibold">{selectedRoteiro.professor}</span></p>
                </div>
                <button onClick={() => setSelectedRoteiro(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-300 mb-6">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Disciplina</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.disciplina}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Turma / Data</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.turma} - {formatarData(selectedRoteiro.dataAplicacao)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Conteúdo</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.conteudo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Metodologia</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.metodologia}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                {selectedRoteiro.status === "Pendente" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-2">
                        <MessageSquare size={18} className="text-blue-500"/> Deixe um feedback para o professor:
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Escreva orientações, elogios ou motivos de rejeição..."
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => handleAvaliar("Rejeitado")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 font-bold transition">
                        <ThumbsDown size={18} /> Rejeitar Roteiro
                      </button>
                      <button onClick={() => handleAvaliar("Aprovado")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold transition">
                        <ThumbsUp size={18} /> Aprovar Roteiro
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border ${selectedRoteiro.status === 'Aprovado' ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'}`}>
                    <h4 className={`font-bold text-sm ${selectedRoteiro.status === 'Aprovado' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                      Seu Feedback ({selectedRoteiro.status})
                    </h4>
                    <p className={`text-sm mt-1 ${selectedRoteiro.status === 'Aprovado' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {selectedRoteiro.feedbackCoordenador || "Nenhum feedback registrado."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-sm font-bold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>;
}
