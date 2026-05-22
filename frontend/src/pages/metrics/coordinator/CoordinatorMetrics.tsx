import { useState, useMemo } from "react";
import { 
  Search, 
  Eye, 
  X, 
  AlertCircle, 
  GraduationCap, 
  TrendingUp, 
  Users,
  CheckCircle,
  //BookOpen
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

interface TurmaMetrics {
  id: string;
  nome: string;
  professor: string;
  disciplina: string;
  mediaGeral: number;
  frequenciaMedia: number;
  alunosEmRisco: number;
}

interface AlunoDetalhe {
  id: string;
  nome: string;
  matricula: string;
  media: number;
  faltas: number;
  status: "Crítico" | "Regular" | "Excelente";
}

const MOCK_TURMAS_METRICS: TurmaMetrics[] = [
  { id: "1", nome: "8º Ano A", professor: "Maria Silva", disciplina: "Matemática", mediaGeral: 7.2, frequenciaMedia: 91, alunosEmRisco: 2 },
  { id: "2", nome: "9º Ano B", professor: "Maria Silva", disciplina: "Matemática", mediaGeral: 5.8, frequenciaMedia: 84, alunosEmRisco: 5 },
  { id: "3", nome: "1º Ano Médio", professor: "Carlos Ferreira", disciplina: "Física", mediaGeral: 8.1, frequenciaMedia: 95, alunosEmRisco: 0 },
  { id: "4", nome: "2º Ano A", professor: "Ana Costa", disciplina: "História", mediaGeral: 8.9, frequenciaMedia: 96, alunosEmRisco: 0 },
];

const MOCK_ALUNOS_TURMA: Record<string, AlunoDetalhe[]> = {
  "1": [
    { id: "101", nome: "Ana Beatriz Souza", matricula: "202601", media: 8.5, faltas: 2, status: "Excelente" },
    { id: "102", nome: "Carlos Eduardo Mendes", matricula: "202602", media: 5.2, faltas: 6, status: "Crítico" },
    { id: "103", nome: "Fernanda Costa Silva", matricula: "202603", media: 7.0, faltas: 4, status: "Regular" },
  ],
  "2": [
    { id: "201", nome: "João Pedro Alves", matricula: "202604", media: 4.8, faltas: 12, status: "Crítico" },
    { id: "202", nome: "Mariana Oliveira", matricula: "202605", media: 5.5, faltas: 8, status: "Crítico" },
    { id: "203", nome: "Pedro Henrique Lima", matricula: "202606", media: 7.1, faltas: 3, status: "Regular" },
  ]
};

export default function CoordinatorMetrics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<TurmaMetrics | null>(null);

  const filteredTurmas = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return MOCK_TURMAS_METRICS;
    return MOCK_TURMAS_METRICS.filter(
      t => t.nome.toLowerCase().includes(term) || t.professor.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const totalAlunosEmRisco = useMemo(() => {
    return MOCK_TURMAS_METRICS.reduce((acc, curr) => acc + curr.alunosEmRisco, 0);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Supervisão Pedagógica</h1>
            <p className="text-slate-500 dark:text-slate-400">Análise de rendimento e suporte preventivo a turmas e alunos.</p>
          </div>

          {/* Cards de KPIs de Controle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Alunos em Alerta</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{totalAlunosEmRisco}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Média Institucional</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">7.7</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Frequência Média</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">91.5%</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Turmas Monitoradas</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{MOCK_TURMAS_METRICS.length}</p>
              </div>
            </div>
          </div>

          {/* Filtro */}
          <div className="relative max-w-md mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por turma ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Listagem de Turmas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Turma</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Professor / Disciplina</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Média Geral</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Frequência</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Alunos Criticos</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTurmas.map((turma) => (
                    <tr key={turma.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{turma.nome}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{turma.professor}</p>
                        <p className="text-xs text-slate-400">{turma.disciplina}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-base ${turma.mediaGeral < 6.0 ? "text-red-500" : "text-slate-800 dark:text-white"}`}>
                          {turma.mediaGeral.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{turma.frequenciaMedia}%</td>
                      <td className="px-6 py-4 text-center">
                        {turma.alunosEmRisco > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center gap-1 w-fit mx-auto">
                            <AlertCircle size={12} /> {turma.alunosEmRisco} em risco
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center gap-1 w-fit mx-auto">
                            <CheckCircle size={12} /> Estável
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedTurma(turma)}
                          className="action-btn bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center cursor-pointer"
                          title="Analisar alunos"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Detalhamento de Alunos da Turma */}
          {selectedTurma && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Alunos de {selectedTurma.nome}</h2>
                    <p className="text-sm text-slate-400">{selectedTurma.disciplina} — Professor(a): {selectedTurma.professor}</p>
                  </div>
                  <button onClick={() => setSelectedTurma(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">Estudante</th>
                        <th className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Média Parcial</th>
                        <th className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Faltas</th>
                        <th className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Aproveitamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(MOCK_ALUNOS_TURMA[selectedTurma.id] || []).map((aluno) => (
                        <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                            <p className="text-xs text-slate-400">Matrícula: {aluno.matricula}</p>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-800 dark:text-white">{aluno.media.toFixed(1)}</td>
                          <td className="px-4 py-3.5 text-center font-medium text-slate-600 dark:text-slate-400">{aluno.faltas}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              aluno.status === "Excelente" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              aluno.status === "Regular" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {aluno.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!MOCK_ALUNOS_TURMA[selectedTurma.id] || MOCK_ALUNOS_TURMA[selectedTurma.id].length === 0) && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-400 font-medium">Nenhum dado cadastrado para esta turma.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}