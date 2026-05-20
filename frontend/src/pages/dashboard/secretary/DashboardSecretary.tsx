import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MetricCard from "../../../components/layout/MetricCard";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlusCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

// Dados mockados
const matriculasPorMes = [
  { mes: "Jan", matriculas: 45, renovacoes: 120 },
  { mes: "Fev", matriculas: 38, renovacoes: 115 },
  { mes: "Mar", matriculas: 52, renovacoes: 128 },
  { mes: "Abr", matriculas: 48, renovacoes: 122 },
  { mes: "Mai", matriculas: 35, renovacoes: 118 },
  { mes: "Jun", matriculas: 42, renovacoes: 125 },
];

const documentosPendentes = [
  { id: 1, aluno: "Carlos Eduardo", documento: "Certidão de Nascimento", data: "10/06/2026", status: "pendente" },
  { id: 2, aluno: "Fernanda Lima", documento: "Comprovante de Residência", data: "12/06/2026", status: "pendente" },
  { id: 3, aluno: "Rafael Souza", documento: "Histórico Escolar", data: "15/06/2026", status: "atrasado" },
  { id: 4, aluno: "Beatriz Oliveira", documento: "Documento de Identidade", data: "18/06/2026", status: "pendente" },
];

const solicitacoesRecentes = [
  { id: 1, tipo: "Transferência", aluno: "Lucas Andrade", data: "05/06/2026", status: "em_andamento" },
  { id: 2, tipo: "2ª Via Boletim", aluno: "Mariana Costa", data: "06/06/2026", status: "concluido" },
  { id: 3, tipo: "Declaração", aluno: "Thiago Santos", data: "07/06/2026", status: "pendente" },
];

export default function DashboardSecretary() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Dashboard Secretaria
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Gestão de matrículas, documentos e atendimentos
                </p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                <PlusCircle size={18} /> Nova Matrícula
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <MetricCard title="Total de Alunos" value="1.245" icon={<Users />} trend={8} />
            <MetricCard title="Matrículas 2026" value="312" icon={<TrendingUp />} trend={12} />
            <MetricCard title="Documentos Pendentes" value="18" icon={<FileText />} trend={-5} />
            <MetricCard title="Atendimentos Mês" value="156" icon={<Calendar />} trend={3} />
          </div>

          {/* Gráfico de Matrículas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                Movimento de Matrículas 2026
              </h2>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Download size={18} /> Exportar Relatório
              </button>
            </div>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matriculasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="matriculas" name="Novas Matrículas" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="renovacoes" name="Renovações" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documentos Pendentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                    Documentos Pendentes
                  </h2>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-semibold">
                  {documentosPendentes.length}
                </span>
              </div>
              <div className="space-y-3">
                {documentosPendentes.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{doc.aluno}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{doc.documento}</p>
                      <p className="text-xs text-slate-400">Vencimento: {doc.data}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'atrasado' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solicitações Recentes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-500" size={24} />
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                    Solicitações Recentes
                  </h2>
                </div>
                <button className="text-blue-600 text-sm hover:underline">Ver todas</button>
              </div>
              <div className="space-y-3">
                {solicitacoesRecentes.map((solic) => (
                  <div key={solic.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      {solic.status === 'concluido' ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : solic.status === 'em_andamento' ? (
                        <Clock className="text-blue-500" size={20} />
                      ) : (
                        <AlertTriangle className="text-yellow-500" size={20} />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{solic.tipo}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{solic.aluno}</p>
                        <p className="text-xs text-slate-400">{solic.data}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabela de Alunos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                Últimas Matrículas
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 w-full sm:w-64"
                  />
                </div>
                <select className="px-4 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700">
                  <option value="">Todos os status</option>
                  <option value="matriculado">Matriculado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-3 px-3">Aluno</th>
                    <th className="text-left py-3 px-3">Turma</th>
                    <th className="text-left py-3 px-3">Data Matrícula</th>
                    <th className="text-left py-3 px-3">Status</th>
                    <th className="text-left py-3 px-3">Ações</th>
                   </tr>
                </thead>
                <tbody>
                  {[
                    { aluno: "Amanda Silva", turma: "1º A", data: "05/06/2026", status: "matriculado" },
                    { aluno: "Bruno Costa", turma: "2º B", data: "03/06/2026", status: "matriculado" },
                    { aluno: "Carla Souza", turma: "3º A", data: "01/06/2026", status: "pendente" },
                  ].map((aluno, index) => (
                    <tr key={index} className="border-b dark:border-slate-800">
                      <td className="py-3 px-3">{aluno.aluno}</td>
                      <td className="py-3 px-3">{aluno.turma}</td>
                      <td className="py-3 px-3">{aluno.data}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          aluno.status === 'matriculado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {aluno.status === 'matriculado' ? 'Matriculado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}