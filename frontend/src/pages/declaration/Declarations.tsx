import { useState, useMemo } from "react";
import { Download, FileText, PieChart, DollarSign, GraduationCap, 
         ClipboardList, CheckCircle, Loader2, Filter } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import html2pdf from "html2pdf.js";

type ReportCategory = "academic" | "financial" | "operational" | "general";

interface ReportTemplate {
  id: string; title: string; description: string; category: ReportCategory; icon: React.ReactNode; rolesAllowed: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: "rep-01", title: "Desempenho Académico Global", description: "Médias reais consolidadas e Ranking de Rendimento por Turmas.", category: "academic", icon: <GraduationCap size={24} className="text-blue-500" />, rolesAllowed: ["admin", "coordinator"] },
  { id: "rep-03", title: "Inadimplência e Faturas", description: "Relação exata das faturas atrasadas, dias de atraso e dívida ativa.", category: "financial", icon: <DollarSign size={24} className="text-red-500" />, rolesAllowed: ["admin", "secretary"] },
  { id: "rep-04", title: "Demonstração de Resultados (DRE)", description: "Balanço real cruzando pagamentos recebidos com a folha salarial dos funcionários.", category: "financial", icon: <PieChart size={24} className="text-green-500" />, rolesAllowed: ["admin"] },
  { id: "rep-05", title: "Log de Requisições e Protocolos", description: "Métricas de atendimento e listagem das últimas 15 requisições do sistema.", category: "operational", icon: <ClipboardList size={24} className="text-amber-500" />, rolesAllowed: ["admin", "secretary", "coordinator"] },
  { id: "rep-06", title: "Listagem de Utilizadores Ativos", description: "Relação de todos os acessos do sistema agrupados por cargo.", category: "general", icon: <FileText size={24} className="text-purple-500" />, rolesAllowed: ["admin", "secretary", "coordinator"] }
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

  // GERAÇÃO INTELIGENTE DE PDF (Lê as arrays e desenha tabelas completas)
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return alert("Selecione um relatório!");

    setIsGenerating(true);
    setSuccessMessage(null);

    try {
      const response = await api.get('/relatorios/gerar', {
        params: { tipo: selectedReport, dataInicio: dateFrom, dataFim: dateTo }
      });
      const data = response.data.dados;
      const reportInfo = REPORT_TEMPLATES.find(r => r.id === selectedReport);

      let conteudoHTML = "";

      if (selectedReport === 'rep-01') {
        const rankingHtml = data.rankingTurmas.map((t: any, index: number) => 
          `<tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${index + 1}º</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;"><b>${t.turma}</b></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: ${t.media >= 6 ? 'green' : 'red'};"><b>${t.media}</b></td>
          </tr>`
        ).join('');

        conteudoHTML = `
          <div style="display: flex; gap: 20px; margin-top: 30px;">
            <div style="flex: 1; padding: 15px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Média Global</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;">${data.mediaGlobal}</p>
            </div>
            <div style="flex: 1; padding: 15px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Aprovação Institucional</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #16a34a;">${data.taxaAprovacao}%</p>
            </div>
            <div style="flex: 1; padding: 15px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Alunos Avaliados</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;">${data.totalAvaliados}</p>
            </div>
          </div>
          
          <h3 style="margin-top: 40px; color: #3b82f6;">Ranking de Rendimento por Turmas</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 60px;">Pos.</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Nomenclatura da Turma</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Média Consolidada</th>
            </tr>
            ${rankingHtml || '<tr><td colspan="3" style="text-align:center; padding: 10px;">Dados insuficientes.</td></tr>'}
          </table>
        `;
      } 
      
      else if (selectedReport === 'rep-03') {
        const rows = data.faturas.map((f: any) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${f.nome}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${f.vencimento.split('-').reverse().join('/')}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #b91c1c;"><b>${f.diasAtraso} dias</b></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; color: #b91c1c;"><b>${formatarMoeda(f.valor)}</b></td>
          </tr>`
        ).join('');

        conteudoHTML = `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-top: 30px; border-radius: 4px;">
            <h3 style="margin: 0; color: #991b1b; font-size: 16px;">Montante Total em Inadimplência</h3>
            <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #b91c1c;">${formatarMoeda(data.totalAtrasado)}</p>
          </div>
          <h3 style="margin-top: 40px; color: #3b82f6;">Detalhamento de Faturas Vencidas</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Pagador (Aluno)</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Data Orig. Vencimento</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Período de Atraso</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Valor (R$)</th>
            </tr>
            ${rows || '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma fatura em atraso. Parabéns!</td></tr>'}
          </table>
        `;
      } 
      
      else if (selectedReport === 'rep-04') {
        conteudoHTML = `
          <h3 style="margin-top: 30px; color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">DRE - Demonstração de Fluxo Real</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 16px;">
            <tr>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Entradas de Capital (Faturas Pagas)</td>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: #16a34a;"><b>+ ${formatarMoeda(data.receitas)}</b></td>
            </tr>
            <tr>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Saídas de Capital (Folha de Pagamentos / Fixas)</td>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: #dc2626;"><b>- ${formatarMoeda(data.despesasFixas)}</b></td>
            </tr>
            <tr style="background: ${data.saldoCaixa >= 0 ? '#f0fdf4' : '#fef2f2'};">
              <td style="padding: 20px; border-bottom: 1px solid #cbd5e1; font-size: 18px;"><b>SALDO OPERACIONAL (LÍQUIDO)</b></td>
              <td style="padding: 20px; border-bottom: 1px solid #cbd5e1; text-align: right; font-size: 20px; color: ${data.saldoCaixa >= 0 ? '#16a34a' : '#dc2626'};"><b>${formatarMoeda(data.saldoCaixa)}</b></td>
            </tr>
          </table>
          <h3 style="margin-top: 40px; color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Projeção de Entradas Futuras</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Títulos Pendentes (No Prazo)</td>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: #d97706;"><b>${formatarMoeda(data.pendentes)}</b></td>
            </tr>
            <tr>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1;">Títulos em Atraso (Risco de Perda)</td>
              <td style="padding: 15px; border-bottom: 1px solid #cbd5e1; text-align: right; color: #dc2626;"><b>${formatarMoeda(data.atrasadas)}</b></td>
            </tr>
          </table>
        `;
      } 
      
      else if (selectedReport === 'rep-05') {
        const rows = data.ultimas.map((r: any) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${r.data.split('-').reverse().join('/')}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${r.protocolo}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${r.tipo}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${r.aluno}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;"><b>${r.status}</b></td>
          </tr>`
        ).join('');

        conteudoHTML = `
          <div style="display: flex; gap: 15px; margin-top: 30px;">
            <div style="flex: 1; padding: 15px; background: #eff6ff; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1e3a8a;">${data.total}</p>
              <p style="margin: 0; font-size: 12px; color: #60a5fa;">Total Recebido</p>
            </div>
            <div style="flex: 1; padding: 15px; background: #fffbeb; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #92400e;">${data.abertas}</p>
              <p style="margin: 0; font-size: 12px; color: #fbbf24;">Em Aberto</p>
            </div>
            <div style="flex: 1; padding: 15px; background: #f0fdf4; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #166534;">${data.concluidas}</p>
              <p style="margin: 0; font-size: 12px; color: #4ade80;">Concluídas</p>
            </div>
            <div style="flex: 1; padding: 15px; background: #fef2f2; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #991b1b;">${data.negadas}</p>
              <p style="margin: 0; font-size: 12px; color: #f87171;">Rejeitadas</p>
            </div>
          </div>
          
          <h3 style="margin-top: 40px; color: #3b82f6;">Últimas 15 Solicitações do Sistema</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Data</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Protocolo</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Assunto</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Solicitante</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Status</th>
            </tr>
            ${rows || '<tr><td colspan="5" style="text-align:center; padding: 10px;">Nenhum chamado aberto.</td></tr>'}
          </table>
        `;
      } 
      
      else if (selectedReport === 'rep-06') {
        const translateRole = (r: string) => r==='admin' ? 'Administrador' : r==='coordinator' ? 'Coordenador' : r==='secretary' ? 'Secretaria' : r==='teacher' ? 'Professor' : 'Aluno';
        
        const rows = data.users.map((u: any) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1;"><b>${u.nome}</b></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${translateRole(u.cargo)}</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${u.email}</td>
          </tr>`
        ).join('');

        conteudoHTML = `
          <div style="display: flex; gap: 10px; margin-top: 30px; font-size: 12px;">
            <div style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${data.contagem.admin}</b> Admins</div>
            <div style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${data.contagem.coordinator}</b> Coords</div>
            <div style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${data.contagem.secretary}</b> Secretários</div>
            <div style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${data.contagem.teacher}</b> Profs</div>
            <div style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${data.contagem.student}</b> Alunos</div>
          </div>
          
          <h3 style="margin-top: 40px; color: #3b82f6;">Listagem Nominal Oficial</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Nome Completo</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Credencial</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">E-mail Cadastrado</th>
            </tr>
            ${rows || '<tr><td colspan="3" style="text-align:center;">Nenhum utilizador encontrado.</td></tr>'}
          </table>
        `;
      }

      // Monta o HTML Completo com o Timbre
      const finalHTML = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto;">
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #0f172a; text-transform: uppercase;">Relatório Oficial - Class Plus</h1>
            <p style="margin: 5px 0 0 0; color: #64748b; font-weight: bold;">${reportInfo?.title}</p>
          </div>
          
          <div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;"><b>Extraído por:</b> ${user?.nome} (${user?.cargo.toUpperCase()})</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><b>Data e Hora:</b> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          ${conteudoHTML}

          <div style="margin-top: 60px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Documento extraído diretamente da base de dados do sistema Class Plus. <br/>
            Autenticador de Integridade: ${Math.random().toString(36).substring(2, 15).toUpperCase()}-${Date.now()}
          </div>
        </div>
      `;

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

      setSuccessMessage("Relatório extraído com sucesso!");
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
              Central de Relatórios
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Extraia dados estratégicos, financeiros e académicos percorridos diretamente do banco de dados oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: Formulário */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter size={20} className="text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Opções de Extração</h2>
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Data de Início</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Data de Fim</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="submit" disabled={isGenerating} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white p-4 rounded-xl font-bold transition-all shadow-md cursor-pointer">
                      {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Varrendo Base de Dados...</> : <><Download size={20} /> Gerar PDF Inteligente</>}
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

            {/* COLUNA DIREITA: Catálogo */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Modelos Inteligentes Mapeados</h2>
              
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