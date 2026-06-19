import { useState, useEffect } from "react";
import { Search, FileText, Send, CheckCircle2, AlertCircle, Clock, DollarSign, Loader2, Slash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";
import html2pdf from "html2pdf.js";

interface AlunoFinanceiro {
  alunoId: string;
  nome: string;
  matricula: string;
  turma: string;
  statusMensalidade: "Pago" | "Pendente" | "Atrasado" | "Em Dia" | "Sem Faturas";
  ultimaPaga: string;
  diasAtraso: number;
  faturaId: string | null;
  valor: number;
  vencimento: string;
}

export default function SecretaryFinance() {
  const [alunos, setAlunos] = useState<AlunoFinanceiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  
  // PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const carregarDados = async () => {
    try {
      const response = await api.get('/financeiro/secretaria');
      
      const alunosTratados = response.data.map((aluno: any) => ({
        ...aluno,
        statusMensalidade: aluno.faturaId ? aluno.statusMensalidade : "Sem Faturas",
        ultimaPaga: aluno.faturaId ? aluno.ultimaPaga : "Nenhum registo no banco"
      }));

      setAlunos(alunosTratados);
      setCurrentPage(1); // Reseta para a primeira página ao recarregar
    } catch (error) {
      console.error("Erro ao carregar alunos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // FILTRO
  const filtered = alunos.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.matricula.includes(searchTerm)
  );

  // PAGINAÇÃO LÓGICA
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  // Reset para página 1 quando a busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatarMoeda = (valor: number) => valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "-";
  const formatarData = (dataStr: string) => dataStr ? dataStr.split("-").reverse().join("/") : "-";

  const darBaixaManual = async (aluno: AlunoFinanceiro) => {
    if (!aluno.faturaId || aluno.statusMensalidade === "Pago") return;
    
    if (confirm(`Confirmar o recebimento manual do valor de ${formatarMoeda(aluno.valor)} para o aluno(a) ${aluno.nome}?`)) {
      setProcessandoId(aluno.alunoId);
      try {
        await api.put(`/financeiro/baixa/${aluno.faturaId}`);
        alert("Pagamento registrado com sucesso no sistema!");
        await carregarDados();
      } catch (error) {
        alert("Erro ao registrar pagamento.");
      } finally {
        setProcessandoId(null);
      }
    }
  };

  const gerarSegundaVia = async (aluno: AlunoFinanceiro) => {
    if (!aluno.faturaId) return;
    setProcessandoId(aluno.alunoId);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px; color: #0f172a;">2ª Via - Boleto / PIX de Cobrança</h1>
          <p style="margin: 5px 0 0 0; color: #64748b;">Class Plus - Instituição de Ensino</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Pagador:</strong> ${aluno.nome}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Matrícula:</strong> ${aluno.matricula}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Referência:</strong> ${aluno.ultimaPaga}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Vencimento Original:</strong> ${formatarData(aluno.vencimento)}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 18px;"><strong>Valor a Pagar:</strong> ${formatarMoeda(aluno.valor)}</td></tr>
        </table>
        <div style="text-align: center; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 10px; background: #f8fafc;">
          <p style="margin-bottom: 10px; font-weight: bold; color: #0f172a;">Chave PIX Copia e Cola</p>
          <p style="font-family: monospace; word-break: break-all; font-size: 12px; color: #475569; background: #e2e8f0; padding: 10px; border-radius: 5px;">00020126580014br.gov.bcb.pix0136pix@classplus.com.br5204000053039865802BR5903BRL6005${aluno.valor.toFixed(2)}6206Caxias6304123454041234</p>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opcoes = {
      margin: 15,
      filename: `Boleto_2Via_${aluno.ultimaPaga.replace(/[^a-zA-Z0-9]/g, "_")}_${aluno.matricula}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    try {
      await html2pdf().set(opcoes).from(container).save();
    } catch (err) {
      alert("Erro ao gerar o PDF.");
    } finally {
      setProcessandoId(null);
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
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Controle de Mensalidades</h1>
            <p className="text-slate-500 dark:text-slate-400">Atendimento financeiro, emissão de boletos e registro de pagamentos no balcão.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar por aluno ou matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Itens por página:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Aluno</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Turma</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Última Fatura</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status Financeiro</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Ações Operacionais</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((aluno) => (
                    <tr key={aluno.alunoId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                        <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{aluno.turma}</td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{aluno.ultimaPaga}</td>
                      <td className="px-6 py-4">
                        {(aluno.statusMensalidade === "Em Dia" || aluno.statusMensalidade === "Pago") && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 size={14}/> Fatura Paga</span>}
                        {aluno.statusMensalidade === "Pendente" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={14}/> Pendente (No prazo)</span>}
                        {aluno.statusMensalidade === "Atrasado" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle size={14}/> {aluno.diasAtraso} dias de atraso</span>}
                        {aluno.statusMensalidade === "Sem Faturas" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Slash size={14}/> Sem Cobranças</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => gerarSegundaVia(aluno)}
                            disabled={!aluno.faturaId || processandoId === aluno.alunoId}
                            title={!aluno.faturaId ? "Não há faturas para este aluno" : "Gerar 2ª Via do Boleto"} 
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {processandoId === aluno.alunoId ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18}/>}
                          </button>
                          
                          <button 
                            disabled={!aluno.faturaId || aluno.statusMensalidade === "Pago"}
                            title="Enviar Lembrete por E-mail (Futuro)" 
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Send size={18}/>
                          </button>

                          <button 
                            onClick={() => darBaixaManual(aluno)}
                            disabled={!aluno.faturaId || aluno.statusMensalidade === "Pago" || processandoId === aluno.alunoId}
                            title={!aluno.faturaId ? "Nada a receber" : aluno.statusMensalidade === "Pago" ? "Fatura já paga" : "Dar baixa manual (Pagamento no balcão)"} 
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-green-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <DollarSign size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-500">Nenhum aluno encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINAÇÃO */} 
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando {startIndex + 1} - {endIndex} de {totalItems} registros
              </div>
              <div className="flex items-center gap-2">
                
                {/* Botão Primeira Página (Seta Dupla Esquerda) */}
                <button 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Primeira página"
                >
                  <ChevronsLeft size={18} />
                </button>
                
                {/* Botão Página Anterior (Seta Simples Esquerda) */}
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Números das Páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button 
                        key={pageNum} 
                        onClick={() => goToPage(pageNum)} 
                        className={`w-10 h-10 rounded-xl font-semibold transition ${pageNum === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botão Próxima Página (Seta Simples Direita) */}
                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Próxima página"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Botão Última Página (Seta Dupla Direita) */}
                <button 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Última página"
                >
                  <ChevronsRight size={18} />
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