import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Eye, Search, CheckCircle2, X } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

// Para o Admin, usamos o mesmo mock inicial, mas a lógica filtrará apenas os aprovados.
interface Roteiro {
  id: string;
  professor: string;
  titulo: string;
  disciplina: string;
  turma: string;
  dataAplicacao: string;
  status: string;
  conteudo: string;
  metodologia: string;
  feedbackCoordenador?: string;
}

const MOCK_ROTEIROS: Roteiro[] = [
  {
    id: "1",
    professor: "Maria Silva",
    titulo: "Introdução à Álgebra e Equações de 1º Grau",
    disciplina: "Matemática",
    turma: "8º Ano A",
    dataAplicacao: "2026-05-25",
    status: "Aprovado",
    conteudo: "Conceito de variáveis, incógnitas e resolução de equações simples.",
    metodologia: "Aula expositiva dialogada seguida de resolução de exercícios em grupos no quadro.",
    feedbackCoordenador: "Excelente cronograma de atividades. Foco muito bom na prática em grupo."
  }
  // No sistema real, a API só enviará os aprovados para o Admin.
];

export default function AdminClassPlan() {
  const [roteiros] = useState<Roteiro[]>(MOCK_ROTEIROS.filter(r => r.status === "Aprovado"));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoteiro, setSelectedRoteiro] = useState<Roteiro | null>(null);

  const filteredRoteiros = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return roteiros;
    return roteiros.filter(
      (r) =>
        r.titulo.toLowerCase().includes(term) ||
        r.professor.toLowerCase().includes(term) ||
        r.turma.toLowerCase().includes(term)
    );
  }, [roteiros, searchTerm]);

  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Roteiros Aprovados</h1>
            <p className="text-slate-500 dark:text-slate-400">Consulta ao arquivo de roteiros pedagógicos oficiais da instituição.</p>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar roteiro aprovado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <Th>Professor</Th>
                    <Th>Data</Th>
                    <Th>Título do Plano</Th>
                    <Th>Turma</Th>
                    <Th>Status</Th>
                    <Th className="text-center">Detalhes</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoteiros.map((roteiro) => (
                    <tr key={roteiro.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Td className="font-semibold text-slate-800 dark:text-white">{roteiro.professor}</Td>
                      <Td className="text-slate-600 dark:text-slate-400">{formatarData(roteiro.dataAplicacao)}</Td>
                      <Td className="truncate max-w-xs">{roteiro.titulo}</Td>
                      <Td>{roteiro.turma}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 size={16} /> Aprovado
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-center">
                          <button onClick={() => setSelectedRoteiro(roteiro)} className="action-btn flex items-center justify-center bg-slate-600 hover:bg-slate-700">
                            <Eye size={16} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {selectedRoteiro && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{selectedRoteiro.titulo}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Autor: <span className="font-semibold">{selectedRoteiro.professor}</span></p>
                </div>
                <button onClick={() => setSelectedRoteiro(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Disciplina</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.disciplina}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Turma / Data</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.turma} - {formatarData(selectedRoteiro.dataAplicacao)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Conteúdo</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.conteudo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Metodologia</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.metodologia}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-sm font-bold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>;
}