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

      formData.append("disciplinas", JSON.stringify(data.disciplinas));
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
              <FileInput label="Foto do Funcionário" register={register("foto")} />
            </Section>

            <Section title="Informações Básicas">
              <Grid>
                <Select label="Status" register={register("status")} options={["Ativo", "Inativo"]} />
                <Select label="Vaga" register={register("vaga")} options={["Professor(a)", "Coordenador(a)", "Secretário(a)", "Serviços Gerais"]} />
                <Select label="Contrato" register={register("contrato")} options={["Indeterminado", "Determinado", "Experiência", "Temporário", "Intermitente", "Estágio"]} />
                <Select label="Período" register={register("periodoContrato")} options={["Meio Período", "Integral"]} />
                {contrato !== "Indeterminado" && (
                  <Input type="date" label="Data Final Contrato" register={register("dataFimContrato")} />
                )}
                <Input label="Nome" register={register("nome")} />
                <Input label="CPF" register={register("cpf")} />
                <Input label="RA" register={register("ra")} />
                <Input type="date" label="Nascimento" register={register("nascimento")} />
                <Select label="Sexo" register={register("sexo")} options={["Masculino", "Feminino"]} />
                <Input label="Celular" register={register("celular")} />
                <Input label="Email" register={register("email")} />
              </Grid>
            </Section>

            <Section title="Endereço">
              <Grid>
                <Input label="CEP" register={register("cep")} onBlur={(e) => buscarCEP(e.target.value)} />
                <Input label="Cidade" register={register("cidade")} />
                <Input label="Estado" register={register("estado")} />
                <Input label="Rua" register={register("rua")} />
                <Input label="Bloco" register={register("bloco")} />
                <Input label="Quadra" register={register("quadra")} />
                <Input label="Número" register={register("numero")} />
              </Grid>
            </Section>

            <Section title="Disciplinas">
              <button type="button" onClick={() => appendDisciplina({ disciplina: "", cargaHoraria: "", turma: "", serie: "", periodo: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5">
                <Plus size={18} /> Adicionar Disciplina
              </button>
              <div className="space-y-5">
                {disciplinaFields.map((field, index) => (
                  <CardItem key={field.id} onRemove={() => removeDisciplina(index)}>
                    <Grid>
                      <Select label="Disciplina" register={register(`disciplinas.${index}.disciplina`, { required: "Preencha este campo." })} options={["Arte", "Biologia", "Educação Física", "Espanhol", "Filosofia", "Física", "Geografia", "História", "Inglês", "Matemática", "Português", "Sociologia"]} />
                      <Select label="Carga Horária Semanal" register={register(`disciplinas.${index}.cargaHoraria`, { required: "Preencha este campo." })} options={["20h", "24h", "40h", "60h", "80h", "100h"]} />
                      <Select label="Turma" register={register(`disciplinas.${index}.turma`, { required: "Preencha este campo." })} options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]} />
                      <Select label="Série" register={register(`disciplinas.${index}.serie`, { required: "Preencha este campo." })} options={["A", "B", "C", "D"]} />
                      <Select label="Período" register={register(`disciplinas.${index}.periodo`)} options={["Matutino", "Vespertino", "Noturno"]} />
                    </Grid>
                  </CardItem>
                ))}
              </div>
            </Section>

            <Section title="Formações">
              <button type="button" onClick={() => appendFormacao({ instituicao: "", cnpj: "", modalidade: "", periodoInicio: "", periodoFinal: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5">
                <Plus size={18} /> Adicionar Formação
              </button>
              <div className="space-y-5">
                {formacaoFields.map((field, index) => (
                  <CardItem key={field.id} onRemove={() => removeFormacao(index)}>
                    <Grid>
                      <Input label="Instituição" register={register(`formacoes.${index}.instituicao`)} />
                      <Input label="CNPJ" register={register(`formacoes.${index}.cnpj`)} />
                      <Select label="Modalidade" register={register(`formacoes.${index}.modalidade`)} options={["Presencial", "Remoto", "Híbrido"]} />
                      <Input label="Período Inicial" type="date" register={register(`formacoes.${index}.periodoInicio`)} />
                      <Input label="Período Final" type="date" register={register(`formacoes.${index}.periodoFinal`)} />
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
                      <Input label="Empresa" register={register(`experiencias.${index}.empresa`)} />
                      <Input label="CNPJ" register={register(`experiencias.${index}.cnpj`)} />
                      <Select label="Modalidade" register={register(`experiencias.${index}.modalidade`)} options={["Presencial", "Remoto", "Híbrido"]} />
                      <Input label="Período Inicial" type="date" register={register(`experiencias.${index}.periodoInicio`)} />
                      <Input label="Período Final" type="date" register={register(`experiencias.${index}.periodoFinal`)} />
                    </Grid>
                  </CardItem>
                ))}
              </div>
            </Section>

            <Section title="Financeiro">
              <Grid>
                <Input label="Salário" register={register("salario")} />
                <Select label="Pagamento" register={register("pagamento")} options={["Depósito", "Espécie", "PIX", "Cheque"]} />
              </Grid>
            </Section>

            <Section title="Documentos">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="RG" register={register("rgFuncionario")} />
                  <FileInput label="Comprovante Residência" register={register("comprovanteResidencia")} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="Diploma" register={register("diploma")} />
                  <FileInput label="Referências" register={register("referencias")} />
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
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}
function Input({ label, register, type = "text", onBlur }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <input
        type={type}
        {...register}
        onBlur={onBlur}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  register: UseFormRegisterReturn;
  options: string[];
}
function Select({ label, register, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <select
        {...register}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FileInputProps {
  label: string;
  register?: UseFormRegisterReturn;
}
function FileInput({ label, register }: FileInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <input
        type="file"
        {...register}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:cursor-pointer"
      />
    </div>
  );
}