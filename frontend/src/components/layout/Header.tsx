import { LogOut, User as UserIcon, Moon, Sun, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const roleTranslations: Record<string, string> = {
  admin: "Administrador",
  secretary: "Secretário(a)",
  coordinator: "Coordenador(a)",
  teacher: "Professor(a)",
  student: "Aluno(a)",
};

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme, profileImage } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-10 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex flex-col items-start leading-tight">
        <span className="text-lg font-semibold text-slate-800 dark:text-white">
          Class Plus
        </span>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestão Escolar Inteligente
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">

        {/* NOTIFICAÇÃO */}
        <button
          className="
            relative
            p-3
            rounded-xl
            bg-slate-100
            dark:bg-slate-800
            hover:scale-105
            transition-all
          "
        >
          <Bell
            size={20}
            className="
              text-slate-700
              dark:text-white
            "
          />

          <span
            className="
              absolute
              -top-1
              -right-1
              w-3
              h-3
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* BOTÃO TEMA */}
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="
            p-3
            rounded-xl
            bg-slate-100
            dark:bg-slate-800
            hover:scale-105
            transition-all
            text-slate-700
            dark:text-white
          "
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ÁREA DO PERFIL CLICÁVEL */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-6">
          <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-3 text-left group transition-all"
            title="Ver meu Perfil"
          >
            <div className="hidden sm:flex flex-col items-end group-hover:opacity-80">
              <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {user?.nome || "Usuário"}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user ? roleTranslations[user.cargo] : "Perfil"}
              </span>
            </div>

            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
          </button>

          {/* BOTÃO DE LOGOUT */}
          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-2 ml-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}