import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

interface Evento {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
}

const eventosMock: Evento[] = [
  {
    id: 1,
    titulo: "Reunião Pedagógica",
    data: "2026-05-20",
    tipo: "Reunião",
  },
  {
    id: 2,
    titulo: "Prova de Matemática",
    data: "2026-05-22",
    tipo: "Avaliação",
  },
  {
    id: 3,
    titulo: "Feriado Escolar",
    data: "2026-05-25",
    tipo: "Feriado",
  },
];

export default function CalendarioEscolar() {
  const [dataSelecionada, setDataSelecionada] =
    useState(new Date());

  const [eventoSelecionado, setEventoSelecionado] =
    useState<Evento | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Calendário Escolar
              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Gerenciamento de eventos escolares
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
              "
            >
              <Plus size={18} />
              Novo Evento
            </button>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            {/* CALENDÁRIO */}
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
              "
            >
              <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">
                Calendário
              </h2>

              <Calendar
                onChange={(value) =>
                  setDataSelecionada(value as Date)
                }
                value={dataSelecionada}
                className="w-full border-none rounded-2xl"
              />
            </section>

            {/* EVENTOS */}
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
              "
            >
              <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">
                Eventos Cadastrados
              </h2>

              <div className="space-y-4">
                {eventosMock.map((evento) => (
                  <div
                    key={evento.id}
                    className="
                      p-5
                      rounded-2xl
                      bg-slate-50
                      dark:bg-slate-800
                      flex
                      justify-between
                      items-center
                    "
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {evento.titulo}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {evento.data} • {evento.tipo}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-xl bg-blue-600 text-white"
                        onClick={() =>
                          setEventoSelecionado(evento)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button className="p-2 rounded-xl bg-yellow-500 text-white">
                        <Pencil size={16} />
                      </button>

                      <button className="p-2 rounded-xl bg-red-600 text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* MODAL */}
          {eventoSelecionado && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
                  Evento
                </h2>

                <div className="space-y-4 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Título:</strong>{" "}
                    {eventoSelecionado.titulo}
                  </p>

                  <p>
                    <strong>Data:</strong>{" "}
                    {eventoSelecionado.data}
                  </p>

                  <p>
                    <strong>Tipo:</strong>{" "}
                    {eventoSelecionado.tipo}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEventoSelecionado(null)
                  }
                  className="
                    mt-8
                    w-full
                    bg-blue-600
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