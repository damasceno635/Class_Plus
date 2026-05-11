import { motion } from "framer-motion";
import { Moon, Sun, Mail, Lock } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const themeContext = useTheme() as { theme?: string; toggleTheme: () => void };
  const { toggleTheme } = themeContext;
  const isDark = themeContext.theme === "dark";

  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        px-4
        transition-all
        duration-300
        bg-slate-50
        dark:bg-slate-950
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          w-full
          max-w-md
          rounded-3xl
          p-8
          shadow-2xl
          border
          bg-white
          dark:bg-slate-900
          border-slate-200
          dark:border-slate-800
        "
      >
        {/* Header com Logo e Toggle Theme */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500">
              Class+
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Educação Inteligente para o Futuro
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="
              p-2 
              rounded-full 
              bg-blue-600 
              hover:bg-blue-700 
              text-white 
              cursor-pointer
              transition-all
              hover:scale-110
            "
            aria-label={isDark ? "Modo claro" : "Modo escuro"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Formulário */}
        <form className="space-y-5">
          {/* Campo Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>

            <div className="relative mt-2">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />

              <input
                type="email"
                placeholder="Digite seu email"
                className="
                  w-full
                  pl-10
                  p-3
                  rounded-xl
                  border
                  outline-none
                  transition-all
                  bg-white
                  dark:bg-slate-800
                  border-slate-300
                  dark:border-slate-700
                  text-slate-900
                  dark:text-white
                  placeholder:text-slate-400
                  dark:placeholder:text-slate-500
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Senha
            </label>

            <div className="relative mt-2">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />

              <input
                type="password"
                placeholder="Digite sua senha"
                className="
                  w-full
                  pl-10
                  p-3
                  rounded-xl
                  border
                  outline-none
                  transition-all
                  bg-white
                  dark:bg-slate-800
                  border-slate-300
                  dark:border-slate-700
                  text-slate-900
                  dark:text-white
                  placeholder:text-slate-400
                  dark:placeholder:text-slate-500
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />
            </div>
          </div>

          {/* Link Esqueceu a Senha */}
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueceu a senha?
            </a>
          </div>

          {/* Botão Entrar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              w-full
              p-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              transition-all
              cursor-pointer
              shadow-lg
              hover:shadow-xl
            "
          >
            Entrar
          </motion.button>
        </form>

        {/* Rodapé */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          © 2025 Class+. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}