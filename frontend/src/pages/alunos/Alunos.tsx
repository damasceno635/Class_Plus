import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Search,
  X,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

type Aluno = {
  id: number;
  matricula: string;
  nome: string;
  status: string;
  nivel: string;
  ano: string;
  serie: string;
  anoLetivo: string;
};

const alunosMock: Aluno[] = [
  {
    id: 1,
    matricula: "20260001",
    nome: "Maria Silva",
    status: "Matriculado",
    nivel: "Ensino Fundamental",
    ano: "8º Ano",
    serie: "A",
    anoLetivo: "2026.1",
  },
  {
    id: 2,
    matricula: "20260002",
    nome: "João Costa",
    status: "Pré-Matriculado",
    nivel: "Ensino Médio",
    ano: "2º Ano",
    serie: "B",
    anoLetivo: "2026.1",
  },
  {
    id: 3,
    matricula: "20260003",
    nome: "Ana Souza",
    status: "Transferido",
    nivel: "Ensino Médio",
    ano: "3º Ano",
    serie: "C",
    anoLetivo: "2026.2",
  },
];

const statusColorMap: Record<string, string> = {
  Matriculado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Pré-Matriculado": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Transferido: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Inativo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>(alunosMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<Aluno | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filteredAlunos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return alunos;
    return alunos.filter(
      (aluno) =>
        aluno.nome.toLowerCase().includes(term) ||
        aluno.matricula.includes(term)
    );
  }, [alunos, searchTerm]);

  const handleDelete = () => {
    if (!alunoParaExcluir) return;
    setAlunos((prev) => prev.filter((a) => a.id !== alunoParaExcluir.id));
    setFeedback({
      type: "success",
      message: `Aluno ${alunoParaExcluir.nome} removido com sucesso.`,
    });
    setAlunoParaExcluir(null);
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
                Alunos
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Gestão acadêmica de estudantes
              </p>
            </div>
            <Link
              to="/alunos/novo"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all w-fit"
            >
              <Plus size={18} />
              Novo Aluno
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
                placeholder="Buscar por nome ou matrícula..."
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
                    <Th>Matrícula</Th>
                    <Th>Nome</Th>
                    <Th>Status</Th>
                    <Th className="hidden md:table-cell">Nível</Th>
                    <Th>Turma</Th>
                    <Th className="hidden lg:table-cell">Ano Letivo</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno) => (
                    <tr
                      key={aluno.id}
                      className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Td>{aluno.matricula}</Td>
                      <Td className="font-medium text-slate-800 dark:text-white">
                        {aluno.nome}
                      </Td>
                      <Td>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            statusColorMap[aluno.status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {aluno.status}
                        </span>
                      </Td>
                      <Td className="hidden md:table-cell">{aluno.nivel}</Td>
                      <Td>{`${aluno.ano} ${aluno.serie}`}</Td>
                      <Td className="hidden lg:table-cell">{aluno.anoLetivo}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/alunos/visualizar/${aluno.id}`}
                            aria-label={`Visualizar ${aluno.nome}`}
                            title="Visualizar"
                            className="action-btn bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/alunos/editar/${aluno.id}`}
                            aria-label={`Editar ${aluno.nome}`}
                            title="Editar"
                            className="action-btn bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => setAlunoParaExcluir(aluno)}
                            aria-label={`Excluir ${aluno.nome}`}
                            title="Excluir"
                            className="action-btn bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            aria-label={`Gerar ficha de ${aluno.nome}`}
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
              {filteredAlunos.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  Nenhum aluno encontrado.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal de exclusão */}
        {alunoParaExcluir && (
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
                Deseja realmente excluir o aluno{" "}
                <strong className="text-slate-800 dark:text-white">
                  {alunoParaExcluir.nome}
                </strong>
                ?<br />
                Esta ação não poderá ser desfeita.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setAlunoParaExcluir(null)}
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

/* Componentes auxiliares */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}
    >
      {children}
    </td>
  );
}