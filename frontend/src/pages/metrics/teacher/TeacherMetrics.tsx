import { useState, useMemo } from "react";
import { 
  Save, 
  Search, 
  Check, 
  X, 
  BookOpen, 
  UserCheck, 
  CalendarDays,
  AlertCircle
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

/* ===================================================== */
/* TYPES & MOCKS                                         */
/* ===================================================== */

interface Student {
  id: string;
  nome: string;
  matricula: string;
}

const MOCK_TURMAS = ["8º Ano A - Matemática", "9º Ano B - Matemática", "1º Ano Médio - Física"];

const MOCK_ALUNOS: Student[] = [
  { id: "1", nome: "Ana Beatriz Souza", matricula: "202601" },
  { id: "2", nome: "Carlos Eduardo Mendes", matricula: "202602" },
  { id: "3", nome: "Fernanda Costa Silva", matricula: "202603" },
  { id: "4", nome: "João Pedro Alves", matricula: "202604" },
  { id: "5", nome: "Mariana Oliveira", matricula: "202605" },
];

type TabType = "frequencia" | "boletim";

export default function TeacherMetrics() {
  const [activeTab, setActiveTab] = useState<TabType>("frequencia");
  const [selectedTurma, setSelectedTurma] = useState(MOCK_TURMAS[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSemestre, setSelectedSemestre] = useState("1º Semestre");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estados para Frequência (Chave = ID do aluno)
  const [frequencias, setFrequencias] = useState<Record<string, { presente: boolean; observacao: string }>>(() => {
    const initialState: Record<string, { presente: boolean; observacao: string }> = {};
    MOCK_ALUNOS.forEach(aluno => {
      initialState[aluno.id] = { presente: true, observacao: "" }; // Por padrão, todos presentes
    });
    return initialState;
  });

  // Estados para Notas (Chave = ID do aluno)
  const [notas, setNotas] = useState<Record<string, { n1: string; n2: string; n3: string; n4: string }>>(() => {
    const initialState: Record<string, { n1: string; n2: string; n3: string; n4: string }> = {};
    MOCK_ALUNOS.forEach(aluno => {
      initialState[aluno.id] = { n1: "", n2: "", n3: "", n4: "" };
    });
    return initialState;
  });

  // Filtragem de Alunos pela busca
  const filteredAlunos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return MOCK_ALUNOS;
    return MOCK_ALUNOS.filter(a => a.nome.toLowerCase().includes(term) || a.matricula.includes(term));
  }, [searchTerm]);

  /* ===================================================== */
  /* HANDLERS                                              */
  /* ===================================================== */

  const handleFrequenciaChange = (id: string, presente: boolean) => {
    setFrequencias(prev => ({ ...prev, [id]: { ...prev[id], presente } }));
  };

  const handleObservacaoChange = (id: string, observacao: string) => {
    setFrequencias(prev => ({ ...prev, [id]: { ...prev[id], observacao } }));
  };

  const handleNotaChange = (id: string, campo: "n1" | "n2" | "n3" | "n4", valor: string) => {
    // Permite apenas números e um ponto/vírgula decimal, limitado a 10
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    if (valor === "" || (regex.test(valor) && parseFloat(valor.replace(',', '.')) <= 10)) {
      setNotas(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
    }
  };

  const calcularMedia = (id: string): string => {
    const n = notas[id];
    const valores = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v.replace(',', '.')) || 0);
    const media = valores.reduce((acc, curr) => acc + curr, 0) / 4;
    return isNaN(media) ? "0.0" : media.toFixed(1);
  };

  const handleSave = () => {
    setFeedback(null);
    // Simulação de salvamento
    setTimeout(() => {
      setFeedback({ type: "success", message: "Dados salvos com sucesso no sistema!" });
      setTimeout(() => setFeedback(null), 3000);
    }, 500);
  };

  /* ===================================================== */
  /* RENDER                                                */
  /* ===================================================== */

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Desempenho Acadêmico
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Lançamento de diário de classe e boletim de notas
              </p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-md"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold ${feedback.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              <Check size={20} />
              {feedback.message}
            </div>
          )}

          {/* Filtros e Controles Globais */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
            
            {/* Navegação por Abas */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab("frequencia")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === "frequencia" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <UserCheck size={18} /> Diário e Frequência
              </button>
              <button
                onClick={() => setActiveTab("boletim")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === "boletim" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <BookOpen size={18} /> Lançamento de Notas
              </button>
            </div>

            {/* Seletores */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-48">
                <select 
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {MOCK_TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {activeTab === "frequencia" ? (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                  <CalendarDays size={18} className="text-slate-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-1.5 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium w-36"
                  />
                </div>
              ) : (
                <div className="flex-1 sm:w-40">
                  <select 
                    value={selectedSemestre}
                    onChange={(e) => setSelectedSemestre(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="1º Semestre">1º Semestre</option>
                    <option value="2º Semestre">2º Semestre</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Busca interna da Tabela */}
          <div className="relative max-w-md mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ===================================================== */}
          {/* TABELA: FREQUÊNCIA E OBSERVAÇÕES                      */}
          {/* ===================================================== */}
          {activeTab === "frequencia" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Aluno</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-40">Frequência</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 w-1/2">Observação da Aula (Opcional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlunos.map((aluno) => {
                      const state = frequencias[aluno.id];
                      return (
                        <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                            <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleFrequenciaChange(aluno.id, true)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${state.presente ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                                title="Presente"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() => handleFrequenciaChange(aluno.id, false)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${!state.presente ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                                title="Falta"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder={!state.presente ? "Ex: Atestado médico entregue..." : "Comportamento, participação, etc..."}
                              value={state.observacao}
                              onChange={(e) => handleObservacaoChange(aluno.id, e.target.value)}
                              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TABELA: BOLETIM DE NOTAS                              */}
          {/* ===================================================== */}
          {activeTab === "boletim" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Aluno</th>
                      <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-28">N1<br/><span className="text-xs font-normal text-slate-500">(Prova)</span></th>
                      <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-28">N2<br/><span className="text-xs font-normal text-slate-500">(Ativ)</span></th>
                      <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-28">N3<br/><span className="text-xs font-normal text-slate-500">(Prova)</span></th>
                      <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-28">N4<br/><span className="text-xs font-normal text-slate-500">(Ativ)</span></th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center w-32 bg-slate-100 dark:bg-slate-800/80">Média Parcial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlunos.map((aluno) => {
                      const state = notas[aluno.id];
                      const mediaFinal = parseFloat(calcularMedia(aluno.id));
                      const estaAbaixo = mediaFinal > 0 && mediaFinal < 6.0;

                      return (
                        <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                            <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={state.n1}
                              onChange={(e) => handleNotaChange(aluno.id, "n1", e.target.value)}
                              placeholder="--"
                              className="w-full text-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={state.n2}
                              onChange={(e) => handleNotaChange(aluno.id, "n2", e.target.value)}
                              placeholder="--"
                              className="w-full text-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={state.n3}
                              onChange={(e) => handleNotaChange(aluno.id, "n3", e.target.value)}
                              placeholder="--"
                              className="w-full text-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={state.n4}
                              onChange={(e) => handleNotaChange(aluno.id, "n4", e.target.value)}
                              placeholder="--"
                              className="w-full text-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            />
                          </td>
                          <td className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-xl font-bold ${mediaFinal === 0 ? "text-slate-400" : estaAbaixo ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                {mediaFinal === 0 ? "-" : mediaFinal}
                              </span>
                              {estaAbaixo && (
                                <span className="text-[10px] flex items-center gap-1 text-red-600 font-semibold mt-1">
                                  <AlertCircle size={10} /> Abaixo da Média
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {filteredAlunos.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 mt-6 bg-white dark:bg-slate-900 rounded-3xl">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              Nenhum aluno encontrado na busca.
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}