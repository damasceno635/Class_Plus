import { type ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useForm } from "react-hook-form";
import { Camera, LogOut, Save, X, Loader2 } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

const roleTranslations: Record<string, string> = {
  admin: "Administrador",
  secretary: "Secretário(a)",
  coordinator: "Coordenador(a)",
  teacher: "Professor(a)",
  student: "Aluno(a)",
};

interface ProfileFormData {
  nome: string;
  email: string;
  novaSenha?: string;
  confirmarSenha?: string;
}

export default function Profile() {
  const navigate = useNavigate(); 
  const { profileImage, setProfileImage } = useTheme();
  const { user, logout } = useAuth();
  
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<ProfileFormData>();

  // Carrega os dados reais do banco de dados ao abrir a tela
  useEffect(() => {
    window.scrollTo(0, 0);
    async function carregarPerfil() {
      try {
        const response = await api.get('/perfil');
        setValue("nome", response.data.nome);
        setValue("email", response.data.email);
        
        if (response.data.fotoUrl) {
          setProfileImage(response.data.fotoUrl);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }
    carregarPerfil();
  }, [setValue, setProfileImage]);

  // Lida com a seleção da imagem e mostra uma pré-visualização instantânea
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFotoFile(file); // Guarda o arquivo físico para enviar à API

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result); // Atualiza visualmente na hora
      }
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  // Envio dos dados para a API
  const onSubmit = async (data: ProfileFormData) => {
    // 1. Validação de senhas
    if (data.novaSenha && data.novaSenha !== data.confirmarSenha) {
      setError("confirmarSenha", { type: "manual", message: "As senhas não coincidem." });
      return;
    }

    setSalvando(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("email", data.email);
      
      if (data.novaSenha) {
        formData.append("novaSenha", data.novaSenha);
      }

      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      const response = await api.put("/perfil", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFeedback({ type: "success", message: "Perfil atualizado com sucesso!" });
      
      // Se a API devolveu uma URL oficial da foto, atualiza o contexto global
      if (response.data.fotoNova) {
        setProfileImage(response.data.fotoNova);
      }

      // Limpa os campos de senha
      setValue("novaSenha", "");
      setValue("confirmarSenha", "");

      // Esconde o aviso após 3 segundos
      setTimeout(() => setFeedback(null), 3000);

    } catch (error: any) {
      setFeedback({ type: "error", message: error.response?.data?.error || "Erro ao atualizar perfil." });
    } finally {
      setSalvando(false);
    }
  };

  const userRoleTranslated = user ? roleTranslations[user.cargo] : "Sem Cargo";
  const userRegistro = user ? `REG-2026-${user.cargo.toUpperCase().substring(0,3)}` : "";

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meu Perfil</h1>
                <p className="text-slate-500 dark:text-slate-400">Informações da conta logada</p>
              </div>
            </div>

            <button 
              title="Fechar Perfil"
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-full hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${feedback.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
              {feedback.message}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10">
              <div className="relative -mt-24 mb-8 w-fit">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Foto do perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 dark:text-slate-300 text-sm text-center px-4">Sem foto</span>
                  )}
                </div>

                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition-all cursor-pointer shadow-lg">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Nome</label>
                      <input {...register("nome", { required: "Obrigatório" })} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                      {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Email de Acesso</label>
                      <input {...register("email", { required: "Obrigatório" })} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                      {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Cargo (Somente leitura)</label>
                      <input readOnly value={userRoleTranslated} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Registro Interno</label>
                      <input readOnly value={userRegistro} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">Segurança (Opcional)</h2>
                  <p className="text-sm text-slate-500 mb-4">Preencha apenas se desejar alterar a sua palavra-passe atual.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Nova Senha</label>
                      <input type="password" placeholder="••••••••" {...register("novaSenha")} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-slate-700 dark:text-white">Confirmar Nova Senha</label>
                      <input type="password" placeholder="••••••••" {...register("confirmarSenha")} className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                      {errors.confirmarSenha && <span className="text-red-500 text-sm">{errors.confirmarSenha.message}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="submit" disabled={salvando} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all font-semibold disabled:opacity-50">
                    {salvando ? <><Loader2 className="animate-spin" size={18} /> A Guardar...</> : <><Save size={18} /> Guardar Alterações</>}
                  </button>

                  <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl transition-all font-semibold md:ml-auto">
                    <LogOut size={18} /> Terminar Sessão
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}