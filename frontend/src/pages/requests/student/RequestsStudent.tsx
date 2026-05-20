import { useState } from "react";
import {
  Plus,
  Eye,
  Search,
  Clock3,
  CheckCircle2,
  FileText,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

interface Requisicao {
  id: number;
  titulo: string;
  tipo: string;
  data: string;
  status: "Pendente" | "Em análise" | "Concluído";
  descricao: string;
}

const requisicoesMock: Requisicao[] = [
  {
    id: 1,
    titulo: "Declaração de Matrícula",
    tipo: "Documento",
    data: "15/05/2026",
    status: "Pendente",
    descricao:
      "Solicitação de declaração de matrícula para estágio.",
  },
  {
    id: 2,
    titulo: "2ª Via de Boleto",
    tipo: "Financeiro",
    data: "13/05/2026",
    status: "Concluído",
    descricao:
      "Solicitação da segunda via do boleto da mensalidade.",
  },
  {
    id: 3,
    titulo: "Revisão de Nota",
    tipo: "Acadêmico",
    data: "10/05/2026",
    status: "Em análise",
    descricao:
      "Pedido de revisão da avaliação da disciplina de Matemática.",
  },
];

export default function RequisicoesAluno() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [selecionada, setSelecionada] =
    useState<Requisicao | null>(null);

  const filtradas = requisicoesMock.filter((req) => {
    const matchBusca = req.titulo
      .toLowerCase()
      .includes(busca.toLowerCase());

    const matchStatus = statusFiltro
      ? req.status === statusFiltro
      : true;

    return matchBusca && matchStatus;
  });

  const totalPendentes = requisicoesMock.filter(
    (r) => r.status === "Pendente"
  ).length;

  const totalAnalise = requisicoesMock.filter(
    (r) => r.status === "Em análise"
  ).length;

  const totalConcluidas = requisicoesMock.filter(
    (r) => r.status === "Concluído"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Minhas Requisições
              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Acompanhe solicitações acadêmicas,
                financeiras e administrativas
              </p>
            </div>

            <button
              className="
                flex
                items-center
                gap-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                py-3
                rounded-2xl
                font-semibold
                w-fit
                transition
              "
            >
              <Plus size={18} />
              Nova Requisição
            </button>
          </div>

          {/* CARDS */}
          <section className="grid md:grid-cols-3 gap-6 mb-8">
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-3xl
                p-6
                border
                border-slate-200
                dark:border-slate-800
                shadow-sm
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Pendentes
                  </p>

                  <h2 className="text-3xl font-bold text-yellow-600">
                    {totalPendentes}
                  </h2>
                </div>

                <Clock3
                  size={42}
                  className="text-yellow-500"
                />
              </div>
            </div>

            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-3xl
                p-6
                border
                border-slate-200
                dark:border-slate-800
                shadow-sm
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Em análise
                  </p>

                  <h2 className="text-3xl font-bold text-blue-600">
                    {totalAnalise}
                  </h2>
                </div>

                <FileText
                  size={42}
                  className="text-blue-500"
                />
              </div>
            </div>

            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-3xl
                p-6
                border
                border-slate-200
                dark:border-slate-800
                shadow-sm
              "
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Concluídas
                  </p>

                  <h2 className="text-3xl font-bold text-green-600">
                    {totalConcluidas}
                  </h2>
                </div>

                <CheckCircle2
                  size={42}
                  className="text-green-500"
                />
              </div>
            </div>
          </section>

          {/* FILTROS */}
          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-3xl
              p-6
              border
              border-slate-200
              dark:border-slate-800
              shadow-sm
              mb-8
            "
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <input
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                  placeholder="Buscar requisição..."
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
                  "
                />
              </div>

              <select
                value={statusFiltro}
                onChange={(e) =>
                  setStatusFiltro(e.target.value)
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
                "
              >
                <option value="">Todos status</option>

                <option value="Pendente">
                  Pendente
                </option>

                <option value="Em análise">
                  Em análise
                </option>

                <option value="Concluído">
                  Concluído
                </option>
              </select>
            </div>
          </section>

          {/* LISTAGEM */}
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtradas.map((req) => (
              <div
                key={req.id}
                className="
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-6
                  border
                  border-slate-200
                  dark:border-slate-800
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {req.titulo}
                  </h2>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${
                        req.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status ===
                            "Em análise"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-2 text-slate-500 dark:text-slate-400 mb-6">
                  <p>
                    <strong>Tipo:</strong> {req.tipo}
                  </p>

                  <p>
                    <strong>Data:</strong> {req.data}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelecionada(req)
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    py-3
                    rounded-2xl
                    font-medium
                    transition
                  "
                >
                  <Eye size={18} />
                  Ver Detalhes
                </button>
              </div>
            ))}
          </section>

          {/* MODAL */}
          {selecionada && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className="
                  w-full
                  max-w-2xl
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-8
                  border
                  border-slate-200
                  dark:border-slate-800
                "
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Detalhes da Requisição
                  </h2>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-semibold
                      ${
                        selecionada.status ===
                        "Pendente"
                          ? "bg-yellow-100 text-yellow-700"
                          : selecionada.status ===
                            "Em análise"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {selecionada.status}
                  </span>
                </div>

                <div className="space-y-5 text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">
                      Título
                    </p>

                    <p className="font-medium">
                      {selecionada.titulo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">
                      Tipo
                    </p>

                    <p className="font-medium">
                      {selecionada.tipo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">
                      Data da Solicitação
                    </p>

                    <p className="font-medium">
                      {selecionada.data}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">
                      Descrição
                    </p>

                    <p className="leading-relaxed">
                      {selecionada.descricao}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelecionada(null)
                  }
                  className="
                    mt-8
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    transition
                  "
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}