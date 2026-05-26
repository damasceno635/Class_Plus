import { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";
import type { ReactNode, FocusEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

/* ===================================================== */
/* FORMATADORES (MÁSCARAS) – IDÊNTICOS AO NEW */
/* ===================================================== */
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatCelular = (value: string) => {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatMoeda = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (!v) return "";
  v = (parseInt(v, 10) / 100).toFixed(2);
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return `R$ ${v}`;
};

/* ===================================================== */
/* TYPES (MESMO DO NEW) */
/* ===================================================== */
interface Disciplina { disciplina: string; cargaHoraria: string; turma: string; serie: string; periodo: string; }
interface Formacao { instituicao: string; cnpj: string; modalidade: string; periodoInicio: string; periodoFinal: string; }
interface Experiencia { empresa: string; cnpj: string; modalidade: string; periodoInicio: string; periodoFinal: string; }

interface FuncionarioFormData {
  status: string; vaga: string; contrato: string; periodoContrato: string; dataFimContrato: string;
  nome: string; cpf: string; ra: string; nascimento: string; sexo: string; celular: string; email: string;
  cep: string; cidade: string; estado: string; rua: string; bloco: string; quadra: string; numero: string;
  disciplinas: Disciplina[]; formacoes: Formacao[]; experiencias: Experiencia[];
  salario: string; pagamento: string;
  foto?: FileList; rgFuncionario?: FileList; comprovanteResidencia?: FileList; diploma?: FileList; referencias?: FileList;
}

/* ===================================================== */
/* COMPONENTE PRINCIPAL */
/* ===================================================== */
export default function EditarFuncionario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FuncionarioFormData>({
    defaultValues: {
      disciplinas: [],
      formacoes: [],
      experiencias: [],
    },
  });

  const { fields: disciplinaFields, append: appendDisciplina, remove: removeDisciplina } = useFieldArray({ control, name: "disciplinas" });
  const { fields: formacaoFields, append: appendFormacao, remove: removeFormacao } = useFieldArray({ control, name: "formacoes" });
  const { fields: experienciaFields, append: appendExperiencia, remove: removeExperiencia } = useFieldArray({ control, name: "experiencias" });

  const contrato = watch("contrato");
  const vaga = watch("vaga");

  async function buscarCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");
        setValue("rua", data.logradouro || "");
      }
    } catch (error) { console.error("Erro ao buscar CEP:", error); }
  }

  // Carregar dados da API
  useEffect(() => {
    if (!id) return;
    async function fetchFuncionario() {
      setLoadingInicial(true);
      setErrorInicial(null);
      try {
        const response = await api.get(`/funcionarios/${id}`);
        const f = response.data;

        // Converte dados do backend para o formato do formulário
        const disciplinasMapped = f.disciplinas?.map((d: any) => {
          const partes = d.turma?.split(' ') || [];
          const serie = partes.pop() || "A";
          const turma = partes.join(' ');
          return { disciplina: d.nome, cargaHoraria: d.carga, turma, serie, periodo: d.periodo };
        }) || [];

        const formacoesMapped = f.formacoes?.map((form: any) => {
          const [inicio, fim] = form.periodo?.split(' até ') || ["", ""];
          return { instituicao: form.instituicao, cnpj: form.cnpj, modalidade: form.modalidade, periodoInicio: inicio, periodoFinal: fim };
        }) || [];

        const experienciasMapped = f.experiencias?.map((exp: any) => {
          const [inicio, fim] = exp.periodo?.split(' até ') || ["", ""];
          return { empresa: exp.empresa, cnpj: exp.cnpj, modalidade: exp.modalidade, periodoInicio: inicio, periodoFinal: fim };
        }) || [];

        reset({
          status: f.status,
          vaga: f.cargo,
          contrato: f.contrato?.tipo,
          periodoContrato: f.contrato?.periodo,
          dataFimContrato: f.contrato?.dataFim && f.contrato.dataFim !== "Indeterminado" ? f.contrato.dataFim : "",
          nome: f.nome,
          cpf: f.cpf,
          ra: f.ra,
          nascimento: f.nascimento,
          sexo: f.sexo,
          celular: f.celular,
          email: f.email,
          cep: f.endereco?.cep,
          cidade: f.endereco?.cidade,
          estado: f.endereco?.estado,
          rua: f.endereco?.rua,
          bloco: f.endereco?.bloco || "",
          quadra: f.endereco?.quadra || "",
          numero: f.endereco?.numero,
          salario: f.financeiro?.salario,
          pagamento: f.financeiro?.pagamento,
          disciplinas: disciplinasMapped,
          formacoes: formacoesMapped,
          experiencias: experienciasMapped,
        });
      } catch (err: any) {
        setErrorInicial(err.response?.data?.error || "Erro ao carregar dados do funcionário");
      } finally {
        setLoadingInicial(false);
      }
    }
    fetchFuncionario();
  }, [id, reset]);

  const onSubmit = async (data: FuncionarioFormData) => {
    // Validação para professores: pelo menos uma disciplina
    if (data.vaga === "Professor(a)" && data.disciplinas.length === 0) {
      setFeedback({ type: "error", message: "Para o cargo de Professor(a), adicione pelo menos uma disciplina." });
      return;
    }

    setSalvando(true);
    setFeedback(null);
    try {
      const formData = new FormData();

      formData.append("status", data.status);
      formData.append("vaga", data.vaga);
      formData.append("contrato", data.contrato);
      formData.append("periodoContrato", data.periodoContrato);
      formData.append("dataFimContrato", data.dataFimContrato || "");
      formData.append("nome", data.nome);
      formData.append("cpf", data.cpf);
      formData.append("ra", data.ra);
      formData.append("nascimento", data.nascimento);
      formData.append("sexo", data.sexo);
      formData.append("celular", data.celular);
      formData.append("email", data.email);
      formData.append("cep", data.cep);
      formData.append("cidade", data.cidade);
      formData.append("estado", data.estado);
      formData.append("rua", data.rua);
      formData.append("bloco", data.bloco || "");
      formData.append("quadra", data.quadra || "");
      formData.append("numero", data.numero);
      formData.append("salario", data.salario);
      formData.append("pagamento", data.pagamento);

      if (data.vaga === "Professor(a)") {
        formData.append("disciplinas", JSON.stringify(data.disciplinas));
      } else {
        formData.append("disciplinas", JSON.stringify([]));
      }
      formData.append("formacoes", JSON.stringify(data.formacoes));
      formData.append("experiencias", JSON.stringify(data.experiencias));

      if (data.foto && data.foto.length > 0) formData.append("foto", data.foto[0]);
      if (data.rgFuncionario && data.rgFuncionario.length > 0) formData.append("rgFuncionario", data.rgFuncionario[0]);
      if (data.comprovanteResidencia && data.comprovanteResidencia.length > 0) formData.append("comprovanteResidencia", data.comprovanteResidencia[0]);
      if (data.diploma && data.diploma.length > 0) formData.append("diploma", data.diploma[0]);
      if (data.referencias && data.referencias.length > 0) formData.append("referencias", data.referencias[0]);

      await api.put(`/funcionarios/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

      setFeedback({ type: "success", message: "Funcionário atualizado com sucesso!" });
      setTimeout(() => navigate(-1), 1500);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.response?.data?.error || "Erro ao atualizar." });
    } finally {
      setSalvando(false);
    }
  };

  if (loadingInicial) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
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
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-slate-700 dark:text-slate-300">{errorInicial}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Voltar</button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <div className="mb-8 flex items-center gap-4">
            <button onClick={() => navigate(-1)} title="Voltar" className="p-2 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Editar Funcionário</h1>
              <p className="text-slate-500 dark:text-slate-400">Atualização cadastral do colaborador</p>
            </div>
          </div>

          {feedback && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${feedback.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30" : "bg-red-100 text-red-800 dark:bg-red-900/30"}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Section title="Foto">
              <FileInput label="Atualizar Foto (Opcional)" register={register("foto" as any)} />
            </Section>

            <Section title="Informações Básicas">
              <Grid>
                <Select label="Status" register={register("status", { required: "Campo obrigatório" })} options={["Ativo", "Inativo"]} error={errors.status?.message} />
                <Select label="Vaga" register={register("vaga", { required: "Campo obrigatório" })} options={["Professor(a)", "Coordenador(a)", "Secretário(a)", "Serviços Gerais"]} error={errors.vaga?.message} />
                <Select label="Contrato" register={register("contrato", { required: "Campo obrigatório" })} options={["Indeterminado", "Determinado", "Experiência", "Temporário", "Intermitente", "Estágio"]} error={errors.contrato?.message} />
                <Select label="Período" register={register("periodoContrato", { required: "Campo obrigatório" })} options={["Meio Período", "Integral"]} error={errors.periodoContrato?.message} />
                {contrato !== "Indeterminado" && (
                  <Input type="date" label="Data Final Contrato" register={register("dataFimContrato", { required: "Campo obrigatório" })} error={errors.dataFimContrato?.message} />
                )}
                <Input label="Nome" register={register("nome", { required: "Campo obrigatório" })} error={errors.nome?.message} />
                <Input label="CPF" register={register("cpf", { required: "Campo obrigatório", onChange: (e) => e.target.value = formatCPF(e.target.value) })} error={errors.cpf?.message} />
                <Input label="RA" register={register("ra", { required: "Campo obrigatório" })} error={errors.ra?.message} />
                <Input type="date" label="Nascimento" register={register("nascimento", { required: "Campo obrigatório" })} error={errors.nascimento?.message} />
                <Select label="Sexo" register={register("sexo", { required: "Campo obrigatório" })} options={["Masculino", "Feminino"]} error={errors.sexo?.message} />
                <Input label="Celular" register={register("celular", { required: "Campo obrigatório", onChange: (e) => e.target.value = formatCelular(e.target.value) })} error={errors.celular?.message} />
                <Input label="Email" type="email" register={register("email", { required: "Campo obrigatório" })} error={errors.email?.message} />
              </Grid>
            </Section>

            <Section title="Endereço">
              <Grid>
                <Input label="CEP" register={register("cep", { required: "Campo obrigatório", onChange: (e) => e.target.value = formatCEP(e.target.value) })} onBlur={(e) => buscarCEP(e.target.value)} error={errors.cep?.message} />
                <Input label="Cidade" register={register("cidade", { required: "Campo obrigatório" })} error={errors.cidade?.message} />
                <Input label="Estado" register={register("estado", { required: "Campo obrigatório" })} error={errors.estado?.message} />
                <Input label="Rua" register={register("rua", { required: "Campo obrigatório" })} error={errors.rua?.message} />
                <Input label="Bloco" register={register("bloco", { required: "Campo obrigatório" })} error={errors.bloco?.message} />
                <Input label="Quadra" register={register("quadra", { required: "Campo obrigatório" })} error={errors.quadra?.message} />
                <Input label="Número" register={register("numero", { required: "Campo obrigatório" })} error={errors.numero?.message} />
              </Grid>
            </Section>

            {vaga === "Professor(a)" && (
              <Section title="Disciplinas">
                <button type="button" onClick={() => appendDisciplina({ disciplina: "", cargaHoraria: "", turma: "", serie: "", periodo: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5">
                  <Plus size={18} /> Adicionar Disciplina
                </button>
                {disciplinaFields.length === 0 && <p className="text-red-500 mb-4">Adicione pelo menos uma disciplina.</p>}
                <div className="space-y-5">
                  {disciplinaFields.map((field, index) => (
                    <CardItem key={field.id} onRemove={() => removeDisciplina(index)}>
                      <Grid>
                        <Select label="Disciplina" register={register(`disciplinas.${index}.disciplina`, { required: "Campo obrigatório" })} options={["Arte", "Biologia", "Educação Física", "Espanhol", "Filosofia", "Física", "Geografia", "História", "Inglês", "Matemática", "Português", "Sociologia"]} error={errors.disciplinas?.[index]?.disciplina?.message} />
                        <Select label="Carga Horária Semanal" register={register(`disciplinas.${index}.cargaHoraria`, { required: "Campo obrigatório" })} options={["20h", "24h", "40h", "60h", "80h", "100h"]} error={errors.disciplinas?.[index]?.cargaHoraria?.message} />
                        <Select label="Turma" register={register(`disciplinas.${index}.turma`, { required: "Campo obrigatório" })} options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]} error={errors.disciplinas?.[index]?.turma?.message} />
                        <Select label="Série" register={register(`disciplinas.${index}.serie`, { required: "Campo obrigatório" })} options={["A", "B", "C", "D"]} error={errors.disciplinas?.[index]?.serie?.message} />
                        <Select label="Período" register={register(`disciplinas.${index}.periodo`, { required: "Campo obrigatório" })} options={["Matutino", "Vespertino", "Noturno"]} error={errors.disciplinas?.[index]?.periodo?.message} />
                      </Grid>
                    </CardItem>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Formações">
              <button type="button" onClick={() => appendFormacao({ instituicao: "", cnpj: "", modalidade: "", periodoInicio: "", periodoFinal: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5">
                <Plus size={18} /> Adicionar Formação
              </button>
              <div className="space-y-5">
                {formacaoFields.map((field, index) => (
                  <CardItem key={field.id} onRemove={() => removeFormacao(index)}>
                    <Grid>
                      <Input label="Instituição" register={register(`formacoes.${index}.instituicao`, { required: "Campo obrigatório" })} error={errors.formacoes?.[index]?.instituicao?.message} />
                      <Input label="CNPJ" register={register(`formacoes.${index}.cnpj`, { required: "Campo obrigatório", onChange: (e) => e.target.value = formatCNPJ(e.target.value) })} error={errors.formacoes?.[index]?.cnpj?.message} />
                      <Select label="Modalidade" register={register(`formacoes.${index}.modalidade`, { required: "Campo obrigatório" })} options={["Presencial", "Remoto", "Híbrido"]} error={errors.formacoes?.[index]?.modalidade?.message} />
                      <Input label="Período Inicial" type="date" register={register(`formacoes.${index}.periodoInicio`, { required: "Campo obrigatório" })} error={errors.formacoes?.[index]?.periodoInicio?.message} />
                      <Input label="Período Final" type="date" register={register(`formacoes.${index}.periodoFinal`, { required: "Campo obrigatório" })} error={errors.formacoes?.[index]?.periodoFinal?.message} />
                    </Grid>
                  </CardItem>
                ))}
              </div>
            </Section>

            <Section title="Experiências">
              <button type="button" onClick={() => appendExperiencia({ empresa: "", cnpj: "", modalidade: "", periodoInicio: "", periodoFinal: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5">
                <Plus size={18} /> Adicionar Experiência
              </button>
              <div className="space-y-5">
                {experienciaFields.map((field, index) => (
                  <CardItem key={field.id} onRemove={() => removeExperiencia(index)}>
                    <Grid>
                      <Input label="Empresa" register={register(`experiencias.${index}.empresa`, { required: "Campo obrigatório" })} error={errors.experiencias?.[index]?.empresa?.message} />
                      <Input label="CNPJ" register={register(`experiencias.${index}.cnpj`, { required: "Campo obrigatório", onChange: (e) => e.target.value = formatCNPJ(e.target.value) })} error={errors.experiencias?.[index]?.cnpj?.message} />
                      <Select label="Modalidade" register={register(`experiencias.${index}.modalidade`, { required: "Campo obrigatório" })} options={["Presencial", "Remoto", "Híbrido"]} error={errors.experiencias?.[index]?.modalidade?.message} />
                      <Input label="Período Inicial" type="date" register={register(`experiencias.${index}.periodoInicio`, { required: "Campo obrigatório" })} error={errors.experiencias?.[index]?.periodoInicio?.message} />
                      <Input label="Período Final" type="date" register={register(`experiencias.${index}.periodoFinal`, { required: "Campo obrigatório" })} error={errors.experiencias?.[index]?.periodoFinal?.message} />
                    </Grid>
                  </CardItem>
                ))}
              </div>
            </Section>

            <Section title="Financeiro">
              <Grid>
                <Input label="Salário" register={register("salario", { required: "Campo obrigatório", onChange: (e) => e.target.value = formatMoeda(e.target.value) })} error={errors.salario?.message} />
                <Select label="Pagamento" register={register("pagamento", { required: "Campo obrigatório" })} options={["Depósito", "Espécie", "PIX", "Cheque"]} error={errors.pagamento?.message} />
              </Grid>
            </Section>

            <Section title="Novos Documentos (Opcional)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileInput label="RG Atualizado" register={register("rgFuncionario" as any)} />
                <FileInput label="Novo Comp. de Residência" register={register("comprovanteResidencia" as any)} />
                <FileInput label="Novo Diploma" register={register("diploma" as any)} />
                <FileInput label="Novas Referências" register={register("referencias" as any)} />
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all disabled:opacity-50">
                {salvando ? <><Loader2 className="animate-spin" size={18} />Salvando...</> : <><Save size={18} />Salvar Alterações</>}
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
/* COMPONENTES AUXILIARES (com suporte a erro) */
/* ===================================================== */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>;
}

function CardItem({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex justify-end mb-4">
        <button type="button" onClick={onRemove} className="text-red-600 hover:scale-110 transition-all">
          <Trash2 size={20} />
        </button>
      </div>
      {children}
    </div>
  );
}

interface InputProps {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  error?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}
function Input({ label, register, type = "text", error, onBlur }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <input
        type={type}
        {...register}
        onBlur={(e) => {
          register.onBlur(e);
          if (onBlur) onBlur(e);
        }}
        className={`w-full p-3 rounded-xl border ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"} bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 transition-all`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

interface SelectProps {
  label: string;
  register: UseFormRegisterReturn;
  options: string[];
  error?: string;
}
function Select({ label, register, options, error }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <select
        {...register}
        className={`w-full p-3 rounded-xl border ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"} bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 transition-all`}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

interface FileInputProps {
  label: string;
  register?: UseFormRegisterReturn;
  error?: string;
}
function FileInput({ label, register, error }: FileInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <input
        type="file"
        {...register}
        className={`w-full p-2 border ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"} rounded-xl text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:cursor-pointer`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}