import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  useController,
  type UseFormRegisterReturn,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { api } from "../../services/api";

/* TYPES */ 
interface Responsavel {
  parentesco: string;
  nome: string;
  cpf: string;
  contato: string;
  email: string;
}

interface Deficiencia {
  nome: string;
  apoio: string;
  laudo?: FileList;
}

interface Alergia {
  nome: string;
  laudo?: FileList;
}

interface AlunoFormData {
  status: string;
  nome: string;
  cpf: string;
  email: string;
  nascimento: string;
  sexo: string;
  nivelEnsino: string;
  anoTurma: string;
  serieTurma: string;
  anoLetivo: string;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  bloco: string;
  quadra: string;
  numero: string;
  responsaveis: Responsavel[];
  possuiDeficiencia: boolean;
  deficiencias: Deficiencia[];
  possuiAlergia: boolean;
  alergias: Alergia[];
  foto?: FileList;
  rgAluno?: FileList;
  rgResponsavel?: FileList;
  comprovanteResidencia?: FileList;
  historicoEscolar?: FileList;
}

/* MASKED INPUT */
interface MaskedInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  maskType: "cpf" | "phone" | "cep" | "number";
  required?: boolean;
  placeholder?: string;
  onBlur?: (value: string) => void;
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

function MaskedInput<T extends FieldValues>({
  control, name, label, maskType, required, placeholder, onBlur: externalOnBlur,
}: MaskedInputProps<T>) {
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
    if (externalOnBlur) {
      const rawDigits = e.target.value.replace(/\D/g, "");
      externalOnBlur(rawDigits);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="text" value={value || ""} onChange={handleChange} onBlur={handleBlur} ref={ref} placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

/* COMPONENTE PRINCIPAL  */
export default function EditarAluno() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register, control, handleSubmit, reset, watch, setValue, setError, formState: { errors },
  } = useForm<AlunoFormData>({
    defaultValues: { responsaveis: [], deficiencias: [], alergias: [], possuiDeficiencia: false, possuiAlergia: false },
  });

  const { fields: responsavelFields, append: appendResponsavel, remove: removeResponsavel } = useFieldArray({ control, name: "responsaveis" });
  const { fields: deficienciaFields, append: appendDeficiencia, remove: removeDeficiencia } = useFieldArray({ control, name: "deficiencias" });
  const { fields: alergiaFields, append: appendAlergia, remove: removeAlergia } = useFieldArray({ control, name: "alergias" });

  const possuiDeficiencia = watch("possuiDeficiencia");
  const possuiAlergia = watch("possuiAlergia");
  const deficiencias = watch("deficiencias");
  const alergias = watch("alergias");

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
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  useEffect(() => {
    if (!id) return;

    async function fetchAluno() {
      setLoadingInicial(true);
      setErrorInicial(null);
      try {
        const response = await api.get(`/alunos/${id}`);
        const alunoInfo = response.data;

        // Mapeando os dados da API para o formato que o formulário espera
        reset({
          status: alunoInfo.status,
          nome: alunoInfo.nome,
          email: alunoInfo.email,
          cpf: alunoInfo.cpf,
          nascimento: alunoInfo.nascimento,
          sexo: alunoInfo.sexo,
          nivelEnsino: alunoInfo.nivel,
          anoTurma: alunoInfo.ano,
          serieTurma: alunoInfo.serie,
          anoLetivo: alunoInfo.anoLetivo,
          cep: alunoInfo.endereco.cep,
          cidade: alunoInfo.endereco.cidade,
          estado: alunoInfo.endereco.estado,
          rua: alunoInfo.endereco.rua,
          bloco: alunoInfo.endereco.bloco,
          quadra: alunoInfo.endereco.quadra,
          numero: alunoInfo.endereco.numero,
          responsaveis: alunoInfo.responsaveis,
          possuiDeficiencia: alunoInfo.deficiencias.length > 0,
          deficiencias: alunoInfo.deficiencias,
          possuiAlergia: alunoInfo.alergias.length > 0,
          // A API devolve um array de strings, mas o formulário espera objetos { nome: "x" }
          alergias: alunoInfo.alergias.map((a: string) => ({ nome: a })),
        });
      } catch (err: any) {
        setErrorInicial(err.response?.data?.error || "Erro ao carregar dados do aluno");
      } finally {
        setLoadingInicial(false);
      }
    }

    fetchAluno();
  }, [id, reset]);

  const onSubmit = async (data: AlunoFormData) => {
    if (possuiDeficiencia && deficiencias.length === 0) {
      setError("deficiencias", { type: "manual", message: "Adicione pelo menos uma deficiência." });
      return;
    }
    if (possuiAlergia && alergias.length === 0) {
      setError("alergias", { type: "manual", message: "Adicione pelo menos uma alergia." });
      return;
    }

    setSalvando(true);
    try {
      const formData = new FormData();

      // Campos de texto
      formData.append("nome", data.nome);
      formData.append("email", data.email);
      formData.append("cpf", data.cpf);
      formData.append("nascimento", data.nascimento);
      formData.append("sexo", data.sexo);
      formData.append("nivelEnsino", data.nivelEnsino);
      formData.append("anoTurma", data.anoTurma);
      formData.append("serieTurma", data.serieTurma);
      formData.append("anoLetivo", data.anoLetivo);
      formData.append("cep", data.cep);
      formData.append("cidade", data.cidade);
      formData.append("estado", data.estado);
      formData.append("rua", data.rua);
      formData.append("numero", data.numero);
      formData.append("status", data.status);
      formData.append("bloco", data.bloco || "");
      formData.append("quadra", data.quadra || "");

      // Arrays (Limpando ficheiros antes do JSON.stringify)
      formData.append("responsaveis", JSON.stringify(data.responsaveis));

      if (data.possuiDeficiencia && data.deficiencias.length > 0) {
        const deficienciasLimpas = data.deficiencias.map(def => ({ nome: def.nome, apoio: def.apoio }));
        formData.append("deficiencias", JSON.stringify(deficienciasLimpas));
      }
      
      if (data.possuiAlergia && data.alergias.length > 0) {
        const alergiasLimpas = data.alergias.map(alergia => ({ nome: alergia.nome }));
        formData.append("alergias", JSON.stringify(alergiasLimpas));
      }

      // Laudos
      if (data.possuiDeficiencia) {
        data.deficiencias.forEach((def) => {
          if (def.laudo && def.laudo.length > 0) formData.append("laudosMedicos", def.laudo[0]);
        });
      }

      if (data.possuiAlergia) {
        data.alergias.forEach((alergia) => {
          if (alergia.laudo && alergia.laudo.length > 0) formData.append("laudosMedicos", alergia.laudo[0]);
        });
      }
      
      // Ficheiros Gerais
      if (data.foto && data.foto.length > 0) formData.append("foto", data.foto[0]);
      if (data.rgAluno && data.rgAluno.length > 0) formData.append("rgAluno", data.rgAluno[0]);
      if (data.rgResponsavel && data.rgResponsavel.length > 0) formData.append("rgResponsavel", data.rgResponsavel[0]);
      if (data.comprovanteResidencia && data.comprovanteResidencia.length > 0) formData.append("comprovanteResidencia", data.comprovanteResidencia[0]);
      if (data.historicoEscolar && data.historicoEscolar.length > 0) formData.append("historicoEscolar", data.historicoEscolar[0]);

      // Envio via PUT
      await api.put(`/alunos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({ type: "success", message: "Aluno atualizado com sucesso! Redirecionando..." });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err: any) {
      setToast({ type: "error", message: err.response?.data?.error || "❌ Erro ao atualizar." });
      setSalvando(false);
    }
  };

  if (loadingInicial) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></main>
        <Footer /></div>
      </div>
    );
  }

  if (errorInicial) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar /><div className="flex-1 flex flex-col min-w-0"><Header />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center"><AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" /><p className="text-slate-700 dark:text-slate-300">{errorInicial}</p><button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Voltar</button></div>
        </main><Footer /></div>
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
            <button onClick={() => navigate(-1)} title="Voltar" className="p-2 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Editar Aluno</h1>
              <p className="text-slate-500 dark:text-slate-400">Atualização completa do cadastro</p>
            </div>
          </div>

          {toast && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
              <div
                className={`
                  px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border flex items-center gap-3
                  ${
                    toast.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                  }
                `}
              >
                <span className="text-xl">
                  {toast.type === "success" ? "✅" : "❌"}
                </span>
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Section title="Foto do Aluno">
              <FileInput label="Atualizar Foto (Deixe em branco para manter a atual)" register={register("foto")} />
            </Section>

            <Section title="Dados Básicos">
              <Grid>
                <Select label="Status" register={register("status", { required: "Obrigatório" })} options={["Matriculado", "Pré-Matriculado", "Inativo", "Desistente"]} error={errors.status?.message} />
                <Input label="Nome" register={register("nome", { required: "Obrigatório" })} error={errors.nome?.message} />
                <MaskedInput control={control} name="cpf" label="CPF" maskType="cpf" required />
                <Input label="Email" type="email" register={register("email", { required: "Obrigatório" })} error={errors.email?.message} />
                <Input label="Nascimento" type="date" register={register("nascimento", { required: "Obrigatório" })} error={errors.nascimento?.message} />
                <Select label="Sexo" register={register("sexo", { required: "Obrigatório" })} options={["Masculino", "Feminino"]} error={errors.sexo?.message} />
                <Select label="Nível de Ensino" register={register("nivelEnsino", { required: "Obrigatório" })} options={["Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"]} error={errors.nivelEnsino?.message} />
                <Select label="Ano" register={register("anoTurma", { required: "Obrigatório" })} options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]} error={errors.anoTurma?.message} />
                <Select label="Série" register={register("serieTurma", { required: "Obrigatório" })} options={["A", "B", "C", "D"]} error={errors.serieTurma?.message} />
                <Select label="Ano Letivo" register={register("anoLetivo", { required: "Obrigatório" })} options={["2026.1", "2026.2", "2027.1", "2027.2"]} error={errors.anoLetivo?.message} />
              </Grid>
            </Section>

            <Section title="Endereço">
              <Grid>
                <MaskedInput control={control} name="cep" label="CEP" maskType="cep" required onBlur={buscarCEP} />
                <Input label="Cidade" register={register("cidade", { required: "Obrigatório" })} error={errors.cidade?.message} />
                <Input label="Estado" register={register("estado", { required: "Obrigatório" })} error={errors.estado?.message} />
                <Input label="Rua" register={register("rua", { required: "Obrigatório" })} error={errors.rua?.message} />
                <Input label="Bloco" register={register("bloco")} error={errors.bloco?.message} />
                <Input label="Quadra" register={register("quadra")} error={errors.quadra?.message} />
                <Input label="Número" register={register("numero", { required: "Obrigatório" })} error={errors.numero?.message} />
              </Grid>
            </Section>

            <Section title="Responsáveis">
              <button type="button" onClick={() => appendResponsavel({ parentesco: "", nome: "", cpf: "", contato: "", email: "" })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5"><Plus size={18} /> Adicionar Responsável</button>
              <div className="space-y-6">
                {responsavelFields.map((field, index) => (
                  <div key={field.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between mb-4"><h3 className="font-semibold text-slate-900 dark:text-white">Responsável {index + 1}</h3><button type="button" onClick={() => removeResponsavel(index)} className="text-red-600"><Trash2 size={20} /></button></div>
                    <Grid>
                      <Input label="Parentesco" register={register(`responsaveis.${index}.parentesco`, { required: "Obrigatório" })} error={errors.responsaveis?.[index]?.parentesco?.message} />
                      <Input label="Nome" register={register(`responsaveis.${index}.nome`, { required: "Obrigatório" })} error={errors.responsaveis?.[index]?.nome?.message} />
                      <MaskedInput control={control} name={`responsaveis.${index}.cpf`} label="CPF" maskType="cpf" required />
                      <MaskedInput control={control} name={`responsaveis.${index}.contato`} label="Contato" maskType="phone" required />
                      <Input label="Email" type="email" register={register(`responsaveis.${index}.email`, { required: "Obrigatório" })} error={errors.responsaveis?.[index]?.email?.message} />
                    </Grid>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Deficiências">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300"><input type="checkbox" {...register("possuiDeficiencia")} className="w-4 h-4 rounded" />Possui deficiência?</label>
              {possuiDeficiencia && (
                <div className="mt-5">
                  <button type="button" onClick={() => appendDeficiencia({ nome: "", apoio: "" })} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl mb-5"><Plus size={18} className="inline mr-2" /> Adicionar Deficiência</button>
                  <div className="space-y-5">
                    {deficienciaFields.map((field, index) => (
                      <div key={field.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between mb-4"><h3 className="font-semibold text-slate-900 dark:text-white">Deficiência {index + 1}</h3><button type="button" onClick={() => removeDeficiencia(index)} className="text-red-600"><Trash2 size={20} /></button></div>
                        <Grid>
                          <Input label="Deficiência" register={register(`deficiencias.${index}.nome`, { required: "Obrigatório" })} error={errors.deficiencias?.[index]?.nome?.message} />
                          <Select label="Precisa de Apoio?" register={register(`deficiencias.${index}.apoio`, { required: "Obrigatório" })} options={["Sim", "Não"]} error={errors.deficiencias?.[index]?.apoio?.message} />
                          <FileInput label="Novo Laudo (Opcional)" register={register(`deficiencias.${index}.laudo` as any)} />
                        </Grid>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Alergias">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300"><input type="checkbox" {...register("possuiAlergia")} className="w-4 h-4 rounded" />Possui alergia?</label>
              {possuiAlergia && (
                <div className="mt-5">
                  <button type="button" onClick={() => appendAlergia({ nome: "" })} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl mb-5"><Plus size={18} className="inline mr-2" /> Adicionar Alergia</button>
                  <div className="space-y-5">
                    {alergiaFields.map((field, index) => (
                      <div key={field.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between mb-4"><h3 className="font-semibold text-slate-900 dark:text-white">Alergia {index + 1}</h3><button type="button" onClick={() => removeAlergia(index)} className="text-red-600"><Trash2 size={20} /></button></div>
                        <Grid>
                          <Input label="Alergia" register={register(`alergias.${index}.nome`, { required: "Obrigatório" })} error={errors.alergias?.[index]?.nome?.message} />
                          <FileInput label="Novo Laudo (Opcional)" register={register(`alergias.${index}.laudo` as any)} />
                        </Grid>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Adicionar Novos Documentos (Opcional)">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="RG do Aluno" register={register("rgAluno")} />
                  <FileInput label="RG Responsáveis" register={register("rgResponsavel")} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileInput label="Comprovante Residência" register={register("comprovanteResidencia")} />
                  <FileInput label="Histórico Escolar" register={register("historicoEscolar")} />
                </div>
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

/* COMPONENTES AUXILIARES */
function Section({ title, children }: { title: string; children: React.ReactNode }) { return (<section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow border border-slate-200 dark:border-slate-800"><h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>{children}</section>); }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>; }
function Input({ label, register, type = "text", error }: { label: string; register: UseFormRegisterReturn; type?: string; error?: string }) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-slate-300">{label}</label><input type={type} {...register} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />{error && <p className="text-sm text-red-500 mt-1">{error}</p>}</div>); }
function Select({ label, register, options, error }: { label: string; register: UseFormRegisterReturn; options: string[]; error?: string }) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-slate-300">{label}</label><select {...register} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Selecione</option>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>{error && <p className="text-sm text-red-500 mt-1">{error}</p>}</div>); }
function FileInput({ label, register }: { label: string; register?: UseFormRegisterReturn }) { return (<div className="flex flex-col gap-2"><label className="font-medium text-slate-700 dark:text-slate-300">{label}</label><input type="file" {...register} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:cursor-pointer" /></div>); }