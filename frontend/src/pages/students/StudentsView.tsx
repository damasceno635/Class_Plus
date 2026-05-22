import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText, Pencil, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

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
        
        // Simula o tempo de resposta de uma API real (meio segundo)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Busca o aluno no nosso "banco de dados" fake
        const mockData = buscarAlunoMock(id);
        
        if (!mockData) {
          throw new Error("Aluno não encontrado no sistema.");
        }
        
        setAluno(mockData);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    }

    loadAluno();
  }, [id]);

  const handleGerarPDF = () => {
    alert("Funcionalidade de geração de PDF será implementada em breve.");
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ficha do Aluno</h1>
                <p className="text-slate-500 dark:text-slate-400">Visualização completa dos dados</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/alunos/editar/${id}`} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-2xl font-semibold transition-all">
                <Pencil size={18} /> Editar
              </Link>
              <button onClick={handleGerarPDF} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all">
                <FileText size={18} /> Gerar PDF
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            {/* Perfil */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-5 overflow-hidden">
                  {aluno.foto ? <img src={aluno.foto} className="w-full h-full object-cover" alt="foto" /> : <span className="text-slate-500 text-sm">Sem foto</span>}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{aluno.nome}</h2>
                <p className="text-slate-500 mt-2">Matrícula: {aluno.matricula}</p>
                <span className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">{aluno.status}</span>
              </div>
            </section>

            {/* Dados detalhados */}
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
                <ul className="space-y-2">
                  {aluno.documentos.map((doc) => <li key={doc} className="text-slate-600 dark:text-slate-300">• {doc}</li>)}
                </ul>
              </Card>
              <Card title="Deficiências">
                {aluno.deficiencias.length > 0 ? aluno.deficiencias.map((d, idx) => (
                  <div key={idx} className="mb-2">
                    <Info label="Deficiência" value={d.nome} />
                    <Info label="Precisa de apoio" value={d.apoio} />
                  </div>
                )) : <p className="text-slate-500">Nenhuma deficiência informada.</p>}
              </Card>
              <Card title="Alergias">
                {aluno.alergias.length > 0 ? <ul className="space-y-2">{aluno.alergias.map((a) => <li key={a} className="text-slate-600 dark:text-slate-300">• {a}</li>)}</ul> : <p className="text-slate-500">Nenhuma alergia informada.</p>}
              </Card>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* Componentes internos mantidos */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
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

/* ===================================================== */
/* MOCK (APENAS PARA DESENVOLVIMENTO – REMOVA DEPOIS) */
/* ===================================================== */

function buscarAlunoMock(id: string): Aluno | null {
  const alunosMock: Record<string, Aluno> = {
    "1": {
      id: "1",
      matricula: "20260001",
      nome: "Maria Silva",
      foto: "",
      status: "Matriculado",
      cpf: "123.456.789-00",
      nascimento: "15/04/2012",
      sexo: "Feminino",
      nivel: "Ensino Fundamental",
      ano: "8º Ano",
      serie: "A",
      anoLetivo: "2026.1",
      endereco: {
        cep: "12345-678",
        cidade: "São Paulo",
        estado: "SP",
        rua: "Rua das Flores",
        bloco: "B",
        quadra: "10",
        numero: "123",
      },
      responsaveis: [
        {
          parentesco: "Mãe",
          nome: "Ana Silva",
          cpf: "987.654.321-11",
          contato: "(11) 98765-4321",
          email: "ana.silva@email.com",
        },
      ],
      documentos: ["RG", "CPF", "Comprovante de Residência", "Histórico Escolar"],
      deficiencias: [],
      alergias: ["Amendoim", "Lactose"],
    },
    "2": {
      id: "2",
      matricula: "20260002",
      nome: "João Costa",
      foto: "",
      status: "Pré-Matriculado",
      cpf: "321.654.987-00",
      nascimento: "22/11/2008",
      sexo: "Masculino",
      nivel: "Ensino Médio",
      ano: "2º Ano",
      serie: "B",
      anoLetivo: "2026.1",
      endereco: {
        cep: "87654-321",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        rua: "Av. Principal",
        bloco: "",
        quadra: "",
        numero: "456",
      },
      responsaveis: [
        {
          parentesco: "Pai",
          nome: "Carlos Costa",
          cpf: "111.222.333-44",
          contato: "(21) 91234-5678",
          email: "carlos.costa@email.com",
        },
      ],
      documentos: ["RG do Aluno"],
      deficiencias: [
        { nome: "TDAH", apoio: "Tempo extra em provas" }
      ],
      alergias: [],
    },
  };
  return alunosMock[id] || null;
}