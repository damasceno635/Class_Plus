import { type ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import { Camera, Lock, LogOut, Save, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// IMPORTAR O CONTEXTO DE AUTENTICAÇÃO 👇
import { useAuth } from "../../contexts/AuthContext";

const roleTranslations: Record<string, string> = {
  admin: "Administrador",
  secretary: "Secretário(a)",
  coordinator: "Coordenador(a)",
  teacher: "Professor(a)",
  student: "Aluno(a)",
};

export default function Profile() {
  const navigate = useNavigate(); 
  const { profileImage, setProfileImage } = useTheme();
  
  // PEGANDO O USUÁRIO LOGADO 👇
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  // DADOS FAKE BASEADOS NO PERFIL (Como é só frontend por enquanto)
  const userRoleTranslated = user ? roleTranslations[user.cargo] : "Sem Cargo";
  const userEmail = user ? `${user.cargo}@classplus.com`.toLowerCase() : "";
  const userRegistro = user ? `REG-2026-${user.cargo.toUpperCase().substring(0,3)}` : "";

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-4 md:p-8 max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Meu Perfil
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Informações da conta logada
                </p>
              </div>
            </div>

            <button 
              title="Fechar Perfil"
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="p-6 md:p-10">
              <div className="relative -mt-24 mb-8 w-fit">
                <div className="w-40 h-40 rounded-full border-4 border-white bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Foto do perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 dark:text-slate-300 text-sm text-center px-4">Sem foto</span>
                  )}
                </div>

                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition-all cursor-pointer">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* INJETANDO OS DADOS DINÂMICOS AQUI 👇 */}
                    <Input label="Nome" defaultValue={user?.nome} />
                    <Input label="Email" defaultValue={userEmail} />
                    <Input label="Cargo" defaultValue={userRoleTranslated} />
                    <Input label="Registro" defaultValue={userRegistro} />
                    <Input label="Ingresso" defaultValue="Janeiro 2026" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">Segurança</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input type="password" label="Nova Senha" placeholder="••••••••" />
                    <Input type="password" label="Confirmar Senha" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl transition-all font-semibold">
                    <Save size={18} /> Salvar Alterações
                  </button>

                  <button className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-4 rounded-2xl transition-all font-semibold">
                    <Lock size={18} /> Alterar Senha
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl transition-all font-semibold"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

// COMPONENTE AUXILIAR ATUALIZADO (Adicionado defaultValue)
interface InputProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}

function Input({ label, placeholder, defaultValue, type = "text" }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue} // Usado para injetar os dados iniciais do React
        className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}