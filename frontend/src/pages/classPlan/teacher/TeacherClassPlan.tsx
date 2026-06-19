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
  MessageSquare,
  AlertCircle
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

/* TYPES & INTERFACES */
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

/* MAIN COMPONENT */
export default function TeacherClassPlan() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<{id: string, nome: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedRoteiro, setSelectedRoteiro] = useState<Roteiro | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [newTitulo, setNewTitulo] = useState("");
  const [newDisciplina, setNewDisciplina] = useState("");
  const [newTurma, setNewTurma] = useState("");
  const [newData, setNewData] = useState("");
  const [newConteudo, setNewConteudo] = useState("");
  const [newMetodologia, setNewMetodologia] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Busca os roteiros
        const responseRoteiros = await api.get('/roteiros');
        setRoteiros(responseRoteiros.data);

        // Busca as alocações (Turma + Disciplina) do professor no banco
        const responseTurmas = await api.get('/diario/turmas');
        setTurmasDisponiveis(responseTurmas.data);
      } catch (error) { 
        console.error(error); 
      }
    }
    fetchData();
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

  const editingRoteiro = roteiros.find(r => r.id === editingId);

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
                    <Th>Turma / Disciplina</Th>
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
                        <Td>
                          <span className="block text-sm">{roteiro.turma}</span>
                          <span className="block text-xs text-slate-400">{roteiro.disciplina}</span>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.icon} {roteiro.status}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedRoteiro(roteiro)}
                              title="Visualizar"
                              className="p-2 rounded-xl transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Permite editar Rascunhos E Rejeitados */}
                            {(roteiro.status === "Rascunho" || roteiro.status === "Rejeitado") && (
                              <button
                                onClick={() => handleEditRoteiro(roteiro)}
                                title={roteiro.status === "Rejeitado" ? "Corrigir" : "Editar rascunho"}
                                className={roteiro.status === 'Rejeitado'
                                  ? 'p-2 rounded-xl transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                                  : 'p-2 rounded-xl transition-all duration-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/50'}
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

        {/* MODAL EDIÇÃO */}
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Editar Roteiro de Aula" : "Criar Roteiro de Aula"}
                </h2>
                <button onClick={fecharModal} title="Fechar" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={26} />
                </button>
              </div>

              {/* AVISO DE REJEIÇÃO */}
              {editingRoteiro?.status === "Rejeitado" && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 flex gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-sm text-red-800 dark:text-red-400">Motivo da Rejeição (Coordenação):</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">"{editingRoteiro.feedbackCoordenador}"</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">Corrija as informações abaixo e clique em Enviar para nova aprovação.</p>
                  </div>
                </div>
              )}

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
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Data de Aplicação *</label>
                    <input
                      type="date"
                      value={newData}
                      onChange={(e) => setNewData(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Turma e Disciplina (Alocação) *</label>
                  <select
                    value={newTurma && newDisciplina ? `${newTurma} - ${newDisciplina}` : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setNewTurma("");
                        setNewDisciplina("");
                        return;
                      }
                      const [turmaPart, disciplinaPart] = val.split(" - ");
                      setNewTurma(turmaPart?.trim() || "");
                      setNewDisciplina(disciplinaPart?.trim() || "");
                    }}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione sua turma e disciplina...</option>
                    {turmasDisponiveis.map(t => (
                      <option key={t.id} value={t.nome}>{t.nome}</option>
                    ))}
                    {/* Fallback caso seja um roteiro antigo que não bate exatamente com o texto atual */}
                    {newTurma && newDisciplina && !turmasDisponiveis.find(t => t.nome === `${newTurma} - ${newDisciplina}`) && (
                      <option value={`${newTurma} - ${newDisciplina}`}>{newTurma} - {newDisciplina}</option>
                    )}
                  </select>
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
                    {editingId ? "Guardar Rascunho" : "Salvar como Rascunho"}
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
                <button onClick={() => setSelectedRoteiro(null)} title="Fechar" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={26} />
                </button>
              </div>

              {selectedRoteiro.feedbackCoordenador && (
                <div className={`mb-6 p-4 rounded-xl border flex gap-3 ${selectedRoteiro.status === 'Rejeitado' ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700' : 'border-slate-200 bg-slate-50 dark:bg-slate-800/20 dark:border-slate-700'}`}>
                  <MessageSquare className={`${selectedRoteiro.status === 'Rejeitado' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'} flex-shrink-0 mt-0.5`} size={20} />
                  <div>
                    <h4 className={`font-bold text-sm ${selectedRoteiro.status === 'Rejeitado' ? 'text-red-800 dark:text-red-400' : ''}`}>Feedback da Coordenação</h4>
                    <p className={`text-sm mt-1 italic ${selectedRoteiro.status === 'Rejeitado' ? 'text-red-700 dark:text-red-300' : ''}`}>"{selectedRoteiro.feedbackCoordenador}"</p>
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
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Turma / Data</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.turma} - {formatarData(selectedRoteiro.dataAplicacao)}</p>
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
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

/* COMPONENTES AUXILIARES */
function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-sm font-bold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>;
}