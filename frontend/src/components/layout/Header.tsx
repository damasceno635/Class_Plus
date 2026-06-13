import { LogOut, User as UserIcon, Moon, Sun, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

const roleTranslations: Record<string, string> = {
  admin: "Administrador",
  secretary: "Secretário(a)",
  coordinator: "Coordenador(a)",
  teacher: "Professor(a)",
  student: "Aluno(a)",
};

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme, profileImage, setProfileImage } = useTheme();
  const navigate = useNavigate();
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  useEffect(() => {
    if (user) {
      // Busca a foto de perfil
      api.get('/perfil')
        .then(response => setProfileImage(response.data.fotoUrl || ''))
        .catch(error => console.error("Erro ao carregar foto no header:", error));
      
      // Busca notificações para o contador
      api.get('/notificacoes')
        .then(response => {
          const naoLidas = response.data.filter((n: any) => !n.lida).length;
          setNotificacoesNaoLidas(naoLidas);
        })
        .catch(error => console.error("Erro ao carregar notificações no header:", error));

    } else {
      setProfileImage('');
      setNotificacoesNaoLidas(0);
    }
  }, [user?.id, setProfileImage]);

  function handleLogout() {
    setProfileImage(''); // Limpa a memória instantaneamente ao sair
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
          onClick={() => navigate("/notificacoes")}
          title="Ver Notificações"
          className="relative p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-all"
        >
          <Bell size={20} className="text-slate-700 dark:text-white" />
          
          {notificacoesNaoLidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
              {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
            </span>
          )}
        </button>

        {/* BOTÃO TEMA */}
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:scale-105 transition-all text-slate-700 dark:text-white"
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