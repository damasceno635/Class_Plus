import { useState } from "react";
import { Download, Copy, CheckCircle2, AlertCircle, Clock, DollarSign } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

interface Fatura {
  id: string;
  referencia: string;
  vencimento: string;
  valor: number;
  status: "Pago" | "Pendente" | "Atrasado";
}

const MOCK_FATURAS: Fatura[] = [
  { id: "FAT-2605", referencia: "Mensalidade - Maio/2026", vencimento: "2026-05-10", valor: 850.00, status: "Pendente" },
  { id: "FAT-2604", referencia: "Mensalidade - Abril/2026", vencimento: "2026-04-10", valor: 850.00, status: "Pago" },
  { id: "FAT-2603", referencia: "Mensalidade - Março/2026", vencimento: "2026-03-10", valor: 850.00, status: "Pago" },
  { id: "FAT-2602", referencia: "Taxa de Material Anual", vencimento: "2026-02-15", valor: 350.00, status: "Pago" },
];

export default function StudentFinance() {
  const [faturas] = useState<Fatura[]>(MOCK_FATURAS);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pago": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Pendente": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Atrasado": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const copiarPix = () => {
    alert("Código PIX copiado para a área de transferência!");
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (dataStr: string) => {
    return dataStr.split("-").reverse().join("/");
  };

  const proximaFatura = faturas.find(f => f.status === "Pendente" || f.status === "Atrasado");

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meu Financeiro</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhe suas mensalidades e realize pagamentos.</p>
          </div>

          {/* Destaque - Próxima Fatura */}
          {proximaFatura && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <DollarSign size={32} />
                </div>
                <div>
                  <p className="text-blue-100 font-medium mb-1">{proximaFatura.referencia}</p>
                  <h2 className="text-4xl font-black">{formatarMoeda(proximaFatura.valor)}</h2>
                  <p className={`text-sm mt-2 font-semibold ${proximaFatura.status === "Atrasado" ? "text-red-300" : "text-blue-100"}`}>
                    Vencimento: {formatarData(proximaFatura.vencimento)} {proximaFatura.status === "Atrasado" && "(Atrasado)"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={copiarPix} className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Copy size={18} /> Copiar PIX
                </button>
                <button className="px-6 py-3 bg-blue-800 text-white hover:bg-blue-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-500">
                  <Download size={18} /> Baixar Boleto
                </button>
              </div>
            </div>
          )}

          {/* Histórico */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Histórico de Faturas</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Referência</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Vencimento</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Valor</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {faturas.map((fat) => (
                    <tr key={fat.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{fat.referencia}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatarData(fat.vencimento)}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{formatarMoeda(fat.valor)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(fat.status)}`}>
                          {fat.status === "Pago" && <CheckCircle2 size={14} />}
                          {fat.status === "Pendente" && <Clock size={14} />}
                          {fat.status === "Atrasado" && <AlertCircle size={14} />}
                          {fat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button disabled={fat.status !== "Pago"} className={`p-2 rounded-xl inline-flex ${fat.status === "Pago" ? "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}>
                          <Download size={18} />
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