import { useState, useEffect } from "react";
import { Download, Copy, CheckCircle2, AlertCircle, Clock, DollarSign, Loader2, FileText } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { api } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import html2pdf from "html2pdf.js";

interface Fatura {
  id: string;
  referencia: string;
  vencimento: string;
  valor: number;
  status: "Pago" | "Pendente" | "Atrasado";
}

export default function StudentFinance() {
  const { user } = useAuth(); // Pega os dados do aluno logado (para o nome no recibo)
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null); // Controle de loading individual dos botões

  useEffect(() => {
    async function carregarFinanceiro() {
      try {
        const response = await api.get('/financeiro/aluno');
        setFaturas(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarFinanceiro();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pago": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Pendente": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Atrasado": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136pix@classplus.com.br5204000053039865802BR5903BRL6005850.006206Caxias6304123454041234");
    alert("Código PIX copiado para a área de transferência!");
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (dataStr: string) => {
    return dataStr.split("-").reverse().join("/");
  };

  // GERADOR DE PDF (BOLETO OU RECIBO)
  const handleGerarDocumento = async (fatura: Fatura, tipo: "boleto" | "recibo") => {
    setGerandoPdfId(fatura.id);

    let htmlContent = "";

    if (tipo === "boleto") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a;">Boleto / PIX de Cobrança</h1>
            <p style="margin: 5px 0 0 0; color: #64748b;">Class Plus - Instituição de Ensino</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Pagador:</strong> ${user?.nome || 'Aluno(a)'}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Referência:</strong> ${fatura.referencia}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Vencimento:</strong> ${formatarData(fatura.vencimento)}</td></tr>
            <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 18px;"><strong>Valor a Pagar:</strong> ${formatarMoeda(fatura.valor)}</td></tr>
          </table>
          <div style="text-align: center; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 10px; background: #f8fafc;">
            <p style="margin-bottom: 10px; font-weight: bold; color: #0f172a;">Chave PIX Copia e Cola</p>
            <p style="font-family: monospace; word-break: break-all; font-size: 12px; color: #475569; background: #e2e8f0; padding: 10px; border-radius: 5px;">00020126580014br.gov.bcb.pix0136pix@classplus.com.br5204000053039865802BR5903BRL6005${fatura.valor.toFixed(2)}6206Caxias6304123454041234</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 15px;">Para pagar, copie o código acima e cole na área "PIX Copia e Cola" do aplicativo do seu banco.</p>
          </div>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #0f172a;">RECIBO DE PAGAMENTO</h1>
            <p style="margin: 5px 0 0 0; color: #64748b;">Class Plus - Instituição de Ensino</p>
          </div>
          <p style="font-size: 18px; line-height: 1.8; text-align: justify; margin-bottom: 40px;">
            Recebemos de <strong>${user?.nome || 'Aluno(a)'}</strong>, a quantia de <strong>${formatarMoeda(fatura.valor)}</strong>, 
            referente ao pagamento integral da <strong>${fatura.referencia}</strong>, com vencimento original em ${formatarData(fatura.vencimento)}.
          </p>
          <p style="font-size: 16px; margin-bottom: 60px;">Para maior clareza, firmamos o presente documento dando plena e geral quitação deste valor.</p>
          <div style="text-align: center; margin-top: 60px;">
            <p style="margin-bottom: 5px;">___________________________________________________</p>
            <p style="margin: 0; font-weight: bold; color: #0f172a;">Departamento Financeiro - Class Plus</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">
              Autenticação e Emissão Digital em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      `;
    }

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const prefix = tipo === "boleto" ? "Boleto" : "Recibo";
    const opcoes = {
      margin: 15,
      filename: `${prefix}_${fatura.referencia.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    try {
      await html2pdf().set(opcoes).from(container).save();
    } catch (err) {
      alert("Erro ao gerar o PDF.");
    } finally {
      setGerandoPdfId(null);
    }
  };

  const proximaFatura = faturas.find(f => f.status === "Atrasado") || faturas.find(f => f.status === "Pendente");

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meu Financeiro</h1>
            <p className="text-slate-500 dark:text-slate-400">Acompanhe as suas mensalidades e realize pagamentos.</p>
          </div>

          {/* Próxima Fatura */}
          {proximaFatura && (
            <div className={`rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6 ${proximaFatura.status === 'Atrasado' ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <DollarSign size={32} />
                </div>
                <div>
                  <p className="text-white/80 font-medium mb-1">{proximaFatura.referencia}</p>
                  <h2 className="text-4xl font-black">{formatarMoeda(proximaFatura.valor)}</h2>
                  <p className={`text-sm mt-2 font-bold ${proximaFatura.status === "Atrasado" ? "text-yellow-300" : "text-blue-100"}`}>
                    Vencimento: {formatarData(proximaFatura.vencimento)} {proximaFatura.status === "Atrasado" && "⚠️ (ATRASADO)"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={copiarPix} className={`px-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${proximaFatura.status === 'Atrasado' ? 'bg-white text-red-700 hover:bg-red-50' : 'bg-white text-blue-700 hover:bg-blue-50'}`}>
                  <Copy size={18} /> Copiar PIX
                </button>
                <button 
                  onClick={() => handleGerarDocumento(proximaFatura, "boleto")}
                  disabled={gerandoPdfId === proximaFatura.id}
                  className={`px-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border disabled:opacity-70 ${proximaFatura.status === 'Atrasado' ? 'bg-red-800 text-white hover:bg-red-900 border-red-500' : 'bg-blue-800 text-white hover:bg-blue-900 border-blue-500'}`}
                >
                  {gerandoPdfId === proximaFatura.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                  {gerandoPdfId === proximaFatura.id ? "Gerando..." : "Baixar Boleto"}
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
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {faturas.map((fat) => (
                    <tr key={fat.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
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
                        <button 
                          onClick={() => handleGerarDocumento(fat, fat.status === "Pago" ? "recibo" : "boleto")}
                          disabled={gerandoPdfId === fat.id}
                          title={fat.status === "Pago" ? "Descarregar Recibo de Pagamento" : "Descarregar Boleto de Cobrança"} 
                          className={`p-2 rounded-xl inline-flex transition-colors ${fat.status === "Pago" ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50" : "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"}`}
                        >
                          {gerandoPdfId === fat.id ? <Loader2 size={18} className="animate-spin" /> : (fat.status === "Pago" ? <FileText size={18} /> : <Download size={18} />)}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {faturas.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-500">Nenhum registo financeiro encontrado.</td></tr>
                  )}
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