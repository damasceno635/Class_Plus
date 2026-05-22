import { useState } from "react";
import { Search, FileText, Send, CheckCircle2, AlertCircle, Clock, DollarSign } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const MOCK_ALUNOS_FINANCEIRO = [
  { id: "202601", nome: "Ana Beatriz Souza", turma: "8º Ano A", statusMensalidade: "Em Dia", ultimaPaga: "Maio/2026" },
  { id: "202602", nome: "Carlos Eduardo Mendes", turma: "8º Ano A", statusMensalidade: "Atrasado", ultimaPaga: "Março/2026", diasAtraso: 25 },
  { id: "202603", nome: "Fernanda Costa Silva", turma: "9º Ano B", statusMensalidade: "Pendente", ultimaPaga: "Abril/2026", diasAtraso: 0 },
];

export default function SecretaryFinance() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_ALUNOS_FINANCEIRO.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm));

  const darBaixaManual = (nome: string) => {
    alert(`Pagamento registrado no caixa para o aluno(a) ${nome}.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Controle de Mensalidades</h1>
            <p className="text-slate-500 dark:text-slate-400">Atendimento financeiro, emissão de boletos e registro de pagamentos.</p>
          </div>

          <div className="mb-6 max-w-md relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por aluno ou matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Aluno</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Turma</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Última Paga</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status Financeiro</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Ações Operacionais</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((aluno) => (
                    <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-white">{aluno.nome}</p>
                        <p className="text-xs text-slate-500">Matrícula: {aluno.id}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{aluno.turma}</td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{aluno.ultimaPaga}</td>
                      <td className="px-6 py-4">
                        {aluno.statusMensalidade === "Em Dia" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 size={14}/> Em Dia</span>}
                        {aluno.statusMensalidade === "Pendente" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={14}/> Vence Hoje</span>}
                        {aluno.statusMensalidade === "Atrasado" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle size={14}/> {aluno.diasAtraso} dias de atraso</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button title="Gerar 2ª Via do Boleto" className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition"><FileText size={18}/></button>
                          <button title="Enviar Cobrança por Email/WhatsApp" className="p-2 bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg transition"><Send size={18}/></button>
                          <button onClick={() => darBaixaManual(aluno.nome)} title="Dar baixa manual (Pagamento no balcão)" className="p-2 bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-green-400 rounded-lg transition"><DollarSign size={18} className="lucide lucide-dollar-sign"/></button>
                        </div>
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