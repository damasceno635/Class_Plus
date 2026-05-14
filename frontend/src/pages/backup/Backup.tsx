import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Backup() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Backup
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gerenciamento de backups do sistema
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-800 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 text-slate-700 dark:text-slate-300 font-semibold">
                    Data
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Responsável
                  </th>
                  <th className="text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Tamanho
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
                    10/05/2026 14:30
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    Admin
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    245 MB
                  </td>
                  <td>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Concluído
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                        Download
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-4 text-slate-900 dark:text-white">
                    09/05/2026 08:00
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    Admin
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    238 MB
                  </td>
                  <td>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                      Em andamento
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                        Download
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}