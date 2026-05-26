import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";
import type { ReactNode, FocusEvent } from "react";
import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* ===================================================== */
/* FORMATADORES (MÁSCARAS) */
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
/* TYPES - TIPAGENS */
/* ===================================================== */

interface Disciplina {
  disciplina: string;
  cargaHoraria: string;
  turma: string;
  serie: string;
  periodo: string;
}

interface Formacao {
  instituicao: string;
  cnpj: string;
  modalidade: string;
  periodoInicio: string;
  periodoFinal: string;
}

interface Experiencia {
  empresa: string;
  cnpj: string;
  modalidade: string;
  periodoInicio: string;
  periodoFinal: string;
}

interface FuncionarioFormData {
  status: string;
  vaga: string;
  contrato: string;
  periodoContrato: string;
  dataFimContrato: string;
  nome: string;
  cpf: string;
  ra: string;
  nascimento: string;
  sexo: string;
  celular: string;
  email: string;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  bloco: string;
  quadra: string;
  numero: string;
  disciplinas: Disciplina[];
  admissao: string;
  formacoes: Formacao[];
  experiencias: Experiencia[];
  salario: string;
  pagamento: string;
  foto?: FileList;
  rgFuncionario?: FileList;
  comprovanteResidencia?: FileList;
  diploma?: FileList;
  referencias?: FileList;
}

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export default function NovoFuncionario() {
  const navigate = useNavigate();
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FuncionarioFormData>({
    defaultValues: {
      disciplinas: [],
      formacoes: [],
      experiencias: [],
    },
  });

  const {
    fields: disciplinaFields,
    append: appendDisciplina,
    remove: removeDisciplina,
  } = useFieldArray({
    control,
    name: "disciplinas",
  });

  const {
    fields: formacaoFields,
    append: appendFormacao,
    remove: removeFormacao,
  } = useFieldArray({
    control,
    name: "formacoes",
  });

  const {
    fields: experienciaFields,
    append: appendExperiencia,
    remove: removeExperiencia,
  } = useFieldArray({
    control,
    name: "experiencias",
  });

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
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  const onSubmit = async (data: FuncionarioFormData) => {
    if (vaga === "Professor(a)" && data.disciplinas.length === 0) {
      alert("É obrigatório adicionar pelo menos uma disciplina para o cargo de Professor(a).");
      return;
    }

    setSalvando(true);
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

      if (vaga === "Professor(a)") {
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

      const response = await api.post("/funcionarios", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { senhaProvisoria } = response.data.credenciaisAcesso;
      alert(`✅ Funcionário cadastrado com sucesso!\n\n🔑 O Email e a Senha de Acesso (RA) é: ${senhaProvisoria}`);
      navigate("/funcionarios");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao salvar funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Novo Funcionário</h1>
            <p className="text-slate-500 dark:text-slate-300">Cadastro completo de funcionário</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Section title="Foto">
              <FileInput label="Foto do Funcionário" register={register("foto")} error={errors.foto?.message} />
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

            <Section title="Documentos">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="RG" register={register("rgFuncionario")} error={errors.rgFuncionario?.message as string} />
                  <FileInput label="Comprovante Residência" register={register("comprovanteResidencia")} error={errors.comprovanteResidencia?.message as string} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="Diploma" register={register("diploma")} error={errors.diploma?.message as string} />
                  <FileInput label="Referências" register={register("referencias")} error={errors.referencias?.message as string} />
                </div>
              </div>
            </Section>

            <button
              type="submit"
              disabled={salvando}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all cursor-pointer font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <>
                  <Loader2 className="inline animate-spin mr-2" size={20} />
                  Salvando...
                </>
              ) : (
                "Salvar Funcionário"
              )}
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ===================================================== */
/* COMPONENTES AUXILIARES */
/* ===================================================== */

interface SectionProps {
  title: string;
  children: ReactNode;
}
function Section({ title, children }: SectionProps) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

interface GridProps {
  children: ReactNode;
}
function Grid({ children }: GridProps) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>;
}

interface CardItemProps {
  children: ReactNode;
  onRemove: () => void;
}
function CardItem({ children, onRemove }: CardItemProps) {
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
          <option key={option} value={option}>
            {option}
          </option>
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