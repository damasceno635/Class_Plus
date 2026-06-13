import { useState, useMemo } from "react";
import { 
  FileBarChart, Download, FileText, PieChart, DollarSign, Users, GraduationCap, ClipboardList, CheckCircle, Loader2, Filter
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

// @ts-ignore
import html2pdf from "html2pdf.js";

type ReportCategory = "academic" | "financial" | "operational" | "general";

interface ReportTemplate {
  id: string; title: string; description: string; category: ReportCategory; icon: React.ReactNode; rolesAllowed: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: "rep-01", title: "Desempenho Académico Global", description: "Médias gerais por turma, disciplina e comparativos de aprovação.", category: "academic", icon: <GraduationCap size={24} className="text-blue-500" />, rolesAllowed: ["admin", "coordinator"] },
  { id: "rep-03", title: "Inadimplência e Faturas", description: "Relatório de mensalidades em atraso detalhado por responsável financeiro.", category: "financial", icon: <DollarSign size={24} className="text-red-500" />, rolesAllowed: ["admin", "secretary"] },
  { id: "rep-04", title: "Demonstração de Resultados (DRE)", description: "Balanço de receitas, despesas e saldo operacional do período.", category: "financial", icon: <PieChart size={24} className="text-green-500" />, rolesAllowed: ["admin"] },
  { id: "rep-05", title: "Log de Requisições e Protocolos", description: "Métricas de atendimento, tempo de resposta e volume de chamados.", category: "operational", icon: <ClipboardList size={24} className="text-amber-500" />, rolesAllowed: ["admin", "secretary", "coordinator"] },
  { id: "rep-06", title: "Listagem de Utilizadores Ativos", description: "Relação completa de utilizadores ativos no sistema.", category: "general", icon: <FileText size={24} className="text-purple-500" />, rolesAllowed: ["admin", "secretary", "coordinator"] }
];

export default function Reports() {
  const { user } = useAuth();
  
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableReports = useMemo(() => {
    if (!user) return [];
    return REPORT_TEMPLATES.filter(rep => rep.rolesAllowed.includes(user.cargo));
  }, [user]);

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // GERAÇÃO INTELIGENTE DE PDF
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return alert("Selecione um relatório!");

    setIsGenerating(true);
    setSuccessMessage(null);

    try {
      // 1. Busca os dados reais na API
      const response = await api.get('/relatorios/gerar', {
        params: { tipo: selectedReport, dataInicio: dateFrom, dataFim: dateTo }
      });
      const data = response.data.dados;
      const reportInfo = REPORT_TEMPLATES.find(r => r.id === selectedReport);

      // 2. Monta o Corpo HTML dependendo do relatório
      let conteudoHTML = "";

      if (selectedReport === 'rep-01') {
        conteudoHTML = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <tr style="background: #f1f5f9;"><th style="padding: 12px; border: 1px solid #cbd5e1;">Métrica</th><th style="padding: 12px; border: 1px solid #cbd5e1;">Valor Consolidade</th></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Total de Provas Lançadas</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;"><b>${data.totalProvas}</b></td></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Média Global da Instituição</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;"><b>${data.mediaGlobal}</b></td></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Taxa de Aprovação</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: green;"><b>${data.taxaAprovacao}%</b></td></tr>
          </table>
        `;
      } else if (selectedReport === 'rep-03') {
        const rows = data.faturas.map((f: any) => `<tr><td style="padding: 10px; border: 1px solid #cbd5e1;">${f.aluno.user.nome}</td><td style="padding: 10px; border: 1px solid #cbd5e1;">${f.referencia}</td><td style="padding: 10px; border: 1px solid #cbd5e1; color: red;">${formatarMoeda(f.valor)}</td></tr>`).join('');
        conteudoHTML = `
          <h3 style="color: #b91c1c;">Dívida Ativa Total: ${formatarMoeda(data.totalAtrasado)}</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #f1f5f9;"><th style="padding: 10px; border: 1px solid #cbd5e1;">Aluno</th><th style="padding: 10px; border: 1px solid #cbd5e1;">Fatura</th><th style="padding: 10px; border: 1px solid #cbd5e1;">Valor</th></tr>
            ${rows || '<tr><td colspan="3" style="text-align:center; padding: 10px;">Nenhuma inadimplência encontrada.</td></tr>'}
          </table>
        `;
      } else if (selectedReport === 'rep-04') {
        conteudoHTML = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 18px;">
            <tr><td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Receitas Recebidas (Pagas)</td><td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: green;"><b>+ ${formatarMoeda(data.receitas)}</b></td></tr>
            <tr><td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Despesas Operacionais (Fixas)</td><td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: red;"><b>- ${formatarMoeda(data.despesasFixas)}</b></td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 15px; border-bottom: 1px solid #cbd5e1;"><b>Saldo em Caixa Líquido</b></td><td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: blue;"><b>${formatarMoeda(data.saldoCaixa)}</b></td></tr>
            <tr><td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Valores a Receber (Atrasos/Pendentes)</td><td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: orange;"><b>${formatarMoeda(data.pendentes)}</b></td></tr>
          </table>
        `;
      } else if (selectedReport === 'rep-05') {
        conteudoHTML = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <tr style="background: #f1f5f9;"><th style="padding: 12px; border: 1px solid #cbd5e1;">Status</th><th style="padding: 12px; border: 1px solid #cbd5e1;">Quantidade</th></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Total de Chamados Abertos</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;"><b>${data.total}</b></td></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Concluídos com Sucesso</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: green;"><b>${data.concluidas}</b></td></tr>
            <tr><td style="padding: 12px; border: 1px solid #cbd5e1;">Aguardando Atendimento da Secretaria</td><td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: orange;"><b>${data.aguardando}</b></td></tr>
          </table>
        `;
      } else if (selectedReport === 'rep-06') {
        const rows = data.users.map((u: any) => `<tr><td style="padding: 10px; border: 1px solid #cbd5e1;">${u.nome}</td><td style="padding: 10px; border: 1px solid #cbd5e1;">${u.cargo.toUpperCase()}</td><td style="padding: 10px; border: 1px solid #cbd5e1;">${u.email}</td></tr>`).join('');
        conteudoHTML = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #f1f5f9;"><th style="padding: 10px; border: 1px solid #cbd5e1;">Nome</th><th style="padding: 10px; border: 1px solid #cbd5e1;">Cargo</th><th style="padding: 10px; border: 1px solid #cbd5e1;">E-mail</th></tr>
            ${rows || '<tr><td colspan="3" style="text-align:center;">Nenhum utilizador encontrado.</td></tr>'}
          </table>
        `;
      }

      // 3. Monta o HTML Completo com o Timbre
      const finalHTML = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto;">
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #0f172a;">RELATÓRIO OFICIAL - CLASS PLUS</h1>
            <p style="margin: 5px 0 0 0; color: #64748b; text-transform: uppercase; font-weight: bold;">${reportInfo?.title}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><b>Gerado por:</b> ${user?.nome} (${user?.cargo.toUpperCase()})</p>
            <p style="margin: 5px 0 0 0;"><b>Data de Emissão:</b> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            ${dateFrom ? `<p style="margin: 5px 0 0 0;"><b>Período Analisado:</b> ${dateFrom.split('-').reverse().join('/')} até ${dateTo.split('-').reverse().join('/')}</p>` : ''}
          </div>

          ${conteudoHTML}

          <div style="margin-top: 60px; font-size: 12px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Este é um documento digital gerado automaticamente pela base de dados do sistema Class Plus. <br/>
            Cód. Autenticação: ${Math.random().toString(36).substring(2, 15).toUpperCase()}-${Date.now()}
          </div>
        </div>
      `;

      // 4. Executa o Download do PDF
      const container = document.createElement('div');
      container.innerHTML = finalHTML;

      const opcoes = {
        margin: 15,
        filename: `Relatorio_${selectedReport}_${new Date().getTime()}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(opcoes).from(container).save();

      setSuccessMessage("Relatório extraído com sucesso! Verifique a sua pasta de transferências.");
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      alert("Erro ao extrair dados do banco. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FileBarChart className="text-blue-600 dark:text-blue-500" size={32} />
              Central de Relatórios
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Extraia dados estratégicos, financeiros e académicos consolidados a partir do banco de dados oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: Formulário de Geração */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter size={20} className="text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Filtros de Exportação</h2>
                </div>

                <form onSubmit={handleGenerateReport} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Relatório *</label>
                    <select 
                      required
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um relatório...</option>
                      {availableReports.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Período Inicial (Opcional)</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Período Final (Opcional)</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="submit" disabled={isGenerating} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white p-4 rounded-xl font-bold transition-all shadow-md cursor-pointer">
                      {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Compilando Banco...</> : <><Download size={20} /> Extrair Relatório (PDF)</>}
                    </button>
                  </div>
                </form>

                {successMessage && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex gap-3 animate-fade-in">
                    <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">{successMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: Catálogo de Relatórios */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Modelos Disponíveis para o seu Perfil</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {availableReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                      selectedReport === report.id ? "bg-blue-50 border-blue-500 shadow-md dark:bg-blue-900/20 dark:border-blue-500" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">{report.icon}</div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{report.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{report.description}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-end">
                      <span className={`text-xs font-bold uppercase tracking-wider ${selectedReport === report.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                        {selectedReport === report.id ? "Selecionado" : "Selecionar"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}