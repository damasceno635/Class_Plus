import { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  useController,
  type UseFormRegisterReturn,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { ReactNode, FocusEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

/* ===================================================== */
/* TYPES E MÁSCARAS (Mesma estrutura do Novo Funcionário)*/
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

interface MaskedInputProps<T extends FieldValues> {
  control: Control<T>; name: FieldPath<T>; label: string; maskType: "cpf" | "phone" | "cep" | "number";
  required?: boolean; placeholder?: string; onBlur?: (value: string) => void;
}

const applyMaskAndLimit = (value: string, maskType: "cpf" | "phone" | "cep" | "number"): string => {
  let digits = value.replace(/\D/g, "");
  if (maskType === "cpf" || maskType === "phone") digits = digits.slice(0, 11);
  else if (maskType === "cep") digits = digits.slice(0, 8);

  if (maskType === "cpf") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  }
  if (maskType === "phone") {
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return digits.replace(/(\d{2})(\d{1,5})/, "($1) $2");
    return digits.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
  }
  if (maskType === "cep") {
    if (digits.length <= 5) return digits;
    return digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  }
  return digits;
};

function MaskedInput<T extends FieldValues>({ control, name, label, maskType, required, placeholder, onBlur: externalOnBlur }: MaskedInputProps<T>) {
  const { field: { onChange, onBlur, value, ref }, fieldState: { error } } = useController({
    control, name,
    rules: required ? {
      required: "Preencha este campo.",
      validate: (val: string) => {
        const digits = val?.replace(/\D/g, "") || "";
        if (maskType === "cpf" && digits.length !== 11) return "CPF deve ter 11 números.";
        if (maskType === "phone" && digits.length !== 11) return "Contato deve ter 11 números.";
        if (maskType === "cep" && digits.length !== 8) return "CEP deve ter 8 números.";
        return true;
      },
    } : undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMaskAndLimit(e.target.value, maskType);
    onChange(masked);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur();
    if (externalOnBlur) externalOnBlur(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input type="text" value={value || ""} onChange={handleChange} onBlur={handleBlur} ref={ref} placeholder={placeholder} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

/* ===================================================== */
/* COMPONENTE PRINCIPAL                                  */
/* ===================================================== */
export default function EditarFuncionario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FuncionarioFormData>({
    defaultValues: { disciplinas: [], formacoes: [], experiencias: [] },
  });

  const { fields: disciplinaFields, append: appendDisciplina, remove: removeDisciplina } = useFieldArray({ control, name: "disciplinas" });
  const { fields: formacaoFields, append: appendFormacao, remove: removeFormacao } = useFieldArray({ control, name: "formacoes" });
  const { fields: experienciaFields, append: appendExperiencia, remove: removeExperiencia } = useFieldArray({ control, name: "experiencias" });

  const contrato = watch("contrato");

  async function buscarCEP(cepDigits: string) {
    if (cepDigits.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");
        setValue("rua", data.logradouro || "");
      }
    } catch (error) { console.error("Erro ao buscar CEP:", error); }
  }

  // Carregar dados reais da API
  useEffect(() => {
    if (!id) return;
    async function fetchFuncionario() {
      setLoadingInicial(true);
      setErrorInicial(null);
      try {
        const response = await api.get(`/funcionarios/${id}`);
        const f = response.data;

        reset({
          status: f.status, vaga: f.cargo, contrato: f.contrato.tipo, periodoContrato: f.contrato.periodo, 
          dataFimContrato: f.contrato.dataFim !== "Indeterminado" ? f.contrato.dataFim : "",
          nome: f.nome, cpf: f.cpf, ra: f.ra, nascimento: f.nascimento, sexo: f.sexo, celular: f.celular, email: f.email,
          cep: f.endereco.cep, cidade: f.endereco.cidade, estado: f.endereco.estado, rua: f.endereco.rua, 
          bloco: f.endereco.bloco, quadra: f.endereco.quadra, numero: f.endereco.numero,
          salario: f.financeiro.salario, pagamento: f.financeiro.pagamento,
          
          // Separa a string da turma que o backend envia ("1º Ano A")
          disciplinas: f.disciplinas.map((d: any) => {
            const partes = d.turma.split(' ');
            const serieParsed = partes.pop() || "A";
            const turmaParsed = partes.join(' ');
            return { disciplina: d.nome, cargaHoraria: d.carga, turma: turmaParsed, serie: serieParsed, periodo: d.periodo };
          }),
          formacoes: f.formacoes.map((form: any) => {
            const datas = form.periodo.split(' até ');
            return { instituicao: form.instituicao, cnpj: form.cnpj, modalidade: form.modalidade, periodoInicio: datas[0], periodoFinal: datas[1] };
          }),
          experiencias: f.experiencias.map((exp: any) => {
            const datas = exp.periodo.split(' até ');
            return { empresa: exp.empresa, cnpj: exp.cnpj, modalidade: exp.modalidade, periodoInicio: datas[0], periodoFinal: datas[1] };
          })
        });
      } catch (err: any) {
        setErrorInicial(err.response?.data?.error || "Erro ao carregar dados do funcionário");
      } finally {
        setLoadingInicial(false);
      }
    }
    fetchFuncionario();
  }, [id, reset]);

  async function onSubmit(data: FuncionarioFormData) {
    setSalvando(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("status", data.status); formData.append("vaga", data.vaga); formData.append("contrato", data.contrato); formData.append("periodoContrato", data.periodoContrato); formData.append("dataFimContrato", data.dataFimContrato || "");
      formData.append("nome", data.nome); formData.append("cpf", data.cpf); formData.append("ra", data.ra); formData.append("nascimento", data.nascimento); formData.append("sexo", data.sexo); formData.append("celular", data.celular); formData.append("email", data.email);
      formData.append("cep", data.cep); formData.append("cidade", data.cidade); formData.append("estado", data.estado); formData.append("rua", data.rua); formData.append("bloco", data.bloco || ""); formData.append("quadra", data.quadra || ""); formData.append("numero", data.numero);
      formData.append("salario", data.salario); formData.append("pagamento", data.pagamento);

      formData.append("disciplinas", JSON.stringify(data.disciplinas));
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
  }

  if (loadingInicial) return (<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 p-4 md:p-8 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main><Footer /></div></div>);
  if (errorInicial) return (<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header /><main className="flex-1 p-4 md:p-8 flex items-center justify-center"><div className="text-center"><AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" /><p className="text-slate-700 dark:text-slate-300">{errorInicial}</p><button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Voltar</button></div></main><Footer /></div></div>);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <div className="mb-8 flex items-center gap-4">
            <button onClick={() => navigate(-1)} title="Voltar" className="p-2 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Editar Funcionário</h1>
              <p className="text-slate-500 dark:text-slate-400">Atualização cadastral do colaborador</p>
            </div>
          </div>

          {feedback && <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${feedback.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30" : "bg-red-100 text-red-800 dark:bg-red-900/30"}`}>{feedback.message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Section title="Foto">
              <FileInput label="Atualizar Foto (Opcional)" register={register("foto" as any)} />
            </Section>

            <Section title="Informações Básicas">
              <Grid>
                <Select label="Status" register={register("status")} options={["Ativo", "Inativo"]} />
                <Select label="Vaga" register={register("vaga")} options={["Professor(a)", "Coordenador(a)", "Secretário(a)", "Serviços Gerais"]} />
                <Select label="Contrato" register={register("contrato")} options={["Indeterminado", "Determinado", "Experiência", "Temporário", "Intermitente", "Estágio"]} />
                <Select label="Período" register={register("periodoContrato")} options={["Meio Período", "Integral"]} />
                {contrato !== "Indeterminado" && <Input type="date" label="Data Final Contrato" register={register("dataFimContrato")} />}
                <Input label="Nome" register={register("nome")} />
                <MaskedInput control={control} name="cpf" label="CPF" maskType="cpf" required />
                <Input label="RA" register={register("ra")} />
                <Input type="date" label="Nascimento" register={register("nascimento")} />
                <Select label="Sexo" register={register("sexo")} options={["Masculino", "Feminino"]} />
                <MaskedInput control={control} name="celular" label="Celular" maskType="phone" required />
                <Input label="Email" type="email" register={register("email")} />
              </Grid>
            </Section>

            <Section title="Endereço">
              <Grid>
                <MaskedInput control={control} name="cep" label="CEP" maskType="cep" required onBlur={buscarCEP} />
                <Input label="Cidade" register={register("cidade")} />
                <Input label="Estado" register={register("estado")} />
                <Input label="Rua" register={register("rua")} />
                <Input label="Bloco" register={register("bloco")} />
                <Input label="Quadra" register={register("quadra")} />
                <Input label="Número" register={register("numero")} />
              </Grid>
            </Section>

            <Section title="Disciplinas">
              <button type="button" onClick={() => appendDisciplina({ disciplina: "", cargaHoraria: "", turma: "", serie: "", periodo: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5"><Plus size={18} /> Adicionar Disciplina</button>
              <div className="space-y-5">
                {disciplinaFields.map((field, index) => (
                  <CardItem key={field.id} onRemove={() => removeDisciplina(index)}>
                    <Grid>
                      <Select label="Disciplina" register={register(`disciplinas.${index}.disciplina`, { required: "Obrigatório" })} options={["Arte", "Biologia", "Educação Física", "Espanhol", "Filosofia", "Física", "Geografia", "História", "Inglês", "Matemática", "Português", "Sociologia"]} />
                      <Select label="Carga Horária Semanal" register={register(`disciplinas.${index}.cargaHoraria`, { required: "Obrigatório" })} options={["20h", "24h", "40h", "60h", "80h", "100h"]} />
                      <Select label="Turma" register={register(`disciplinas.${index}.turma`, { required: "Obrigatório" })} options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]} />
                      <Select label="Série" register={register(`disciplinas.${index}.serie`, { required: "Obrigatório" })} options={["A", "B", "C", "D"]} />
                      <Select label="Período" register={register(`disciplinas.${index}.periodo`)} options={["Matutino", "Vespertino", "Noturno"]} />
                    </Grid>
                  </CardItem>
                ))}
              </div>
            </Section>

            <Section title="Formações">
              <button type="button" onClick={() => appendFormacao({ instituicao: "", cnpj: "", modalidade: "", periodoInicio: "", periodoFinal: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5"><Plus size={18} /> Adicionar Formação</button>
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
              <button type="button" onClick={() => appendExperiencia({ empresa: "", cnpj: "", periodoInicio: "", periodoFinal: "", modalidade: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5"><Plus size={18} /> Adicionar Experiência</button>
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

            <Section title="Novos Documentos (Opcional)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileInput label="RG Atualizado" register={register("rgFuncionario" as any)} />
                <FileInput label="Novo Comp. de Residência" register={register("comprovanteResidencia" as any)} />
                <FileInput label="Novo Diploma" register={register("diploma" as any)} />
                <FileInput label="Novas Referências" register={register("referencias" as any)} />
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
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

/* --------------------------------------------------- */
/* COMPONENTES AUXILIARES                              */
/* --------------------------------------------------- */
function Section({ title, children }: { title: string; children: ReactNode }) { return (<section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow border border-slate-200 dark:border-slate-800"><h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>{children}</section>); }
function Grid({ children }: { children: ReactNode }) { return (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>); }
function CardItem({ children, onRemove }: { children: ReactNode; onRemove: () => void }) { return (<div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"><div className="flex justify-end mb-4"><button type="button" onClick={onRemove} className="text-red-600 hover:scale-110 transition-all"><Trash2 size={20} /></button></div>{children}</div>); }
function Input({ label, register, type = "text", onBlur }: any) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-white">{label}</label><input type={type} {...register} onBlur={onBlur} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>); }
function Select({ label, register, options }: any) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-white">{label}</label><select {...register} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Selecione</option>{options.map((option: string) => (<option key={option} value={option}>{option}</option>))}</select></div>); }
function FileInput({ label, register }: any) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-white">{label}</label><input type="file" {...register} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:cursor-pointer" /></div>); }