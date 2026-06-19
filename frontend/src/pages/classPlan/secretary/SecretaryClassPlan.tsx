import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { Eye, Search, CheckCircle2, X, FileText, Loader2 } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";
import html2pdf from "html2pdf.js";

interface Roteiro {
  id: string; professor: string; titulo: string; disciplina: string;
  turma: string; dataAplicacao: string; status: string;
  conteudo: string; metodologia: string;
}

export default function SecretaryClassPlan() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoteiro, setSelectedRoteiro] = useState<Roteiro | null>(null);
  const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoteiros() {
      try {
        const response = await api.get('/roteiros');
        // A Secretaria SÓ VÊ o que o coordenador já aprovou
        const apenasAprovados = response.data.filter((r: Roteiro) => r.status === 'Aprovado');
        setRoteiros(apenasAprovados);
      } catch (error) {
        console.error("Erro ao carregar roteiros", error);
      }
    }
    fetchRoteiros();
  }, []);

  const filteredRoteiros = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return roteiros;
    return roteiros.filter(
      (r) => r.titulo.toLowerCase().includes(term) || r.professor.toLowerCase().includes(term) || r.turma.toLowerCase().includes(term)
    );
  }, [roteiros, searchTerm]);

  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const handleGerarPDF = async (roteiro: Roteiro) => {
    try {
      setGerandoPdfId(roteiro.id);
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase;">Plano de Aula Oficial</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Class Plus - Chancelado pela Coordenação</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; text-align: left;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Professor(a):</strong> ${roteiro.professor}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Data de Aplicação:</strong> ${formatarData(roteiro.dataAplicacao)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Disciplina:</strong> ${roteiro.disciplina}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Turma:</strong> ${roteiro.turma}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;"><strong>Tema da Aula:</strong> ${roteiro.titulo}</td>
            </tr>
          </table>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Conteúdo Programático</h3>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-top: 10px;">${roteiro.conteudo.replace(/\n/g, '<br/>')}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Metodologia Aplicada</h3>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-top: 10px;">${roteiro.metodologia.replace(/\n/g, '<br/>')}</p>
          </div>
          <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 12px; color: #64748b;">Documento gerado digitalmente em ${new Date().toLocaleDateString('pt-BR')}. Status no sistema: <strong>Aprovado</strong>.</p>
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = htmlContent;

      const opcoes = {
        margin: 10,
        filename: `Roteiro_${roteiro.turma.replace(/\s/g,'_')}_${roteiro.disciplina}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(opcoes).from(container).save();
    } catch (error) {
      alert("Erro ao gerar PDF.");
    } finally {
      setGerandoPdfId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Roteiros Aprovados</h1>
            <p className="text-slate-500 dark:text-slate-400">Consulta e exportação do arquivo de roteiros pedagógicos oficiais da instituição.</p>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar roteiro aprovado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left"><Th>Professor</Th><Th>Data</Th><Th>Título do Plano</Th><Th>Turma</Th><Th>Status</Th><Th className="text-center">Ações</Th></tr>
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
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedRoteiro(roteiro)} title="Visualizar" className="p-2 rounded-xl transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50">
                            <Eye size={16} />
                          </button>
                          
                          <button 
                            onClick={() => handleGerarPDF(roteiro)} 
                            disabled={gerandoPdfId === roteiro.id}
                            title="Gerar PDF" 
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              gerandoPdfId === roteiro.id 
                                ? 'bg-emerald-100 text-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-wait opacity-70'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                            }`}
                          >
                            {gerandoPdfId === roteiro.id ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRoteiros.length === 0 && <div className="text-center py-12 text-slate-500">Nenhum roteiro aprovado encontrado.</div>}
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
                <button onClick={() => setSelectedRoteiro(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={24} /></button>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Disciplina</p><p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.disciplina}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Turma / Data</p><p className="font-semibold text-slate-800 dark:text-white">{selectedRoteiro.turma} - {formatarData(selectedRoteiro.dataAplicacao)}</p></div>
                </div>
                <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Conteúdo</p><p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.conteudo}</p></div>
                <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Metodologia</p><p className="text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{selectedRoteiro.metodologia}</p></div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) { return <th className={`px-6 py-4 text-sm font-bold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>; }
function Td({ children, className = "" }: { children: ReactNode; className?: string }) { return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>; }