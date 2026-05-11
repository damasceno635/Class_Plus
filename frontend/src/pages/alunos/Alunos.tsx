import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { useNavigate } from "react-router-dom";

export default function Alunos() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Alunos
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Gestão de alunos
              </p>
            </div>

            <button
              onClick={() => navigate("/alunos/novo")}
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                py-3
                rounded-xl
                transition-all
                cursor-pointer
                font-medium
              "
            >
              Novo Aluno
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-800 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 text-slate-700 dark:text-slate-300 font-semibold">
                    Nome
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Matrícula
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Turma
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Status
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-4 text-slate-900 dark:text-white">
                    João Pedro
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    20260001
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    1º Ano A
                  </td>
                  <td>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Matriculado
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                        Ver
                      </button>
                      <button className="text-green-600 dark:text-green-400 hover:underline cursor-pointer font-medium">
                        Editar
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium">
                        Excluir
                      </button>
                      <button className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-medium">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}