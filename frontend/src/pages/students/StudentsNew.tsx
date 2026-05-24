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
import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* --------------------------------------------------- */
/* TYPES                                              */
/* --------------------------------------------------- */
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

/* --------------------------------------------------- */
/* MASKED INPUT (CPF / PHONE / CEP)                   */
/* --------------------------------------------------- */
interface MaskedInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  maskType: "cpf" | "phone" | "cep" | "number";
  required?: boolean;
  placeholder?: string;
  onBlur?: (value: string) => void; // para o CEP buscar após o blur
}

// Aplica máscara e limita quantidade de dígitos
const applyMaskAndLimit = (value: string, maskType: "cpf" | "phone" | "cep" | "number"): string => {
  let digits = value.replace(/\D/g, "");
  
  // Limitar número de dígitos
  if (maskType === "cpf" || maskType === "phone") {
    digits = digits.slice(0, 11);
  } else if (maskType === "cep") {
    digits = digits.slice(0, 8);
  }
  // "number" não tem limite de tamanho, apenas não permite letras

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
  return digits; // number mask: apenas números sem formatação
};

function MaskedInput<T extends FieldValues>({
  control,
  name,
  label,
  maskType,
  required,
  placeholder,
  onBlur: externalOnBlur,
}: MaskedInputProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    control,
    name,
    rules: required
      ? {
          required: "Preencha este campo.",
          validate: (val: string) => {
            const digits = val?.replace(/\D/g, "") || "";
            if (maskType === "cpf" && digits.length !== 11) return "CPF deve ter 11 números.";
            if (maskType === "phone" && digits.length !== 11) return "Contato deve ter 11 números (DDD + 9 dígitos).";
            if (maskType === "cep" && digits.length !== 8) return "CEP deve ter 8 números.";
            return true;
          },
        }
      : undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMaskAndLimit(e.target.value, maskType);
    onChange(masked);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur(); // react-hook-form onBlur
    if (externalOnBlur) {
      const rawDigits = e.target.value.replace(/\D/g, "");
      externalOnBlur(rawDigits);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

/* --------------------------------------------------- */
/* MAIN COMPONENT                                     */
/* --------------------------------------------------- */
export default function NovoAluno() {
  const navigate = useNavigate(); // Instanciando a navegação
  const [salvando, setSalvando] = useState(false); // Controle do botão

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AlunoFormData>({
    defaultValues: {
      responsaveis: [],
      deficiencias: [],
      alergias: [],
      possuiDeficiencia: false,
      possuiAlergia: false,
    },
  });

  const {
    fields: responsavelFields,
    append: appendResponsavel,
    remove: removeResponsavel,
  } = useFieldArray({ control, name: "responsaveis" });

  const {
    fields: deficienciaFields,
    append: appendDeficiencia,
    remove: removeDeficiencia,
  } = useFieldArray({ control, name: "deficiencias" });

  const {
    fields: alergiaFields,
    append: appendAlergia,
    remove: removeAlergia,
  } = useFieldArray({ control, name: "alergias" });

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

  const onSubmit = async (data: AlunoFormData) => {
    // Validações que você já tinha feito
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
      // 1. Criamos o "envelope pardo"
      const formData = new FormData();

      // 2. Colocamos todos os textos lá dentro (Exemplo com os principais)
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

      formData.append("responsaveis", JSON.stringify(data.responsaveis));

      // CORREÇÃO: Removendo o FileList do JSON para evitar conflito de String no Prisma
      if (data.possuiDeficiencia && data.deficiencias.length > 0) {
        const deficienciasLimpas = data.deficiencias.map(def => ({
          nome: def.nome,
          apoio: def.apoio
        }));
        formData.append("deficiencias", JSON.stringify(deficienciasLimpas));
      }
      
      if (data.possuiAlergia && data.alergias.length > 0) {
        const alergiasLimpas = data.alergias.map(alergia => ({
          nome: alergia.nome
        }));
        formData.append("alergias", JSON.stringify(alergiasLimpas));
      }

      if (data.possuiDeficiencia) {
        data.deficiencias.forEach((def) => {
          if (def.laudo && def.laudo.length > 0) {
            formData.append("laudosMedicos", def.laudo[0]);
          }
        });
      }

      if (data.possuiAlergia) {
        data.alergias.forEach((alergia) => {
          if (alergia.laudo && alergia.laudo.length > 0) {
            formData.append("laudosMedicos", alergia.laudo[0]);
          }
        });
      }
      
      // 3. Colocamos os arquivos, SE o usuário tiver selecionado algum
      if (data.foto && data.foto.length > 0) formData.append("foto", data.foto[0]);
      if (data.rgAluno && data.rgAluno.length > 0) formData.append("rgAluno", data.rgAluno[0]);
      if (data.rgResponsavel && data.rgResponsavel.length > 0) formData.append("rgResponsavel", data.rgResponsavel[0]);
      if (data.comprovanteResidencia && data.comprovanteResidencia.length > 0) formData.append("comprovanteResidencia", data.comprovanteResidencia[0]);
      if (data.historicoEscolar && data.historicoEscolar.length > 0) formData.append("historicoEscolar", data.historicoEscolar[0]);

      // 4. Enviamos para o Backend
      const response = await api.post("/alunos", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Avisamos que estamos mandando arquivos!
        },
      });

      // 5. Mostramos a matrícula/senha gerada para o admin e redirecionamos!
      const { senhaProvisoria } = response.data.credenciaisAcesso;
      alert(`✅ Aluno cadastrado com sucesso!\n\n🔑 Matrícula e Senha Provisória: ${senhaProvisoria}\n(Guarde este número para passar ao aluno)`);
      
      navigate("/alunos");

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao salvar o aluno.");
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Novo Aluno</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Cadastro completo de aluno</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* FOTO (opcional) */}
            <Section title="Foto do Aluno">
              <FileInput label="Foto do Aluno (Opcional)" register={register("foto")} />
            </Section>

            {/* DADOS BÁSICOS */}
            <Section title="Dados Básicos">
              <Grid>
                <Select
                  label="Status"
                  register={register("status", { required: "Preencha este campo." })}
                  options={["Matriculado", "Pré-Matriculado", "Inativo", "Desistente"]}
                  error={errors.status?.message}
                />
                <Input label="Nome" register={register("nome", { required: "Preencha este campo." })} error={errors.nome?.message} />
                <MaskedInput control={control} name="cpf" label="CPF" maskType="cpf" required />
                <Input
                  label="Email"
                  type="email"
                  register={register("email", {
                    required: "Preencha este campo.",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail inválido." },
                  })}
                  error={errors.email?.message}
                />
                <Input
                  label="Nascimento"
                  type="date"
                  register={register("nascimento", { required: "Preencha este campo." })}
                  error={errors.nascimento?.message}
                />
                <Select
                  label="Sexo"
                  register={register("sexo", { required: "Preencha este campo." })}
                  options={["Masculino", "Feminino"]}
                  error={errors.sexo?.message}
                />
                <Select
                  label="Nível de Ensino"
                  register={register("nivelEnsino", { required: "Preencha este campo." })}
                  options={["Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"]}
                  error={errors.nivelEnsino?.message}
                />
                <Select
                  label="Ano"
                  register={register("anoTurma", { required: "Preencha este campo." })}
                  options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]}
                  error={errors.anoTurma?.message}
                />
                <Select
                  label="Série"
                  register={register("serieTurma", { required: "Preencha este campo." })}
                  options={["A", "B", "C", "D"]}
                  error={errors.serieTurma?.message}
                />
                <Select
                  label="Ano Letivo"
                  register={register("anoLetivo", { required: "Preencha este campo." })}
                  options={["2026.1", "2026.2", "2027.1", "2027.2"]}
                  error={errors.anoLetivo?.message}
                />
              </Grid>
            </Section>

            {/* ENDEREÇO */}
            <Section title="Endereço">
              <Grid>
                <MaskedInput
                  control={control}
                  name="cep"
                  label="CEP"
                  maskType="cep"
                  required
                  onBlur={(rawDigits) => buscarCEP(rawDigits)}
                />
                <Input label="Cidade" register={register("cidade", { required: "Preencha este campo." })} error={errors.cidade?.message} />
                <Input label="Estado" register={register("estado", { required: "Preencha este campo." })} error={errors.estado?.message} />
                <Input label="Rua" register={register("rua", { required: "Preencha este campo." })} error={errors.rua?.message} />
                <Input label="Bloco" register={register("bloco")} error={errors.bloco?.message} />
                <Input label="Quadra" register={register("quadra")} error={errors.quadra?.message} />
                <Input
                  label="Número"
                  register={register("numero", {
                    required: "Preencha este campo.",
                    pattern: { value: /^\d+$/, message: "Apenas números." },
                  })}
                  error={errors.numero?.message}
                />
              </Grid>
            </Section>

            {/* RESPONSÁVEIS */}
            <Section title="Responsáveis">
              <button
                type="button"
                onClick={() =>
                  appendResponsavel({ parentesco: "", nome: "", cpf: "", contato: "", email: "" })
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all mb-5 font-medium"
              >
                <Plus size={18} /> Adicionar Responsável
              </button>
              <div className="space-y-6">
                {responsavelFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Responsável {index + 1}</h3>
                      <button type="button" onClick={() => removeResponsavel(index)} className="text-red-600 dark:text-red-400">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <Grid>
                      <Input
                        label="Parentesco"
                        register={register(`responsaveis.${index}.parentesco`, { required: "Preencha este campo." })}
                        error={errors.responsaveis?.[index]?.parentesco?.message}
                      />
                      <Input
                        label="Nome"
                        register={register(`responsaveis.${index}.nome`, { required: "Preencha este campo." })}
                        error={errors.responsaveis?.[index]?.nome?.message}
                      />
                      <MaskedInput
                        control={control}
                        name={`responsaveis.${index}.cpf`}
                        label="CPF"
                        maskType="cpf"
                        required
                      />
                      <MaskedInput
                        control={control}
                        name={`responsaveis.${index}.contato`}
                        label="Contato"
                        maskType="phone"
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        register={register(`responsaveis.${index}.email`, {
                          required: "Preencha este campo.",
                          pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail inválido." },
                        })}
                        error={errors.responsaveis?.[index]?.email?.message}
                      />
                    </Grid>
                  </div>
                ))}
              </div>
            </Section>

            {/* DEFICIÊNCIAS (opcionais, mas se marcado os campos dentro viram obrigatórios) */}
            <Section title="Deficiências">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" {...register("possuiDeficiencia")} className="w-4 h-4 rounded" />
                Possui deficiência?
              </label>

              {possuiDeficiencia && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => appendDeficiencia({ nome: "", apoio: "" })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl mb-5 transition-all font-medium"
                  >
                    <Plus size={18} className="inline mr-2" /> Adicionar Deficiência
                  </button>
                  <div className="space-y-5">
                    {deficienciaFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between mb-4">
                          <h3 className="font-semibold text-slate-900 dark:text-white">Deficiência {index + 1}</h3>
                          <button type="button" onClick={() => removeDeficiencia(index)} className="text-red-600">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <Grid>
                          <Input
                            label="Deficiência"
                            register={register(`deficiencias.${index}.nome`, {
                              required: possuiDeficiencia ? "Preencha este campo." : false,
                            })}
                            error={errors.deficiencias?.[index]?.nome?.message}
                          />
                          <Select
                            label="Precisa de Apoio?"
                            register={register(`deficiencias.${index}.apoio`, {
                              required: possuiDeficiencia ? "Preencha este campo." : false,
                            })}
                            options={["Sim", "Não"]}
                            error={errors.deficiencias?.[index]?.apoio?.message}
                          />
                          <FileInput 
                          label="Laudo Médico"
                          register={register(`deficiencias.${index}.laudo` as any)} 
                          />
                        </Grid>
                      </div>
                    ))}
                  </div>
                  {errors.deficiencias && typeof errors.deficiencias.message === "string" && (
                    <p className="text-sm text-red-500 mt-2">{errors.deficiencias.message}</p>
                  )}
                </div>
              )}
            </Section>

            {/* ALERGIAS (opcionais, mas se marcado os campos dentro viram obrigatórios) */}
            <Section title="Alergias">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" {...register("possuiAlergia")} className="w-4 h-4 rounded" />
                Possui alergia?
              </label>

              {possuiAlergia && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => appendAlergia({ nome: "" })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl mb-5 transition-all font-medium"
                  >
                    <Plus size={18} className="inline mr-2" /> Adicionar Alergia
                  </button>
                  <div className="space-y-5">
                    {alergiaFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between mb-4">
                          <h3 className="font-semibold text-slate-900 dark:text-white">Alergia {index + 1}</h3>
                          <button type="button" onClick={() => removeAlergia(index)} className="text-red-600">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <Grid>
                          <Input
                            label="Alergia"
                            register={register(`alergias.${index}.nome`, {
                              required: possuiAlergia ? "Preencha este campo." : false,
                            })}
                            error={errors.alergias?.[index]?.nome?.message}
                          />
                          <FileInput 
                          label="Laudo Médico"
                          register={register(`alergias.${index}.laudo` as any)} 
                          />
                        </Grid>
                      </div>
                    ))}
                  </div>
                  {errors.alergias && typeof errors.alergias.message === "string" && (
                    <p className="text-sm text-red-500 mt-2">{errors.alergias.message}</p>
                  )}
                </div>
              )}
            </Section>

            {/* DOCUMENTOS (opcionais) */}
            <Section title="Documentos">
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
                "Salvar Aluno"
              )}
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* --------------------------------------------------- */
/* COMPONENTES AUXILIARES                             */
/* --------------------------------------------------- */
interface SectionProps {
  title: string;
  children: ReactNode;
}
function Section({ title, children }: SectionProps) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>
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

interface InputProps {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
}
function Input({ label, register, type = "text", onBlur, error }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type={type}
        {...register}
        onBlur={onBlur}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        {...register}
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
      <label className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="file"
        {...register} // Conectamos o input ao formulário
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:cursor-pointer"
      />
    </div>
  );
}