import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText, Pencil, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

// @ts-ignore
import html2pdf from "html2pdf.js";

type Funcionario = {
  id: string;
  nome: string;
  cargo: string;
  status: string;
  cpf: string;
  ra: string;
  nascimento: string;
  sexo: string;
  celular: string;
  email: string;
  foto: string;
  contrato: { tipo: string; periodo: string; dataFim: string };
  endereco: { cep: string; cidade: string; estado: string; rua: string; bloco: string; quadra: string; numero: string };
  financeiro: { salario: string; pagamento: string };
  disciplinas: { nome: string; carga: string; turma: string; periodo: string }[];
  formacoes: { instituicao: string; cnpj: string; modalidade: string; periodo: string }[];
  experiencias: { empresa: string; cnpj: string; modalidade: string; periodo: string }[];
  documentos: string[];
};

export default function VisualizarFuncionario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFuncionario() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/funcionarios/${id}`);
        setFuncionario(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Erro ao carregar dados do servidor.");
      } finally {
        setLoading(false);
      }
    }
    loadFuncionario();
  }, [id]);

  const handleGerarPDF = async () => {
    if (!funcionario) return;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
        <div style="display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
          ${funcionario.foto ? `<img src="${funcionario.foto}" crossorigin="anonymous" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-right: 20px;" />` : `<div style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; margin-right: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">Sem foto</div>`}
          <div>
            <h1 style="margin: 0; font-size: 26px; color: #0f172a;">${funcionario.nome}</h1>
            <p style="margin: 5px 0 0 0; font-size: 15px; color: #64748b;">Cargo: <strong style="color:#0f172a;">${funcionario.cargo}</strong> | RA: <strong style="color:#0f172a;">${funcionario.ra}</strong></p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td style="vertical-align: top; width: 50%; padding-right: 15px;">
              <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Dados Pessoais</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>CPF:</strong> ${funcionario.cpf}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Contato:</strong> ${funcionario.celular}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${funcionario.email}</p>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 15px;">
              <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Vínculo Empregatício</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> ${funcionario.status}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Contrato:</strong> ${funcionario.contrato.tipo} (${funcionario.contrato.periodo})</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Data Fim:</strong> ${funcionario.contrato.dataFim}</p>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Endereço Residencial</h2>
          <p style="margin: 4px 0; font-size: 14px;">${funcionario.endereco.rua}, Nº ${funcionario.endereco.numero} ${funcionario.endereco.bloco ? '- Bloco ' + funcionario.endereco.bloco : ''} ${funcionario.endereco.quadra ? '- Quadra ' + funcionario.endereco.quadra : ''}</p>
          <p style="margin: 4px 0; font-size: 14px;">${funcionario.endereco.cidade} - ${funcionario.endereco.estado} | CEP: ${funcionario.endereco.cep}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">Alocação de Disciplinas</h2>
          ${funcionario.disciplinas.length > 0 ? funcionario.disciplinas.map((d: any) => `
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

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const opcoes = {
      margin: 10,
      filename: `Ficha_Colaborador_${funcionario.ra}_${funcionario.nome.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    await html2pdf().set(opcoes).from(container).save();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar /><div className="flex-1 flex flex-col"><Header />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main>
        <Footer /></div>
      </div>
    );
  }

  if (error || !funcionario) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar /><div className="flex-1 flex flex-col"><Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-slate-700 dark:text-slate-300">{error || "Funcionário não encontrado"}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Voltar</button>
        </main><Footer /></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ficha do Funcionário</h1>
                <p className="text-slate-500 dark:text-slate-400">Visualização completa do cadastro</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/funcionarios/editar/${id}`} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-2xl font-semibold transition-all">
                <Pencil size={18} /> Editar
              </Link>
              <button onClick={handleGerarPDF} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all cursor-pointer">
                <FileText size={18} /> Gerar PDF
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-5 overflow-hidden">
                  {funcionario.foto ? (
                    <img src={funcionario.foto} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-sm">Sem foto</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{funcionario.nome}</h2>
                <p className="text-slate-500 mt-2">{funcionario.cargo}</p>
                <span className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{funcionario.status}</span>
              </div>
            </section>

            <section className="xl:col-span-2 space-y-6">
              <Card title="Dados Pessoais">
                <Info label="CPF" value={funcionario.cpf} />
                <Info label="RA" value={funcionario.ra} />
                <Info label="Nascimento" value={funcionario.nascimento} />
                <Info label="Sexo" value={funcionario.sexo} />
                <Info label="Celular" value={funcionario.celular} />
                <Info label="Email" value={funcionario.email} />
              </Card>

              <Card title="Contrato">
                <Info label="Tipo" value={funcionario.contrato.tipo} />
                <Info label="Período" value={funcionario.contrato.periodo} />
                <Info label="Fim de Contrato" value={funcionario.contrato.dataFim} />
              </Card>

              <Card title="Endereço">
                <Info label="CEP" value={funcionario.endereco.cep} />
                <Info label="Cidade" value={funcionario.endereco.cidade} />
                <Info label="Estado" value={funcionario.endereco.estado} />
                <Info label="Rua" value={funcionario.endereco.rua} />
                <Info label="Bloco" value={funcionario.endereco.bloco} />
                <Info label="Quadra" value={funcionario.endereco.quadra} />
                <Info label="Número" value={funcionario.endereco.numero} />
              </Card>

              <Card title="Disciplinas Alocadas">
                {funcionario.disciplinas.length > 0 ? funcionario.disciplinas.map((d, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700 last:border-0 last:pb-0 last:mb-0">
                    <Info label="Disciplina" value={d.nome} />
                    <Info label="Carga Horária" value={d.carga} />
                    <Info label="Turma" value={d.turma} />
                    <Info label="Período" value={d.periodo} />
                  </div>
                )) : <p className="text-slate-500">Nenhuma disciplina alocada.</p>}
              </Card>

              <Card title="Formações Acadêmicas">
                {funcionario.formacoes.length > 0 ? funcionario.formacoes.map((f, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700 last:border-0 last:pb-0 last:mb-0">
                    <Info label="Instituição" value={f.instituicao} />
                    <Info label="CNPJ" value={f.cnpj} />
                    <Info label="Período" value={f.periodo} />
                    <Info label="Modalidade" value={f.modalidade} />
                  </div>
                )) : <p className="text-slate-500">Nenhuma formação informada.</p>}
              </Card>

              <Card title="Experiências Profissionais">
                {funcionario.experiencias.length > 0 ? funcionario.experiencias.map((e, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700 last:border-0 last:pb-0 last:mb-0">
                    <Info label="Empresa" value={e.empresa} />
                    <Info label="CNPJ" value={e.cnpj} />
                    <Info label="Período" value={e.periodo} />
                    <Info label="Modalidade" value={e.modalidade} />
                  </div>
                )) : <p className="text-slate-500">Nenhuma experiência informada.</p>}
              </Card>

              <Card title="Financeiro">
                <Info label="Salário Base" value={funcionario.financeiro.salario} />
                <Info label="Método de Pagamento" value={funcionario.financeiro.pagamento} />
              </Card>

              <Card title="Documentos Anexados">
                {funcionario.documentos.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {funcionario.documentos.map((docUrl, idx) => {
                      const fileName = docUrl.split('/').pop() || `Documento ${idx + 1}`;
                      const cleanName = fileName.includes('-') ? fileName.split('-').slice(1).join('-') : fileName;

                      return (
                        <a
                          key={idx}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={cleanName}
                          className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition-all group"
                        >
                          <FileText size={18} className="group-hover:scale-110 transition-transform" />
                          <span className="max-w-[200px] truncate">{cleanName}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum documento anexado.</p>
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

function Card({ title, children }: any) {
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