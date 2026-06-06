import { useState, useMemo, useEffect } from "react";
import { Save, Search, Check, X, BookOpen, UserCheck, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";

interface Student { id: string; nome: string; matricula: string; }
type TabType = "frequencia" | "boletim";

export default function TeacherMetrics() {
  const [activeTab, setActiveTab] = useState<TabType>("frequencia");
  
  // DADOS DA API
  const [turmas, setTurmas] = useState<{id: string, nome: string}[]>([]);
  const [alunos, setAlunos] = useState<Student[]>([]);
  
  // SELETORES
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBimestre, setSelectedBimestre] = useState("1º Bimestre");
  const [searchTerm, setSearchTerm] = useState("");
  
  // CONTROLES DE ESTADO E FORMULÁRIOS
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [frequencias, setFrequencias] = useState<Record<string, { presente: boolean; observacao: string }>>({});
  const [notas, setNotas] = useState<Record<string, { n1: string; n2: string; n3: string; n4: string }>>({});

  // 1. CARREGAR AS TURMAS DO PROFESSOR AO ABRIR
  useEffect(() => {
    api.get('/diario/turmas').then(res => {
      setTurmas(res.data);
      if(res.data.length > 0) setSelectedTurma(res.data[0].id);
    }).catch(err => console.error(err));
  }, []);

  // 2. CARREGAR ALUNOS QUANDO A TURMA MUDA
  useEffect(() => {
    if(!selectedTurma) return;
    api.get(`/diario/alunos/${selectedTurma}`).then(res => {
      setAlunos(res.data);
    }).catch(err => console.error(err));
  }, [selectedTurma]);

  // 3. CARREGAR FREQUÊNCIAS (Se mudar de Turma ou Data)
  useEffect(() => {
    if(!selectedTurma || alunos.length === 0) return;
    api.get(`/diario/frequencia?alocacaoId=${selectedTurma}&data=${selectedDate}`).then(res => {
      const freqData = res.data;
      const newFreqState: Record<string, {presente: boolean, observacao: string}> = {};
      
      alunos.forEach(a => {
        const existing = freqData.find((f: any) => f.alunoId === a.id);
        // Se já houver registo no banco puxa, se não assume Presente
        newFreqState[a.id] = existing ? { presente: existing.presente, observacao: existing.observacao || '' } : { presente: true, observacao: '' };
      });
      setFrequencias(newFreqState);
    });
  }, [selectedTurma, selectedDate, alunos]);

  // 4. CARREGAR NOTAS (Se mudar de Turma ou Bimestre)
  useEffect(() => {
    if(!selectedTurma || alunos.length === 0) return;
    api.get(`/diario/notas?alocacaoId=${selectedTurma}&bimestre=${selectedBimestre}`).then(res => {
      const notasData = res.data;
      const newNotasState: Record<string, {n1: string, n2: string, n3: string, n4: string}> = {};
      
      alunos.forEach(a => {
        const existing = notasData.find((n: any) => n.alunoId === a.id);
        newNotasState[a.id] = existing ? { n1: existing.n1||'', n2: existing.n2||'', n3: existing.n3||'', n4: existing.n4||'' } : { n1: '', n2: '', n3: '', n4: '' };
      });
      setNotas(newNotasState);
    });
  }, [selectedTurma, selectedBimestre, alunos]);

  const filteredAlunos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return alunos;
    return alunos.filter(a => a.nome.toLowerCase().includes(term) || a.matricula.includes(term));
  }, [alunos, searchTerm]);

  /* ===================================================== */
  /* HANDLERS DA TELA                                      */
  /* ===================================================== */

  const handleFrequenciaChange = (id: string, presente: boolean) => setFrequencias(prev => ({ ...prev, [id]: { ...prev[id], presente } }));
  const handleObservacaoChange = (id: string, observacao: string) => setFrequencias(prev => ({ ...prev, [id]: { ...prev[id], observacao } }));
  const handleNotaChange = (id: string, campo: "n1" | "n2" | "n3" | "n4", valor: string) => {
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    if (valor === "" || (regex.test(valor) && parseFloat(valor.replace(',', '.')) <= 10)) {
      setNotas(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
    }
  };

  const calcularMedia = (id: string): string => {
    const n = notas[id];
    if(!n) return "0.0";
    const valores = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v.replace(',', '.')) || 0);
    const media = valores.reduce((acc, curr) => acc + curr, 0) / 4;
    return isNaN(media) ? "0.0" : media.toFixed(1);
  };

  const handleSave = async () => {
    setFeedback(null);
    setSalvando(true);
    try {
      if (activeTab === "frequencia") {
        const payload = Object.keys(frequencias).map(alunoId => ({
          alunoId, presente: frequencias[alunoId].presente, observacao: frequencias[alunoId].observacao
        }));
        await api.post('/diario/frequencia', { alocacaoId: selectedTurma, data: selectedDate, frequencias: payload });
      } else {
        const payload = Object.keys(notas).map(alunoId => ({
          alunoId, ...notas[alunoId]
        }));
        await api.post('/diario/notas', { alocacaoId: selectedTurma, bimestre: selectedBimestre, notas: payload });
      }
      setFeedback({ type: "success", message: "Dados salvos com sucesso no sistema!" });
    } catch(err) {
      setFeedback({ type: "error", message: "Erro ao salvar os dados." });
    } finally {
      setSalvando(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Desempenho Acadêmico</h1>
              <p className="text-slate-500 dark:text-slate-400">Lançamento de diário de classe e boletim de notas</p>
            </div>
            <button
              onClick={handleSave}
              disabled={salvando || !selectedTurma}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-md disabled:opacity-50"
            >
              {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {salvando ? "A Guardar..." : "Salvar Alterações"}
            </button>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold ${feedback.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {feedback.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              {feedback.message}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab("frequencia")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === "frequencia" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <UserCheck size={18} /> Diário e Frequência
              </button>
              <button
                onClick={() => setActiveTab("boletim")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === "boletim" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <BookOpen size={18} /> Lançamento de Notas
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-64">
                <select 
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {turmas.length === 0 && <option value="">Nenhuma turma alocada</option>}
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>

              {activeTab === "frequencia" ? (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                  <CalendarDays size={18} className="text-slate-400" />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-1.5 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium w-36" />
                </div>
              ) : (
                <div className="flex-1 sm:w-40">
                  <select value={selectedBimestre} onChange={(e) => setSelectedBimestre(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                    <option value="1º Bimestre">1º Bimestre</option>
                    <option value="2º Bimestre">2º Bimestre</option>
                    <option value="3º Bimestre">3º Bimestre</option>
                    <option value="4º Bimestre">4º Bimestre</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="relative max-w-md mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* TABELA DE FREQUÊNCIA */}
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
                      const state = frequencias[aluno.id] || { presente: true, observacao: "" };
                      return (
                        <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                            <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleFrequenciaChange(aluno.id, true)} className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${state.presente ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                                <Check size={20} />
                              </button>
                              <button onClick={() => handleFrequenciaChange(aluno.id, false)} className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${!state.presente ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                                <X size={20} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input type="text" placeholder={!state.presente ? "Ex: Atestado..." : "Comportamento..."} value={state.observacao} onChange={(e) => handleObservacaoChange(aluno.id, e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABELA DE NOTAS */}
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
                      const state = notas[aluno.id] || { n1: "", n2: "", n3: "", n4: "" };
                      const mediaFinal = parseFloat(calcularMedia(aluno.id));
                      const estaAbaixo = mediaFinal > 0 && mediaFinal < 6.0;

                      return (
                        <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                            <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                          </td>
                          {["n1", "n2", "n3", "n4"].map((nota) => (
                            <td key={nota} className="px-4 py-4">
                              <input type="text" value={state[nota as keyof typeof state]} onChange={(e) => handleNotaChange(aluno.id, nota as any, e.target.value)} placeholder="--" className="w-full text-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold" />
                            </td>
                          ))}
                          <td className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-xl font-bold ${mediaFinal === 0 ? "text-slate-400" : estaAbaixo ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                {mediaFinal === 0 ? "-" : mediaFinal}
                              </span>
                              {estaAbaixo && <span className="text-[10px] flex items-center gap-1 text-red-600 font-semibold mt-1"><AlertCircle size={10} /> Abaixo</span>}
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
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              Nenhum aluno encontrado para esta turma.
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}