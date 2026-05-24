import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText, Pencil, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api"; 

// @ts-ignore - Importação da biblioteca de PDF (ignora falta de tipos nativos se houver)
import html2pdf from "html2pdf.js";

type Aluno = {
  id: string;
  matricula: string;
  nome: string;
  foto: string;
  status: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  nivel: string;
  ano: string;
  serie: string;
  anoLetivo: string;
  endereco: {
    cep: string;
    cidade: string;
    estado: string;
    rua: string;
    bloco: string;
    quadra: string;
    numero: string;
  };
  responsaveis: {
    parentesco: string;
    nome: string;
    cpf: string;
    contato: string;
    email: string;
  }[];
  documentos: string[];
  deficiencias: { nome: string; apoio: string }[];
  alergias: string[];
};

export default function VisualizarAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAluno() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/alunos/${id}`);
        setAluno(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Erro ao carregar dados do aluno do servidor.");
      } finally {
        setLoading(false);
      }
    }
    loadAluno();
  }, [id]);

  // MÁGICA DA GERAÇÃO DO PDF ISOLADO (Substituindo o modelo antigo)
  const handleGerarPDF = () => {
    if (!aluno) return;

    // Monta o template HTML com folhas de estilos embutidas (inline-styles) para o interpretador do PDF
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
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
              <p style="margin: 4px 0; font-size: 14px;"><strong>Nascimento:</strong> ${aluno.nascimento}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Sexo:</strong> ${aluno.sexo}</p>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 15px;">
              <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Informações Acadêmicas</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Nível:</strong> ${aluno.nivel}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Turma:</strong> ${aluno.ano} ${aluno.serie}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Ano Letivo:</strong> ${aluno.anoLetivo}</p>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Endereço Residencial</h2>
          <p style="margin: 4px 0; font-size: 14px;">${aluno.endereco.rua}, Nº ${aluno.endereco.numero} ${aluno.endereco.bloco ? '- Bloco ' + aluno.endereco.bloco : ''} ${aluno.endereco.quadra ? '- Quadra ' + aluno.endereco.quadra : ''}</p>
          <p style="margin: 4px 0; font-size: 14px;">${aluno.endereco.cidade} - ${aluno.endereco.estado} | CEP: ${aluno.endereco.cep}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Responsáveis</h2>
          ${aluno.responsaveis.length > 0 ? aluno.responsaveis.map((r: any) => `
            <div style="margin-bottom: 10px; background: #f8fafc; padding: 10px 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>${r.nome}</strong> (${r.parentesco})</p>
              <p style="margin: 0; color: #475569; font-size: 13px;">CPF: ${r.cpf} | Contato: ${r.contato} | Email: ${r.email}</p>
            </div>
          `).join('') : '<p style="color: #64748b; font-size: 14px;">Nenhum responsável cadastrado.</p>'}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td style="vertical-align: top; width: 50%; padding-right: 15px;">
              <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Deficiências / Apoio</h2>
              ${aluno.deficiencias.length > 0 ? `<ul style="margin: 0; padding-left: 20px; font-size: 14px;">${aluno.deficiencias.map((d: any) => `<li>${d.nome} (Apoio: ${d.apoio})</li>`).join('')}</ul>` : '<p style="color: #64748b; font-size: 14px;">Nenhuma informada.</p>'}
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 15px;">
              <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Alergias</h2>
              ${aluno.alergias.length > 0 ? `<ul style="margin: 0; padding-left: 20px; font-size: 14px;">${aluno.alergias.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : '<p style="color: #64748b; font-size: 14px;">Nenhuma informada.</p>'}
            </td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Ficha Cadastral emitida através do painel Class Plus em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
    `;

    // Converte a estrutura criada para um container DOM temporário
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opcoes = {
      margin: 10,
      filename: `Ficha_Aluno_${aluno.matricula}_${aluno.nome.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    } as const;

    // Executa a compilação do arquivo e inicia o download
    html2pdf().set(opcoes).from(container).save();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-slate-700 dark:text-slate-300">{error || "Aluno não encontrado"}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
                Voltar
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* Menu de Ações Superior (Fica de fora do PDF) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                title="Voltar"
                className="p-2 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ficha do Aluno</h1>
                <p className="text-slate-500 dark:text-slate-400">Visualização completa dos dados</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/alunos/editar/${id}`}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-2xl font-semibold transition-all"
              >
                <Pencil size={18} /> Editar
              </Link>
              <button
                onClick={handleGerarPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all cursor-pointer"
              >
                <FileText size={18} /> Gerar PDF
              </button>
            </div>
          </div>

          {/* AJUSTE: Adicionado o id="ficha-aluno" e um padding extra interno para a impressão ficar perfeita */}
          <div id="ficha-aluno" className="grid xl:grid-cols-3 gap-6 p-2 bg-slate-100 dark:bg-slate-950">
            {/* Perfil */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-5 overflow-hidden">
                  {aluno.foto ? (
                    <img
                      src={aluno.foto}
                      alt={`Foto de ${aluno.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500 dark:text-slate-300 text-sm text-center px-4">
                      Sem foto
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{aluno.nome}</h2>
                <p className="text-slate-500 mt-2">Matrícula: {aluno.matricula}</p>
                <span className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                  {aluno.status}
                </span>
              </div>
            </section>

            {/* Demais seções */}
            <section className="xl:col-span-2 space-y-6">
              <Card title="Dados Pessoais">
                <Info label="CPF" value={aluno.cpf} />
                <Info label="Nascimento" value={aluno.nascimento} />
                <Info label="Sexo" value={aluno.sexo} />
              </Card>
              
              <Card title="Turma">
                <Info label="Nível" value={aluno.nivel} />
                <Info label="Ano/Série" value={`${aluno.ano} ${aluno.serie}`} />
                <Info label="Ano Letivo" value={aluno.anoLetivo} />
              </Card>
              
              <Card title="Endereço">
                <Info label="CEP" value={aluno.endereco.cep} />
                <Info label="Cidade" value={aluno.endereco.cidade} />
                <Info label="Estado" value={aluno.endereco.estado} />
                <Info label="Rua" value={aluno.endereco.rua} />
                <Info label="Bloco" value={aluno.endereco.bloco} />
                <Info label="Quadra" value={aluno.endereco.quadra} />
                <Info label="Número" value={aluno.endereco.numero} />
              </Card>

              <Card title="Responsáveis">
                {aluno.responsaveis.map((r, idx) => (
                  <div key={idx} className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4 last:border-0 last:pb-0">
                    <Info label="Parentesco" value={r.parentesco} />
                    <Info label="Nome" value={r.nome} />
                    <Info label="CPF" value={r.cpf} />
                    <Info label="Contato" value={r.contato} />
                    <Info label="Email" value={r.email} />
                  </div>
                ))}
                {aluno.responsaveis.length === 0 && <p className="text-slate-500">Nenhum responsável cadastrado.</p>}
              </Card>

              <Card title="Documentos">
                {aluno.documentos.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {aluno.documentos.map((docUrl, idx) => {
                      const fileName = docUrl.split('/').pop() || `Documento ${idx + 1}`;
                      const cleanName = fileName.includes('-') ? fileName.split('-').slice(1).join('-') : fileName;

                      return (
                        <a
                          key={idx}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={cleanName}
                          className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium"
                        >
                          <FileText size={18} />
                          <span className="max-w-[200px] truncate">{cleanName}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum documento anexado.</p>
                )}
              </Card>

              <Card title="Deficiências">
                {aluno.deficiencias.length > 0 ? (
                  aluno.deficiencias.map((d, idx) => (
                    <div key={idx} className="mb-2">
                      <Info label="Deficiência" value={d.nome} />
                      <Info label="Precisa de apoio" value={d.apoio} />
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Nenhuma deficiência informada.</p>
                )}
              </Card>

              <Card title="Alergias">
                {aluno.alergias.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {aluno.alergias.map((a) => (
                      <li key={a} className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-medium">
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">Nenhuma allergy informada.</p>
                )}
              </Card>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* Componentes auxiliares */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm break-inside-avoid">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-800 dark:text-white">{value || "—"}</p>
    </div>
  );
}