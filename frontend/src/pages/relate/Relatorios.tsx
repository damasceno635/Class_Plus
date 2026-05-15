import { useState } from "react";
import { Search, FileText, Filter } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const relatoriosMock = [
  {
    id: 1,
    titulo: "Relatório de Alunos",
    categoria: "Acadêmico",
    data: "15/05/2026",
  },
  {
    id: 2,
    titulo: "Relatório Financeiro",
    categoria: "Financeiro",
    data: "14/05/2026",
  },
  {
    id: 3,
    titulo: "Relatório de Funcionários",
    categoria: "Administrativo",
    data: "12/05/2026",
  },
  {
    id: 4,
    titulo: "Relatório de Turmas",
    categoria: "Acadêmico",
    data: "10/05/2026",
  },
];

export default function Relatorios() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");

  const filtrados = relatoriosMock.filter((relatorio) => {
    const matchBusca = relatorio.titulo
      .toLowerCase()
      .includes(busca.toLowerCase());

    const matchCategoria = categoria
      ? relatorio.categoria === categoria
      : true;

    return matchBusca && matchCategoria;
  });

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Relatórios
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Gerenciamento e exportação de relatórios do sistema
            </p>
          </div>

          {/* FILTROS */}
          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-3xl
              p-6
              shadow-sm
              border
              border-slate-200
              dark:border-slate-800
              mb-8
            "
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Buscar relatório..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-4
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                className="
                  w-full
                  p-4
                  rounded-2xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  dark:text-white
                  outline-none
                "
              >
                <option value="">Todas categorias</option>
                <option value="Acadêmico">Acadêmico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Administrativo">
                  Administrativo
                </option>
              </select>

              <button
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  rounded-2xl
                  px-6
                  py-4
                  font-semibold
                "
              >
                <Filter size={18} />
                Aplicar Filtros
              </button>
            </div>
          </section>

          {/* LISTAGEM */}
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrados.map((relatorio) => (
              <div
                key={relatorio.id}
                className="
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-6
                  shadow-sm
                  border
                  border-slate-200
                  dark:border-slate-800
                  hover:shadow-md
                  transition-all
                "
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {relatorio.titulo}
                </h2>

                <div className="space-y-2 text-slate-500 dark:text-slate-400 mb-6">
                  <p>
                    <strong>Categoria:</strong>{" "}
                    {relatorio.categoria}
                  </p>

                  <p>
                    <strong>Data:</strong>{" "}
                    {relatorio.data}
                  </p>
                </div>

                <button
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                  "
                >
                  <FileText size={18} />
                  Gerar PDF
                </button>
              </div>
            ))}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}