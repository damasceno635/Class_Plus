import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Plus,
  Eye,
  Send,
  FileText,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  X,
  MessageSquare
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

/* ===================================================== */
/* TYPES & INTERFACES                                    */
/* ===================================================== */

type StatusRoteiro = "Rascunho" | "Pendente" | "Aprovado" | "Rejeitado";

interface Roteiro {
  id: string;
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
  },
  Rascunho: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-400",
    icon: <FileEdit size={16} className="text-slate-600 dark:text-slate-400" />
  }
};

/* ===================================================== */
/* MAIN COMPONENT                                        */
/* ===================================================== */

export default function TeacherClassPlan() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoteiro, setSelectedRoteiro] = useState<Roteiro | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitulo, setNewTitulo] = useState("");
  const [newDisciplina, setNewDisciplina] = useState("");
  const [newTurma, setNewTurma] = useState("");
  const [newData, setNewData] = useState("");
  const [newConteudo, setNewConteudo] = useState("");
  const [newMetodologia, setNewMetodologia] = useState("");

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
        r.titulo.toLowerCase().includes(term) ||
        r.disciplina.toLowerCase().includes(term) ||
        r.turma.toLowerCase().includes(term)
    );
  }, [roteiros, searchTerm]);

  const limparFormulario = () => {
    setNewTitulo("");
    setNewDisciplina("");
    setNewTurma("");
    setNewData("");
    setNewConteudo("");
    setNewMetodologia("");
  };

  const fecharModal = () => {
    setIsNewModalOpen(false);
    setEditingId(null);
    limparFormulario();
  };

  const handleEditRoteiro = (roteiro: Roteiro) => {
    setEditingId(roteiro.id);
    setNewTitulo(roteiro.titulo);
    setNewDisciplina(roteiro.disciplina);
    setNewTurma(roteiro.turma);
    setNewData(roteiro.dataAplicacao);
    setNewConteudo(roteiro.conteudo);
    setNewMetodologia(roteiro.metodologia);
    setIsNewModalOpen(true);
  };

  const handleCreateRoteiro = async (statusAlvo: "Pendente" | "Rascunho") => {
    if (!newTitulo || !newDisciplina || !newTurma || !newData) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/roteiros/${editingId}`, {
          titulo: newTitulo,
          disciplina: newDisciplina,
          turma: newTurma,
          dataAplicacao: newData,
          conteudo: newConteudo,
          metodologia: newMetodologia,
          status: statusAlvo
        });
        setRoteiros((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...res.data } : r)));
      } else {
        const res = await api.post('/roteiros', {
          titulo: newTitulo,
          disciplina: newDisciplina,
          turma: newTurma,
          dataAplicacao: newData,
          conteudo: newConteudo,
          metodologia: newMetodologia,
          status: statusAlvo
        });
        setRoteiros((prev) => [res.data, ...prev]);
      }
      fecharModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o roteiro.");
    }
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Roteiros de Aula</h1>
              <p className="text-slate-500 dark:text-slate-400">Planejamento pedagógico e fluxo de aprovações</p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                limparFormulario();
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all w-fit cursor-pointer"
            >
              <Plus size={18} /> Novo Roteiro
            </button>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, disciplina ou turma..."
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
                    <Th>Data de Aplicação</Th>
                    <Th>Título do Plano</Th>
                    <Th>Disciplina</Th>
                    <Th>Turma</Th>
                    <Th>Status</Th>
                    <Th className="text-center">Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoteiros.map((roteiro) => {
                    const style = statusStylesMap[roteiro.status];
                    return (
                      <tr key={roteiro.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <Td className="font-medium text-slate-600 dark:text-slate-400">{formatarData(roteiro.dataAplicacao)}</Td>
                        <Td className="font-semibold text-slate-800 dark:text-white max-w-xs truncate">{roteiro.titulo}</Td>
                        <Td>{roteiro.disciplina}</Td>
                        <Td>{roteiro.turma}</Td>
                        <Td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.icon} {roteiro.status}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedRoteiro(roteiro)}
                              title="Visualizar detalhes"
                              className="action-btn bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                            >
                              <Eye size={16} />
                            </button>
                            {roteiro.status === "Rascunho" && (
                              <button
                                onClick={() => handleEditRoteiro(roteiro)}
                                title="Editar rascunho"
                                className="action-btn bg-amber-500 hover:bg-amber-600 flex items-center justify-center"
                              >
                                <FileEdit size={16} />
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRoteiros.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  Nenhum roteiro encontrado.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* MODAL NOVO / EDIÇÃO */}
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Editar Rascunho" : "Criar Roteiro de Aula"}
                </h2>
                <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Título da Aula *</label>
                    <input
                      type="text"
                      value={newTitulo}
                      onChange={(e) => setNewTitulo(e.target.value)}
                      placeholder="Ex: Frações Equivalentes"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Data *</label>
                    <input
                      type="date"
                      value={newData}
                      onChange={(e) => setNewData(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Disciplina *</label>
                    <input
                      type="text"
                      value={newDisciplina}
                      onChange={(e) => setNewDisciplina(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Turma *</label>
                    <input
                      type="text"
                      value={newTurma}
                      onChange={(e) => setNewTurma(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Conteúdo Programático</label>
                  <textarea
                    rows={4}
                    value={newConteudo}
                    onChange={(e) => setNewConteudo(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Metodologia</label>
                  <textarea
                    rows={4}
                    value={newMetodologia}
                    onChange={(e) => setNewMetodologia(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleCreateRoteiro("Rascunho")}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                  >
                    <FileText size={18} />
                    {editingId ? "Atualizar Rascunho" : "Salvar Rascunho"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateRoteiro("Pendente")}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition shadow-md"
                  >
                    <Send size={18} />
                    {editingId ? "Atualizar e Enviar" : "Enviar para Coordenação"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETALHES */}
        {selectedRoteiro && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${statusStylesMap[selectedRoteiro.status].bg} ${statusStylesMap[selectedRoteiro.status].text}`}>
                    {selectedRoteiro.status}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{selectedRoteiro.titulo}</h2>
                </div>
                <button onClick={() => setSelectedRoteiro(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              {selectedRoteiro.feedbackCoordenador && (
                <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/20 dark:border-slate-700 flex gap-3">
                  <MessageSquare className="text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Feedback da Coordenação</h4>
                    <p className="text-sm mt-1 italic">"{selectedRoteiro.feedbackCoordenador}"</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Disciplina</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.disciplina}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Turma</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.turma}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Conteúdo Programático</p>
                  <p className="text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedRoteiro.conteudo || "Nenhum conteúdo adicionado."}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Metodologia</p>
                  <p className="text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedRoteiro.metodologia || "Nenhuma metodologia especificada."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => setSelectedRoteiro(null)} className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold hover:opacity-90 transition">
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

/* ===================================================== */
/* COMPONENTES AUXILIARES                                */
/* ===================================================== */
function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-sm font-bold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>;
}
