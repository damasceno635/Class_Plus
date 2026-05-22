import { useState, useMemo } from "react";
import { 
  FileBarChart, 
  Download, 
  FileText, 
  PieChart, 
  DollarSign, 
  Users, 
  GraduationCap,
  ClipboardList,
  CheckCircle,
  Loader2,
  Filter
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../contexts/AuthContext";

type ReportCategory = "academic" | "financial" | "operational" | "general";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  icon: React.ReactNode;
  rolesAllowed: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "rep-01",
    title: "Desempenho Académico Global",
    description: "Médias gerais por turma, disciplina e comparativos de aprovação.",
    category: "academic",
    icon: <GraduationCap size={24} className="text-blue-500" />,
    rolesAllowed: ["admin", "coordinator"],
  },
  {
    id: "rep-02",
    title: "Frequência e Assiduidade",
    description: "Lista de alunos com faltas críticas (abaixo de 75%) no semestre atual.",
    category: "academic",
    icon: <Users size={24} className="text-blue-500" />,
    rolesAllowed: ["admin", "coordinator", "secretary"],
  },
  {
    id: "rep-03",
    title: "Inadimplência e Faturas",
    description: "Relatório de mensalidades em atraso detalhado por responsável financeiro.",
    category: "financial",
    icon: <DollarSign size={24} className="text-green-500" />,
    rolesAllowed: ["admin", "secretary"],
  },
  {
    id: "rep-04",
    title: "Demonstração de Resultados (DRE)",
    description: "Balanço de receitas, despesas e saldo operacional do período selecionado.",
    category: "financial",
    icon: <PieChart size={24} className="text-green-500" />,
    rolesAllowed: ["admin"],
  },
  {
    id: "rep-05",
    title: "Log de Requisições e Protocolos",
    description: "Métricas de atendimento, tempo de resposta (SLA) e volume de chamados.",
    category: "operational",
    icon: <ClipboardList size={24} className="text-amber-500" />,
    rolesAllowed: ["admin", "secretary", "coordinator"],
  },
  {
    id: "rep-06",
    title: "Listagem de Utilizadores Ativos",
    description: "Relação completa de alunos, professores e funcionários ativos no sistema.",
    category: "general",
    icon: <FileText size={24} className="text-purple-500" />,
    rolesAllowed: ["admin", "secretary"],
  }
];

export default function Reports() {
  const { user } = useAuth();
  
  // Estados para geração de relatório
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtra os relatórios que o utilizador atual pode ver
  const availableReports = useMemo(() => {
    if (!user) return [];
    return REPORT_TEMPLATES.filter(rep => rep.rolesAllowed.includes(user.cargo));
  }, [user]);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) {
      alert("Por favor, selecione o tipo de relatório que deseja exportar.");
      return;
    }

    setIsGenerating(true);
    setSuccessMessage(null);

    // Simula o tempo de extração de dados e geração do PDF/Excel
    setTimeout(() => {
      setIsGenerating(false);
      setSuccessMessage("Relatório gerado com sucesso! O download começará automaticamente.");
      
      // Limpa a mensagem após alguns segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 2000);
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
              Extraia dados estratégicos, financeiros e académicos da instituição.
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
                    <input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Período Final (Opcional)</label>
                    <input 
                      type="date" 
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      type="submit" 
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white p-4 rounded-xl font-bold transition-all shadow-md cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Processando Dados...
                        </>
                      ) : (
                        <>
                          <Download size={20} /> Extrair Relatório (PDF)
                        </>
                      )}
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
                      selectedReport === report.id 
                        ? "bg-blue-50 border-blue-500 shadow-md dark:bg-blue-900/20 dark:border-blue-500" 
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {report.icon}
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{report.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-end">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        selectedReport === report.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                      }`}>
                        {selectedReport === report.id ? "Selecionado" : "Selecionar"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {availableReports.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-500 font-medium">O seu perfil não possui relatórios vinculados no momento.</p>
                </div>
              )}
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}