import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Plus, Eye, Pencil, Trash2, FileText, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext"; 
import html2pdf from "html2pdf.js";

type Aluno = {
  id: string; 
  matricula: string;
  nome: string;
  status: string;
  nivel: string;
  ano: string;
  serie: string;
  anoLetivo: string;
};

const statusColorMap: Record<string, string> = {
  Matriculado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Pré-Matriculado": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Transferido: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Inativo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function Alunos() {
  const { user } = useAuth(); 
  const isCoordinator = user?.cargo === "coordinator";

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null);
  
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function carregarAlunos() {
      try {
        // Envia a página e o limite desejados para o backend
        const response = await api.get(`/alunos?page=${paginaAtual}&limit=${itemsPerPage}`);
        
        // Resposta está dividida em "data" e "meta"
        setAlunos(response.data.data); 
        setTotalPaginas(response.data.meta.totalPaginas);
        setTotalItens(response.data.meta.total);
      } catch (error) {
        console.error("Erro", error);
      }
    }
    carregarAlunos();
  }, [paginaAtual, itemsPerPage]);

  const filteredAlunos = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return alunos;
    return alunos.filter(
      (aluno) =>
        aluno.nome.toLowerCase().includes(term) ||
        aluno.matricula.includes(term)
    );
  }, [alunos, searchTerm]); 

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o(a) aluno(a) ${nome}?`)) return;
    try { 
      await api.delete(`/alunos/${id}`);
      setAlunos((prev) => prev.filter((a) => a.id !== id));
      setFeedback({ type: "success", message: "Aluno e acessos excluídos com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao excluir", error);
      setFeedback({ type: "error", message: error.response?.data?.error || "Erro ao excluir o aluno. Tente novamente." });
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleGerarPDFDireto = async (alunoBasico: Aluno) => {
    try {
      setGerandoPdfId(alunoBasico.id); 
      
      const response = await api.get(`/alunos/${alunoBasico.id}`);
      const aluno = response.data;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto;">
          <div style="display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            ${aluno.foto ? `<img src="${aluno.foto}" crossorigin="anonymous" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-right: 20px;" />` : `<div style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; margin-right: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">Sem foto</div>`}
            <div>
              <h1 style="margin: 0; font-size: 26px; color: #0f172a;">${aluno.nome}</h1>
              <p style="margin: 5px 0 0 0; font-size: 15px; color: #64748b;">Matrícula: <strong style="color:#0f172a;">${aluno.matricula}</strong> | Status: <strong style="color:#0f172a;">${aluno.status}</strong></p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Dados Pessoais</h2>
                <p style="margin: 4px 0; font-size: 14px;"><strong>CPF:</strong> ${aluno.cpf}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Nasc:</strong> ${aluno.nascimento}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Sexo:</strong> ${aluno.sexo}</p>
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Informações Académicas</h2>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Nível:</strong> ${aluno.nivel}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Turma:</strong> ${aluno.ano} ${aluno.serie}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Ano Letivo:</strong> ${aluno.anoLetivo}</p>
              </td>
            </tr>
          </table>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Endereço Residencial</h2>
            <p style="margin: 4px 0; font-size: 14px;">${aluno.endereco.rua}, ${aluno.endereco.numero} ${aluno.endereco.bloco ? '- Bloco ' + aluno.endereco.bloco : ''} ${aluno.endereco.quadra ? '- Quadra ' + aluno.endereco.quadra : ''}</p>
            <p style="margin: 4px 0; font-size: 14px;">${aluno.endereco.cidade} - ${aluno.endereco.estado} | CEP: ${aluno.endereco.cep}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Responsáveis</h2>
            ${aluno.responsaveis.length > 0 ? aluno.responsaveis.map((r: any) => `
              <div style="margin-bottom: 10px; background: #f8fafc; padding: 10px 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>${r.nome}</strong> (${r.parentesco})</p>
                <p style="margin: 0; color: #475569; font-size: 13px;">CPF: ${r.cpf} | Tel: ${r.contato} | Email: ${r.email}</p>
              </div>
            `).join('') : '<p style="color: #64748b; font-size: 14px;">Nenhum responsável cadastrado.</p>'}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Deficiências / Necessidades</h2>
                ${aluno.deficiencias.length > 0 ? `<ul style="margin: 0; padding-left: 20px; font-size: 14px;">${aluno.deficiencias.map((d: any) => `<li>${d.nome} (Apoio: ${d.apoio})</li>`).join('')}</ul>` : '<p style="color: #64748b; font-size: 14px;">Nenhuma informada.</p>'}
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 15px;">
                <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Alergias</h2>
                ${aluno.alergias.length > 0 ? `<ul style="margin: 0; padding-left: 20px; font-size: 14px;">${aluno.alergias.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : '<p style="color: #64748b; font-size: 14px;">Nenhuma informada.</p>'}
              </td>
            </tr>
          </table>
          
          <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            Ficha Cadastral gerada pelo sistema Class Plus em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = htmlContent;

      const opcoes = {
        margin: 10,
        filename: `Ficha_${alunoBasico.matricula}_${alunoBasico.nome.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      } as const;

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Alunos
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Gestão acadêmica de estudantes
              </p>
            </div>
            
            {/* OCULTO PARA COORDENADOR */}
            {!isCoordinator && (
              <Link
                to="/alunos/novo"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all w-fit"
              >
                <Plus size={18} />
                Novo Aluno
              </Link>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
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
                placeholder="Buscar por nome ou matrícula..."
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

          {/* Tabela */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <Th>Matrícula</Th>
                    <Th>Nome</Th>
                    <Th>Status</Th>
                    <Th className="hidden md:table-cell">Nível</Th>
                    <Th>Turma</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno) => (
                    <tr
                      key={aluno.id}
                      className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Td>{aluno.matricula}</Td>
                      <Td className="font-medium text-slate-800 dark:text-white">{aluno.nome}</Td>
                      <Td>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            statusColorMap[aluno.status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {aluno.status}
                        </span>
                      </Td>
                      <Td className="hidden md:table-cell">{aluno.nivel}</Td>
                      <Td>{`${aluno.ano} ${aluno.serie}`}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {/* Visualizar */}
                          <Link
                            to={`/alunos/visualizar/${aluno.id}`}
                            aria-label={`Visualizar ${aluno.nome}`}
                            title="Visualizar"
                            className="p-2 rounded-xl transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Gerar PDF */}
                          <button
                            onClick={() => handleGerarPDFDireto(aluno)}
                            disabled={gerandoPdfId === aluno.id}
                            aria-label={`Gerar ficha de ${aluno.nome}`}
                            title="Gerar PDF"
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              gerandoPdfId === aluno.id
                                ? 'bg-emerald-100 text-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-wait opacity-70'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                            }`}
                          >
                            {gerandoPdfId === aluno.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <FileText size={16} />
                            )}
                          </button>

                          {/* Editar - Oculto para Coordenador */}
                          {!isCoordinator && (
                            <Link
                              to={`/alunos/editar/${aluno.id}`}
                              aria-label={`Editar ${aluno.nome}`}
                              title="Editar"
                              className="p-2 rounded-xl transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                            >
                              <Pencil size={16} />
                            </Link>
                          )}

                          {/* Excluir - Oculto para Coordenador */}
                          {!isCoordinator && (
                            <button
                              onClick={() => handleDelete(aluno.id, aluno.nome)}
                              aria-label={`Excluir ${aluno.nome}`}
                              title="Excluir"
                              className="p-2 rounded-xl transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAlunos.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  Nenhum aluno encontrado.
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

/* Componentes auxiliares */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap ${className}`}
    >
      {children}
    </td>
  );
}