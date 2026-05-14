import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

/* ===================================================== */
/* TYPES */
/* ===================================================== */

interface AlunoFormData {
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  status: string;
  nivelEnsino: string;
  anoTurma: string;
  serieTurma: string;
  anoLetivo: string;
}

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export default function EditarAluno() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlunoFormData>();

  /* ===================================================== */
  /* BUSCAR DADOS DO ALUNO */
  /* ===================================================== */

  useEffect(() => {
    if (!id) return;

    async function fetchAluno() {
      setLoadingInicial(true);
      setErrorInicial(null);
        try {
        // ✅ CORREÇÃO 2: id! (non-null assertion) ou passar o id validado
        // O TS agora sabe que o id não é undefined por causa do check acima
        const mockData = buscarAlunoMock(id!); 
        if (!mockData) throw new Error("Aluno não encontrado");
        reset(mockData);
      } catch (err: any) {
        setErrorInicial(err.message || "Erro ao carregar dados do aluno");
      } finally {
        setLoadingInicial(false);
      }
    }

    fetchAluno();
  }, [id, reset]);

  /* ===================================================== */
  /* SUBMIT */
  /* ===================================================== */

    const onSubmit = async (data: AlunoFormData) => {
    // ✅ CORREÇÃO 3: Usar o 'data' para evitar o aviso de "unused variable"
    console.log("Dados a serem salvos:", data);
    
    setSalvando(true);
    setFeedback(null);
    try {
      // Simulação de envio
      await new Promise((resolve) => setTimeout(resolve, 800));

      setFeedback({ type: "success", message: "Aluno atualizado com sucesso!" });
      setTimeout(() => navigate("/alunos"), 1500);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar" });
    } finally {
      setSalvando(false);
    }
  };

  /* ===================================================== */
  /* ESTADOS DE CARREGAMENTO / ERRO */
  /* ===================================================== */

  if (loadingInicial) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
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

  if (errorInicial) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-slate-700 dark:text-slate-300">{errorInicial}</p>
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

  /* ===================================================== */
  /* JSX PRINCIPAL */
  /* ===================================================== */

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Editar Aluno
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Atualização cadastral do estudante
              </p>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              role="alert"
              className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Formulário */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
          >
            <Section title="Dados Básicos">
              <Grid>
                <Input
                  label="Nome"
                  register={register("nome", { required: "Nome é obrigatório" })}
                  error={errors.nome}
                />
                <Input
                  label="CPF"
                  register={register("cpf")}
                  error={errors.cpf}
                />
                <Input
                  type="date"
                  label="Nascimento"
                  register={register("nascimento")}
                  error={errors.nascimento}
                />
                <Select
                  label="Sexo"
                  register={register("sexo")}
                  options={["Masculino", "Feminino"]}
                />
                <Select
                  label="Status"
                  register={register("status")}
                  options={[
                    "Matriculado",
                    "Pré-Matriculado",
                    "Inativo",
                    "Transferido",
                    "Desistente",
                  ]}
                />
              </Grid>
            </Section>

            <Section title="Turma">
              <Grid>
                <Select
                  label="Nível"
                  register={register("nivelEnsino")}
                  options={["Ensino Fundamental", "Ensino Médio"]}
                />
                <Select
                  label="Ano"
                  register={register("anoTurma")}
                  options={[
                    "1º Ano",
                    "2º Ano",
                    "3º Ano",
                    "4º Ano",
                    "5º Ano",
                    "6º Ano",
                    "7º Ano",
                    "8º Ano",
                    "9º Ano",
                  ]}
                />
                <Select
                  label="Série"
                  register={register("serieTurma")}
                  options={["A", "B", "C", "D"]}
                />
                <Select
                  label="Ano Letivo"
                  register={register("anoLetivo")}
                  options={["2026.1", "2026.2", "2027.1", "2027.2"]}
                />
              </Grid>
            </Section>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ===================================================== */
/* COMPONENTES AUXILIARES (TIPADOS CORRIGIDOS) */
/* ===================================================== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>;
}

interface InputProps {
  label: string;
  register: UseFormRegisterReturn; // ✅ agora recebe o retorno do register
  type?: string;
  error?: { message?: string };
}

function Input({ label, register, type = "text", error }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type={type}
        {...register} // ✅ spread diretamente no objeto
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
}

interface SelectProps {
  label: string;
  register: UseFormRegisterReturn; // ✅ mesmo padrão
  options: string[];
}

function Select({ label, register, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        {...register}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ===================================================== */
/* MOCK (APENAS PARA DESENVOLVIMENTO – REMOVA DEPOIS) */
/* ===================================================== */

function buscarAlunoMock(id: string): AlunoFormData | null {
  const alunosMock: Record<string, AlunoFormData> = {
    "1": {
      nome: "Maria Silva",
      cpf: "123.456.789-00",
      nascimento: "2012-04-15",
      sexo: "Feminino",
      status: "Matriculado",
      nivelEnsino: "Ensino Fundamental",
      anoTurma: "8º Ano",
      serieTurma: "A",
      anoLetivo: "2026.1",
    },
    "2": {
      nome: "João Costa",
      cpf: "987.654.321-00",
      nascimento: "2008-11-22",
      sexo: "Masculino",
      status: "Pré-Matriculado",
      nivelEnsino: "Ensino Médio",
      anoTurma: "2º Ano",
      serieTurma: "B",
      anoLetivo: "2026.1",
    },
  };
  return alunosMock[id] || null;
}