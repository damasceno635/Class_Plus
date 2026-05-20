import { useState } from "react";
import {
  Plus,
  Eye,
  Check,
  X,
  Search,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

interface Requisicao {
  id: number;
  titulo: string;
  solicitante: string;
  tipo: string;
  data: string;
  status: "Pendente" | "Aprovado" | "Rejeitado";
  descricao: string;
}

const requisicoesMock: Requisicao[] = [
  {
    id: 1,
    titulo: "Declaração Escolar",
    solicitante: "João Silva",
    tipo: "Documento",
    data: "15/05/2026",
    status: "Pendente",
    descricao: "Solicitação de declaração de matrícula.",
  },
  {
    id: 2,
    titulo: "Agendamento com Coordenação",
    solicitante: "Maria Santos",
    tipo: "Agendamento",
    data: "14/05/2026",
    status: "Aprovado",
    descricao: "Reunião para tratar desempenho acadêmico.",
  },
];

export default function Requisicoes() {
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

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Requisições
              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Solicitações administrativas e pedagógicas
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
              "
            >
              <Plus size={18} />
              Nova Solicitação
            </button>
          </div>

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
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Rejeitado">Rejeitado</option>
              </select>
            </div>
          </section>

          {/* LISTA */}
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtradas.map((req) => (
              <div
                key={req.id}
                className="
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-6
                  shadow-sm
                  border
                  border-slate-200
                  dark:border-slate-800
                "
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {req.titulo}
                </h2>

                <div className="space-y-2 text-slate-500 dark:text-slate-400 mb-6">
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {req.solicitante}
                  </p>

                  <p>
                    <strong>Tipo:</strong> {req.tipo}
                  </p>

                  <p>
                    <strong>Data:</strong> {req.data}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-medium
                        ${
                          req.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "Aprovado"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {req.status}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelecionada(req)
                    }
                    className="action-btn bg-blue-600"
                  >
                    <Eye size={16} />
                  </button>

                  <button className="action-btn bg-green-600">
                    <Check size={16} />
                  </button>

                  <button className="action-btn bg-red-600">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* MODAL */}
          {selecionada && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className="
                  w-full
                  max-w-xl
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-8
                  border
                  border-slate-200
                  dark:border-slate-800
                "
              >
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                  Detalhes da Requisição
                </h2>

                <div className="space-y-4 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Título:</strong>{" "}
                    {selecionada.titulo}
                  </p>

                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {selecionada.solicitante}
                  </p>

                  <p>
                    <strong>Tipo:</strong>{" "}
                    {selecionada.tipo}
                  </p>

                  <p>
                    <strong>Data:</strong>{" "}
                    {selecionada.data}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {selecionada.status}
                  </p>

                  <p>
                    <strong>Descrição:</strong>{" "}
                    {selecionada.descricao}
                  </p>
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