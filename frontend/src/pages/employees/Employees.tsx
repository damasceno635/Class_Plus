import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Plus, Eye, Pencil, Trash2, FileText, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import html2pdf from "html2pdf.js";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  ra: string;
  contrato: any;
  status: "Ativo" | "Inativo";
}

const statusColorMap: Record<string, string> = {
  Ativo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inativo: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const { user } = useAuth();
  const isAdmin = user?.cargo === "admin";

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function carregarFuncionarios() {
      try {
        // Envia a página desejada para o backend
        const response = await api.get(`/funcionarios?page=${paginaAtual}&limit=${itemsPerPage}`);
        
        // A resposta está dividida em "data" e "meta"
        setFuncionarios(response.data.data);
        setTotalPaginas(response.data.meta.totalPaginas);
        setTotalItens(response.data.meta.total);
      } catch (error) {
        console.error("Erro", error);
      }
    }
    carregarFuncionarios();
  }, [paginaAtual, itemsPerPage]);

  const filteredFuncionarios = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return funcionarios;
    return funcionarios.filter((f) => f.nome.toLowerCase().includes(term) || f.ra.toLowerCase().includes(term));
  }, [funcionarios, searchTerm]);

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o(a) funcionário(a) ${nome}?`)) return;
    try {
      await api.delete(`/funcionarios/${id}`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
      setFeedback({ type: "success", message: `Funcionário removido com sucesso.` });
    } catch (error: any) {
      setFeedback({ type: "error", message: "Erro ao excluir." });
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // FUNÇÃO PARA GERAR PDF DIRETO DA LISTA
  const handleGerarPDFDireto = async (funcionarioBasico: Funcionario) => {
    try {
      setGerandoPdfId(funcionarioBasico.id); // Faz o botão girar
      
      // 1. Busca os dados completos deste funcionário no backend
      const response = await api.get(`/funcionarios/${funcionarioBasico.id}`);
      const func = response.data;

      // 2. Monta um documento HTML usando inline-styles
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
          <div style="display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            ${func.foto ? `<img src="${func.foto}" crossorigin="anonymous" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-right: 20px;" />` : `<div style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; margin-right: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">Sem foto</div>`}
            <div>
              <h1 style="margin: 0; font-size: 26px; color: #0f172a;">${func.nome}</h1>
              <p style="margin: 5px 0 0 0; font-size: 15px; color: #64748b;">Cargo: <strong style="color:#0f172a;">${func.cargo}</strong> | RA: <strong style="color:#0f172a;">${func.ra}</strong></p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Dados Pessoais</h2>
                <p style="margin: 4px 0; font-size: 14px;"><strong>CPF:</strong> ${func.cpf}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Contato:</strong> ${func.celular}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${func.email}</p>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Vínculo Empregatício</h2>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> ${func.status}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Contrato:</strong> ${func.contrato.tipo} (${func.contrato.periodo})</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Data Fim:</strong> ${func.contrato.dataFim}</p>
              </td>
            </tr>
          </table>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Endereço Residencial</h2>
            <p style="margin: 4px 0; font-size: 14px;">${func.endereco.rua}, Nº ${func.endereco.numero} ${func.endereco.bloco ? '- Bloco ' + func.endereco.bloco : ''} ${func.endereco.quadra ? '- Quadra ' + func.endereco.quadra : ''}</p>
            <p style="margin: 4px 0; font-size: 14px;">${func.endereco.cidade} - ${func.endereco.estado} | CEP: ${func.endereco.cep}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Alocação de Disciplinas</h2>
            ${func.disciplinas.length > 0 ? func.disciplinas.map((d: any) => `
              <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 14px;"><strong>${d.nome}</strong> (${d.carga}) - Turma: ${d.turma} | ${d.periodo}</p>
              </div>
            `).join('') : '<p style="color: #64748b; font-size: 14px;">Nenhuma disciplina alocada.</p>'}
          </div>

          <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            Ficha Cadastral de Colaborador emitida pelo sistema Class Plus em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      `;

      // 3. Converte a string HTML num elemento DOM para o gerador de PDF ler
      const container = document.createElement('div');
      container.innerHTML = htmlContent;

      const opcoes = {
        margin: 10,
        filename: `Ficha_Colaborador_${func.ra}_${func.nome.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const } 
      };

      // 4. Gera e baixa o PDF
      await html2pdf().set(opcoes).from(container).save();

    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      setFeedback({ type: "error", message: "Erro ao buscar os dados para gerar o PDF." });
    } finally {
      setGerandoPdfId(null); 
    }
  };

  function setCurrentPage(page: number) {
    // garante página dentro dos limites e atualiza o estado
    const p = Math.max(1, Math.min(page, totalPaginas || 1));
    setPaginaAtual(p);
    // rola a área principal para o topo para melhorar a navegação
    try {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Funcionários</h1>
              <p className="text-slate-500 dark:text-slate-400">Gestão e controle de colaboradores</p>
            </div>
            {isAdmin && (
              <Link
                to="/funcionarios/novo"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all w-fit"
              >
                <Plus size={18} /> Novo Funcionário
              </Link>
            )}
          </div>

          {feedback && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${feedback.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
              {feedback.message}
            </div>
          )}

          {/* Busca e Paginação Topo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou RA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <Th>Registro</Th>
                    <Th>Nome</Th>
                    <Th>Cargo</Th>              
                    <Th>Contrato</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuncionarios.map((funcionario) => (
                    <tr key={funcionario.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Td>{funcionario.ra}</Td>
                      <Td className="font-medium text-slate-800 dark:text-white">{funcionario.nome}</Td>
                      <Td>{funcionario.cargo}</Td>
                      <Td>{funcionario.contrato}</Td>
                      <Td>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColorMap[funcionario.status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {funcionario.status}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {/* Visualizar */}
                          <Link 
                            to={`/funcionarios/visualizar/${funcionario.id}`} 
                            aria-label={`Visualizar ${funcionario.nome}`}
                            title="Visualizar"
                            className="p-2 rounded-xl transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Gerar PDF direto da lista */}
                          <button 
                            onClick={() => handleGerarPDFDireto(funcionario)}
                            disabled={gerandoPdfId === funcionario.id}
                            aria-label={`Gerar ficha de ${funcionario.nome}`}
                            title="Gerar PDF"
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              gerandoPdfId === funcionario.id 
                                ? 'bg-emerald-100 text-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-wait opacity-70' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                              }`}
                          >
                            {gerandoPdfId === funcionario.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <FileText size={16} />
                            )}
                          </button>

                          {/* Editar e Excluir só para Admin */}
                          {isAdmin && (
                            <>
                              <Link 
                                to={`/funcionarios/editar/${funcionario.id}`} 
                                aria-label={`Editar ${funcionario.nome}`}
                                title="Editar"
                                className="p-2 rounded-xl transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                              >
                                <Pencil size={16} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(funcionario.id, funcionario.nome)} 
                                aria-label={`Excluir ${funcionario.nome}`}
                                title="Excluir"
                                className="p-2 rounded-xl transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFuncionarios.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  Nenhum funcionário encontrado.
                </div>
              )}
            </div>
          </div>

          {/* PAGINAÇÃO */}
          {totalItens > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando {(paginaAtual - 1) * itemsPerPage + 1} - {Math.min(paginaAtual * itemsPerPage, totalItens)} de {totalItens} registros
              </div>
              <div className="flex items-center gap-2">
                
                {/* Botão Primeira Página */}
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Primeira página"
                >
                  <ChevronsLeft size={18} />
                </button>
                
                {/* Botão Página Anterior */}
                <button 
                  onClick={() => setCurrentPage(paginaAtual - 1)} 
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Números das Páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPaginas <= 5) pageNum = i + 1;
                    else if (paginaAtual <= 3) pageNum = i + 1;
                    else if (paginaAtual >= totalPaginas - 2) pageNum = totalPaginas - 4 + i;
                    else pageNum = paginaAtual - 2 + i;
                    if (pageNum < 1 || pageNum > totalPaginas) return null;
                    return (
                      <button 
                        key={pageNum} 
                        onClick={() => setCurrentPage(pageNum)} 
                        className={`w-10 h-10 rounded-xl font-semibold transition ${pageNum === paginaAtual ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botão Próxima Página */}
                <button 
                  onClick={() => setCurrentPage(paginaAtual + 1)} 
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Próxima página"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Botão Última Página */}
                <button 
                  onClick={() => setCurrentPage(totalPaginas)} 
                  disabled={paginaAtual === totalPaginas}
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

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}>{children}</td>;
}