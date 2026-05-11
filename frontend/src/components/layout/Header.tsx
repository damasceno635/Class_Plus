import {
  Bell,
  Moon,
  Sun,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useTheme } from "../../contexts/ThemeContext";

export default function Header() {
  const {
    darkMode,
    toggleTheme,
    profileImage,
  } = useTheme();

  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-white
        dark:bg-slate-900
        border-b
        border-slate-200
        dark:border-slate-800
        px-4
        md:px-8
        py-4
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        {/* LEFT */}

        <div>
          <h1
            className="
              text-xl
              font-bold
              text-slate-800
              dark:text-white
            "
          >
            Class+
          </h1>

          <p
            className="
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Gestão Escolar Inteligente
          </p>
        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
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

          {/* TEMA */}

          <button
            onClick={toggleTheme}
            className="
              p-3
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
              hover:scale-105
              transition-all
            "
          >
            {darkMode ? (
              <Sun
                size={20}
                className="text-yellow-400"
              />
            ) : (
              <Moon
                size={20}
                className="text-slate-700"
              />
            )}
          </button>

          {/* PERFIL */}

          <Link to="/perfil">
            <div
              className="
                flex
                items-center
                gap-3
                bg-slate-100
                dark:bg-slate-800
                px-3
                py-2
                rounded-2xl
                hover:scale-[1.02]
                transition-all
              "
            >
              <img
                src={
                  profileImage ||
                  "https://i.pravatar.cc/150"
                }
                alt="Perfil"
                className="
                  w-10
                  h-10
                  rounded-full
                  object-cover
                "
              />

              <div className="hidden md:block">
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                    dark:text-white
                  "
                >
                  Admin
                </h3>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Diretoria
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}