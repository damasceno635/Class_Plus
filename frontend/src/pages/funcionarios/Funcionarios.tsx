import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, FileText, Search } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  contrato: string;
  status: "Ativo" | "Inativo";
}

const MOCK_FUNCIONARIOS: Funcionario[] = [
  { id: "1", nome: "Maria Silva", cargo: "Professor(a)", contrato: "Indeterminado", status: "Ativo" },
  { id: "2", nome: "João Souza", cargo: "Coordenador", contrato: "Determinado", status: "Inativo" },
];

const statusColorMap: Record<string, string> = {
  Ativo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inativo: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(MOCK_FUNCIONARIOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<Funcionario | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredFuncionarios = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return funcionarios;
    return funcionarios.filter((f) => f.nome.toLowerCase().includes(term));
  }, [funcionarios, searchTerm]);

  const handleDelete = () => {
    if (!funcionarioParaExcluir) return;
    setFuncionarios((prev) => prev.filter((f) => f.id !== funcionarioParaExcluir.id));
    setFeedback({
      type: "success",
      message: `Funcionário ${funcionarioParaExcluir.nome} removido com sucesso.`,
    });
    setFuncionarioParaExcluir(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Funcionários
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Gestão e controle de colaboradores
              </p>
            </div>
            <Link
              to="/funcionarios/novo"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all w-fit"
            >
              <Plus size={18} />
              Novo Funcionário
            </Link>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Busca */}
          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <Th>Nome</Th>
                    <Th>Cargo</Th>
                    <Th>Contrato</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuncionarios.map((funcionario) => (
                    <tr
                      key={funcionario.id}
                      className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Td className="font-medium text-slate-800 dark:text-white">
                        {funcionario.nome}
                      </Td>
                      <Td>{funcionario.cargo}</Td>
                      <Td>{funcionario.contrato}</Td>
                      <Td>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            statusColorMap[funcionario.status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {funcionario.status}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/funcionarios/visualizar/${funcionario.id}`}
                            aria-label={`Visualizar ${funcionario.nome}`}
                            title="Visualizar"
                            className="action-btn bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/funcionarios/editar/${funcionario.id}`}
                            aria-label={`Editar ${funcionario.nome}`}
                            title="Editar"
                            className="action-btn bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => setFuncionarioParaExcluir(funcionario)}
                            aria-label={`Excluir ${funcionario.nome}`}
                            title="Excluir"
                            className="action-btn bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            aria-label={`Gerar ficha de ${funcionario.nome}`}
                            title="Gerar PDF"
                            className="action-btn bg-green-600 hover:bg-green-700"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFuncionarios.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  Nenhum funcionário encontrado.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal de exclusão */}
        {funcionarioParaExcluir && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h2
                id="modal-title"
                className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4"
              >
                Confirmar exclusão
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Deseja realmente excluir o funcionário{" "}
                <strong className="text-slate-800 dark:text-white">
                  {funcionarioParaExcluir.nome}
                </strong>
                ?<br />
                Esta ação não poderá ser desfeita.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setFuncionarioParaExcluir(null)}
                  autoFocus
                  className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Excluir
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

/* Componentes auxiliares (mesmos do Alunos.tsx) */
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}
    >
      {children}
    </td>
  );
}