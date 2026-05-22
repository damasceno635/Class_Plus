import { useState } from "react";
import { CheckCircle2, Clock, Activity, FileText, Search, Eye } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const MOCK_HISTORICO = [
  { id: "REQ-2026-042", tipo: "Justificativa de Falta (Aluno)", status: "Pendente", data: "18/05/2026" },
  { id: "OP-2026-112", tipo: "Impressões (Professor)", status: "Aprovado", data: "20/05/2026" },
  { id: "REQ-2026-001", tipo: "Declaração (Aluno)", status: "Concluído", data: "10/05/2026" },
];

export default function AdminRequests() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_HISTORICO.filter(r => r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.tipo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Geral de Protocolos</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhamento institucional do volume de requisições operacionais e acadêmicas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
                <FileText size={20} /> <span className="font-bold text-sm uppercase">Total no Mês</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">124</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-amber-500">
                <Clock size={20} /> <span className="font-bold text-sm uppercase">Fila de Espera</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">12</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-green-500">
                <CheckCircle2 size={20} /> <span className="font-bold text-sm uppercase">Resolvidos</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">108</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-purple-500">
                <Activity size={20} /> <span className="font-bold text-sm uppercase">Tempo Médio SLA</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-white">4.5h</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Log de Movimentações Recentes</h2>
          
          <div className="mb-4 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar no log global..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Origem</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Inspecionar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">{req.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{req.tipo}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{req.data}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{req.status}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="action-btn bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"><Eye size={16} /></button>
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