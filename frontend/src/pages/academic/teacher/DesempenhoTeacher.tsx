import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Search,
  Save,
  Download,
  Users,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

// Dados mockados – turmas do professor
const turmasDisponiveis = [
  { id: 1, nome: "1º Ano A", turno: "Manhã", disciplina: "Matemática" },
  { id: 2, nome: "1º Ano B", turno: "Manhã", disciplina: "Matemática" },
  { id: 3, nome: "2º Ano A", turno: "Tarde", disciplina: "Matemática" },
];

// Alunos por turma
const alunosPorTurma: Record<number, any[]> = {
  1: [
    {
      id: 1,
      nome: "Ana Beatriz Silva",
      matricula: "2024001",
      notas: {
        p1: 8.5,
        p2: 7.0,
        trabalho: 9.0,
        media: 8.2,
      },
      presente: true,
      obs: "Aluna dedicada",
    },
    {
      id: 2,
      nome: "Bruno Henrique Santos",
      matricula: "2024002",
      notas: {
        p1: 6.0,
        p2: 5.5,
        trabalho: 7.0,
        media: 6.2,
      },
      presente: true,
      obs: "Precisa melhorar",
    },
    {
      id: 3,
      nome: "Carla Mendes Oliveira",
      matricula: "2024003",
      notas: {
        p1: 9.0,
        p2: 8.5,
        trabalho: 9.5,
        media: 9.0,
      },
      presente: true,
      obs: "Excelente",
    },
  ],

  2: [
    {
      id: 4,
      nome: "Diego Ferreira Lima",
      matricula: "2024004",
      notas: {
        p1: 5.0,
        p2: 4.5,
        trabalho: 6.0,
        media: 5.2,
      },
      presente: false,
      obs: "Faltou na prova",
    },
    {
      id: 5,
      nome: "Fernanda Lima Costa",
      matricula: "2024005",
      notas: {
        p1: 7.5,
        p2: 8.0,
        trabalho: 8.0,
        media: 7.8,
      },
      presente: true,
      obs: "Bom rendimento",
    },
  ],

  3: [
    {
      id: 6,
      nome: "Gabriel Souza",
      matricula: "2024006",
      notas: {
        p1: 7.0,
        p2: 7.5,
        trabalho: 8.0,
        media: 7.5,
      },
      presente: true,
      obs: "",
    },
    {
      id: 7,
      nome: "Helena Carvalho",
      matricula: "2024007",
      notas: {
        p1: 9.5,
        p2: 9.0,
        trabalho: 10.0,
        media: 9.5,
      },
      presente: true,
      obs: "Melhor aluna",
    },
  ],
};

export default function DesempenhoTeacher() {
  const [turmaSelecionada, setTurmaSelecionada] = useState<number>(1);
  const [alunos, setAlunos] = useState(alunosPorTurma[1]);
  const [bimestre, setBimestre] = useState("3º Bimestre");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const handleTurmaChange = (turmaId: number) => {
    setTurmaSelecionada(turmaId);
    setAlunos(alunosPorTurma[turmaId] || []);
    setBusca("");
    setFiltroStatus("todos");
  };

  const togglePresenca = (id: number) => {
    setAlunos((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, presente: !a.presente }
          : a
      )
    );
  };

  const updateObs = (id: number, obs: string) => {
    setAlunos((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, obs }
          : a
      )
    );
  };

  const updateNota = (
    id: number,
    campo: string,
    valor: string
  ) => {
    let nota = parseFloat(valor);

    if (isNaN(nota)) nota = 0;

    nota = Math.min(10, Math.max(0, nota));

    setAlunos((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const novasNotas = {
            ...a.notas,
            [campo]: nota,
          };

          const media =
            (novasNotas.p1 +
              novasNotas.p2 +
              novasNotas.trabalho) / 3;

          return {
            ...a,
            notas: {
              ...novasNotas,
              media: Number(media.toFixed(1)),
            },
          };
        }

        return a;
      })
    );
  };

  const handleSave = () => {
    alert("Dados salvos com sucesso!");
    console.log({
      turma: turmaSelecionada,
      bimestre,
      alunos,
    });
  };

  const handleExport = () => {
    alert("Relatório exportado!");
  };

  const alunosFiltrados = alunos.filter((a) => {
    const matchBusca = a.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos"
        ? true
        : filtroStatus === "presente"
        ? a.presente
        : !a.presente;

    return matchBusca && matchStatus;
  });

  const totalAlunos = alunos.length;

  const presentes = alunos.filter(
    (a) => a.presente
  ).length;

  const mediaTurma = (
    alunos.reduce(
      (acc, a) => acc + a.notas.media,
      0
    ) / totalAlunos || 0
  ).toFixed(1);

  const aprovados = alunos.filter(
    (a) => a.notas.media >= 7
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">

          {/* Cabeçalho */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Desempenho Acadêmico
              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gerencie presenças, notas e observações
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                <Download size={18} />
                Exportar
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Total Alunos
                </span>

                <Users className="text-blue-500" />
              </div>

              <p className="text-2xl font-bold mt-2">
                {totalAlunos}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Presentes
                </span>

                <CheckCircle2 className="text-green-500" />
              </div>

              <p className="text-2xl font-bold mt-2">
                {presentes}
              </p>

              <p className="text-xs text-slate-400">
                {(
                  (presentes / totalAlunos) *
                  100
                ).toFixed(0)}
                % frequência
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Média Turma
                </span>

                <TrendingUp className="text-blue-500" />
              </div>

              <p className="text-2xl font-bold mt-2">
                {mediaTurma}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Aprovados
                </span>

                <Star className="text-yellow-500" />
              </div>

              <p className="text-2xl font-bold mt-2">
                {aprovados}
              </p>

              <p className="text-xs text-slate-400">
                {(
                  (aprovados / totalAlunos) *
                  100
                ).toFixed(0)}
                % aprovação
              </p>
            </div>
          </div>

          {/* Filtros */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border mb-6">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div>
                <label className="block text-sm mb-1">
                  Turma
                </label>

                <select
                  value={turmaSelecionada}
                  onChange={(e) =>
                    handleTurmaChange(
                      Number(e.target.value)
                    )
                  }
                  className="w-full p-3 rounded-xl border dark:bg-slate-800"
                >
                  {turmasDisponiveis.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                    >
                      {t.nome} - {t.disciplina}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Bimestre
                </label>

                <select
                  value={bimestre}
                  onChange={(e) =>
                    setBimestre(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border dark:bg-slate-800"
                >
                  <option>1º Bimestre</option>
                  <option>2º Bimestre</option>
                  <option>3º Bimestre</option>
                  <option>4º Bimestre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Buscar aluno
                </label>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Nome..."
                    value={busca}
                    onChange={(e) =>
                      setBusca(e.target.value)
                    }
                    className="w-full pl-10 pr-4 p-3 rounded-xl border dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Filtrar por
                </label>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      setFiltroStatus("todos")
                    }
                    className={`flex-1 p-3 rounded-xl ${
                      filtroStatus === "todos"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    Todos
                  </button>

                  <button
                    onClick={() =>
                      setFiltroStatus("presente")
                    }
                    className={`flex-1 p-3 rounded-xl ${
                      filtroStatus === "presente"
                        ? "bg-green-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    Presentes
                  </button>

                  <button
                    onClick={() =>
                      setFiltroStatus("ausente")
                    }
                    className={`flex-1 p-3 rounded-xl ${
                      filtroStatus === "ausente"
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    Ausentes
                  </button>

                </div>
              </div>
            </div>
          </section>

          {/* Lista de alunos */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border">

            <h2 className="text-xl font-bold mb-4">
              Lista de Alunos
            </h2>

            {alunosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle
                  className="mx-auto text-slate-400 mb-2"
                  size={48}
                />

                <p className="text-slate-500">
                  Nenhum aluno encontrado
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {alunosFiltrados.map((aluno) => (

                  <div
                    key={aluno.id}
                    className="border rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/50"
                  >

                    <div className="p-4 border-b bg-white dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-bold text-blue-600">
                            {aluno.nome.charAt(0)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {aluno.nome}
                          </h3>

                          <p className="text-sm text-slate-500">
                            Matr.: {aluno.matricula}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">

                        <button
                          onClick={() =>
                            togglePresenca(aluno.id)
                          }
                          className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                            aluno.presente
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {aluno.presente ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <XCircle size={18} />
                          )}

                          {aluno.presente
                            ? "Presente"
                            : "Faltou"}
                        </button>

                        <span
                          className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold ${
                            aluno.notas.media >= 7
                              ? "bg-green-100 text-green-700"
                              : aluno.notas.media >= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {aluno.notas.media >= 7
                            ? "Aprovado"
                            : aluno.notas.media >= 5
                            ? "Recuperação"
                            : "Reprovado"}
                        </span>

                      </div>
                    </div>

                    <div className="p-4">

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                        <div>
                          <label className="text-sm">
                            Prova 1
                          </label>

                          <input
                            type="number"
                            step="0.5"
                            value={aluno.notas.p1}
                            onChange={(e) =>
                              updateNota(
                                aluno.id,
                                "p1",
                                e.target.value
                              )
                            }
                            className="w-full p-2 rounded-lg border dark:bg-slate-800"
                            min="0"
                            max="10"
                          />
                        </div>

                        <div>
                          <label className="text-sm">
                            Prova 2
                          </label>

                          <input
                            type="number"
                            step="0.5"
                            value={aluno.notas.p2}
                            onChange={(e) =>
                              updateNota(
                                aluno.id,
                                "p2",
                                e.target.value
                              )
                            }
                            className="w-full p-2 rounded-lg border dark:bg-slate-800"
                            min="0"
                            max="10"
                          />
                        </div>

                        <div>
                          <label className="text-sm">
                            Trabalho
                          </label>

                          <input
                            type="number"
                            step="0.5"
                            value={aluno.notas.trabalho}
                            onChange={(e) =>
                              updateNota(
                                aluno.id,
                                "trabalho",
                                e.target.value
                              )
                            }
                            className="w-full p-2 rounded-lg border dark:bg-slate-800"
                            min="0"
                            max="10"
                          />
                        </div>

                        <div>
                          <label className="text-sm">
                            Média
                          </label>

                          <div className="w-full p-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-center">
                            {aluno.notas.media.toFixed(1)}
                          </div>
                        </div>

                      </div>

                      <textarea
                        value={aluno.obs}
                        onChange={(e) =>
                          updateObs(
                            aluno.id,
                            e.target.value
                          )
                        }
                        placeholder="Observações..."
                        rows={2}
                        className="w-full p-3 rounded-xl border dark:bg-slate-800 resize-none"
                      />

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}