import { useState, useEffect } from "react";
import { Trophy, Target, Activity, AlertTriangle, CheckCircle2, TrendingUp, BookOpen, Loader2, Medal, Download, Calendar, X, CalendarDays } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";
import html2pdf from "html2pdf.js";

type FaltaDetalhe = {
  data: string;
  disciplinaNome?: string;
};

export default function StudentMetrics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [bimestreAtivo, setBimestreAtivo] = useState("1º Bimestre");
  
  // ESTADO PARA O MODAL DE FALTAS
  const [faltasModal, setFaltasModal] = useState<{ isOpen: boolean; disciplina: string; faltas: FaltaDetalhe[] }>({ 
    isOpen: false, disciplina: "", faltas: [] 
  });
  
  const [stats, setStats] = useState({ 
    turma: "-", totalAlunos: 0, posicaoRanking: 0, mediaGeral: 0, frequenciaGeral: 100, top3: [] as { nome: string; media: number }[]
  });
  
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await api.get('/metricas/aluno');
        setStats(response.data.stats);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const getStatusText = (media: number) => {
    if (media >= 8.0) return "Aprovado";
    if (media >= 6.0) return "Na Média";
    return "Abaixo";
  };

  const getStatusColor = (media: number) => {
    if (media >= 8.0) return "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
    if (media >= 6.0) return "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    return "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
  };

  const formatarDataFalta = (dataStr: string) => {
    if (!dataStr) return "-";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const handleGerarBoletim = async () => {
    setGerandoPdf(true);
    try {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; max-width: 800px; margin: 0 auto;">
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase;">Boletim Escolar Oficial</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: bold;">Class Plus Academic</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 13px;"><strong>Aluno:</strong> ${user?.nome || 'Não identificado'}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Turma:</strong> ${stats.turma} | <strong>Ano:</strong> ${new Date().getFullYear()}</p>
            </div>
          </div>

          <h3 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">Detalhes do ${bimestreAtivo}</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
            <thead style="background: #f1f5f9;">
              <tr>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Disciplina</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Prova (N1)</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Atividades (N2)</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Participação (N3)</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Média Bimestre</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(sub => {
                const b = sub.bimestres[bimestreAtivo];
                return `
                <tr>
                  <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>${sub.nome}</strong></td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${b ? b.n1 : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${b ? b.n2 : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${b ? b.n3 : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; background: #f8fafc;">${b ? b.media.toFixed(1) : '-'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">Fechamento Anual Consolidado</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
            <thead style="background: #f1f5f9;">
              <tr>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Disciplina</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">1º Bim</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">2º Bim</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">3º Bim</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">4º Bim</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Média Final</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Faltas</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(sub => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>${sub.nome}</strong></td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${sub.bimestres["1º Bimestre"] ? sub.bimestres["1º Bimestre"].media.toFixed(1) : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${sub.bimestres["2º Bimestre"] ? sub.bimestres["2º Bimestre"].media.toFixed(1) : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${sub.bimestres["3º Bimestre"] ? sub.bimestres["3º Bimestre"].media.toFixed(1) : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${sub.bimestres["4º Bimestre"] ? sub.bimestres["4º Bimestre"].media.toFixed(1) : '-'}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; background: #f8fafc; color: ${sub.mediaAnual >= 6 ? 'green' : 'red'};">${sub.mediaAnual.toFixed(1)}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${sub.faltas}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
            <p style="margin: 0; font-size: 11px; color: #64748b;">Emitido digitalmente via sistema Class Plus em ${new Date().toLocaleDateString('pt-BR')}.</p>
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = htmlContent;

      const opcoes = {
        margin: 10,
        filename: `Boletim_Completo_${user?.nome?.replace(/\s+/g, '_')}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
      };

      await html2pdf().set(opcoes).from(container).save();
    } catch (error) {
      alert("Erro ao gerar o PDF do Boletim.");
    } finally {
      setGerandoPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1  as const as constflex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Desempenho Acadêmico</h1>
              <p className="text-slate-500 dark:text-slate-400">Acompanhamento detalhado do seu rendimento escolar.</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
              <Trophy size={120} className="absolute -right-6 -bottom-6 text-white opacity-10" />
              <div>
                <h3 className="text-blue-100 font-semibold mb-1 flex items-center gap-2"><TrendingUp size={18} /> Turma Atual</h3>
                <p className="text-sm text-blue-200 mb-4 font-bold">{stats.turma}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{stats.totalAlunos}</span>
                <span className="text-sm text-blue-200 font-medium">Alunos inscritos</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border-l-4 border-l-emerald-500 border-t border-b border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2"><Target size={18} className="text-emerald-500" /> Média (Parcial)</h3>
              </div>
              <div>
                <div className="text-5xl font-black text-slate-800 dark:text-white mb-2">{stats.mediaGeral.toFixed(1)}</div>
                <p className="text-xs text-slate-400 dark:text-slate-400">Desempenho acadêmico global</p>
              </div>
            </div>

            {/* CARTÃO DE FREQUÊNCIA DE VOLTA AO NORMAL */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border-l-4 border-l-purple-500 border-t border-b border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Activity size={18} className="text-purple-500" /> Frequência
                </h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-purple-500" strokeWidth="3" strokeDasharray={`${stats.frequenciaGeral}, 100`} stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-xl font-bold text-slate-800 dark:text-white">{stats.frequenciaGeral}%</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border-l-4 border-l-yellow-500 border-t border-b border-r border-slate-200 dark:border-slate-800 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <Medal size={18} className="text-yellow-500" /> Top 3 da Turma
                </h3>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {stats.top3 && stats.top3.length > 0 ? (
                  stats.top3.map((aluno, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                          idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {idx + 1}º
                        </span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[100px] xl:max-w-[120px]">{aluno.nome}</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{aluno.media.toFixed(1)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-400 text-center py-4">Ranking não disponível</p>
                )}
              </div>
            </div>
          </div>

          {/* TABELA 1: DETALHES DO BIMESTRE ATUAL */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="text-blue-500" /> Detalhes do Bimestre</h2>
              <select 
                value={bimestreAtivo} 
                onChange={(e) => setBimestreAtivo(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold outline-none"
              >
                {["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Disciplina</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Prova (N1)</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Atividades (N2)</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Participação (N3)</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center bg-slate-100 dark:bg-slate-800">Média do Bimestre</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => {
                    const b = sub.bimestres[bimestreAtivo];
                    return (
                      <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{sub.nome}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b ? b.n1 : '-'}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b ? b.n2 : '-'}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b ? b.n3 : '-'}</td>
                        <td className="px-6 py-4 text-center bg-slate-50 dark:bg-slate-800/40">
                          <span className={`font-bold ${!b ? 'text-slate-400 dark:text-slate-500' : b.media >= 6 ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400'}`}>
                            {b ? b.media.toFixed(1) : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {subjects.length === 0 && (<tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum registro acadêmico lançado ainda.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELA 2: CONSOLIDADO ANUAL */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Calendar className="text-blue-500" /> Fechamento Anual</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Disciplina</th>
                    <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">1º Bim</th>
                    <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">2º Bim</th>
                    <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">3º Bim</th>
                    <th className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">4º Bim</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center bg-slate-100 dark:bg-slate-800">Média Final Anual</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Situação Final</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => {
                    const b1 = sub.bimestres["1º Bimestre"];
                    const b2 = sub.bimestres["2º Bimestre"];
                    const b3 = sub.bimestres["3º Bimestre"];
                    const b4 = sub.bimestres["4º Bimestre"];
                    
                    return (
                      <tr key={`anual-${sub.id}`} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{sub.nome}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b1 ? b1.media.toFixed(1) : '-'}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b2 ? b2.media.toFixed(1) : '-'}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b3 ? b3.media.toFixed(1) : '-'}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{b4 ? b4.media.toFixed(1) : '-'}</td>
                        
                        <td className="px-6 py-4 text-center bg-slate-50 dark:bg-slate-800/40">
                          <span className={`font-bold ${sub.mediaAnual >= 6 ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400'}`}>
                            {sub.mediaAnual.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getStatusColor(sub.mediaAnual)}`}>
                            {sub.mediaAnual >= 8.0 && <CheckCircle2 size={14} />}
                            {sub.mediaAnual >= 6.0 && sub.mediaAnual < 8.0 && <Activity size={14} />}
                            {sub.mediaAnual < 6.0 && <AlertTriangle size={14} />}
                            {getStatusText(sub.mediaAnual)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {/* BOTÃO CLICÁVEL PARA ABRIR O MODAL DE FALTAS DE 1 MATÉRIA */}
                          <button 
                            onClick={() => setFaltasModal({ 
                              isOpen: true, 
                              disciplina: sub.nome, 
                              faltas: (sub.faltasDatas || []).map((d: string) => ({ data: d })) 
                            })}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                          >
                            {sub.faltas} {sub.faltas === 1 ? 'falta' : 'faltas'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {subjects.length === 0 && (<tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum registro.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button 
              onClick={handleGerarBoletim}
              disabled={gerandoPdf || subjects.length === 0}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50"
            >
              {gerandoPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              {gerandoPdf ? "Processando Documento..." : "Baixar Boletim Completo"}
            </button>
          </div>

        </main>

        {/* MODAL DETALHE DE FALTAS */}
        {faltasModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Detalhes de Faltas</h2>
                <button onClick={() => setFaltasModal({ isOpen: false, disciplina: "", faltas: [] })} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition" title="Fechar">
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Visualizando: <strong className="text-slate-800 dark:text-white">{faltasModal.disciplina}</strong>
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {faltasModal.faltas.length > 0 ? (
                  faltasModal.faltas.map((falta, idx) => (
                    <div key={idx} className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="text-rose-500" size={18} />
                        <span className="font-semibold text-rose-700 dark:text-rose-400">
                          {formatarDataFalta(falta.data)}
                        </span>
                      </div>
                      {falta.disciplinaNome && (
                        <span className="text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 px-2 py-1 rounded-md max-w-[120px] truncate" title={falta.disciplinaNome}>
                          {falta.disciplinaNome}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Nenhuma falta registrada. Parabéns!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}