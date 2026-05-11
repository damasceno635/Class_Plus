import { type ChangeEvent } from "react";
import Sidebar from "../../components/layout/Sidebar";

import Header from "../../components/layout/Header";

import {
  Camera,
  Lock,
  LogOut,
  Save,
} from "lucide-react";

import { useTheme } from "../../contexts/ThemeContext";

export default function Profile() {
  const {
    profileImage,
    setProfileImage,
  } = useTheme();

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
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

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main
          className="
            p-4
            md:p-8
            max-w-5xl
            mx-auto
          "
        >
          {/* HEADER */}

          <div className="mb-8">
            <h1
              className="
                text-3xl
                font-bold
                text-slate-800
                dark:text-white
              "
            >
              Meu Perfil
            </h1>

            <p
              className="
                text-slate-500
                dark:text-slate-400
              "
            >
              Informações da conta
            </p>
          </div>

          {/* CARD */}

          <div
            className="
              bg-white
              dark:bg-slate-900
              border
              border-slate-200
              dark:border-slate-800
              rounded-3xl
              shadow-sm
              overflow-hidden
            "
          >
            {/* TOP */}

            <div
              className="
                h-40
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
              "
            />

            {/* CONTENT */}

            <div className="p-6 md:p-10">
              {/* FOTO */}

              <div
                className="
                  relative
                  -mt-24
                  mb-8
                  w-fit
                "
              >
                <div
                  className="
                    w-40
                    h-40
                    rounded-full
                    border-4
                    border-white
                    bg-slate-200
                    dark:bg-slate-700
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                  "
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Foto do perfil"
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    <span
                      className="
                        text-slate-500
                        dark:text-slate-300
                        text-sm
                        text-center
                        px-4
                      "
                    >
                      Sem foto
                    </span>
                  )}
                </div>

                <label
                  className="
                  absolute
                  bottom-2
                  right-2
                  bg-blue-600
                  hover:bg-blue-700
                  p-3
                  rounded-full
                  text-white
                  transition-all
                  cursor-pointer
                "
              >
                <Camera size={18} />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                  </label>
              </div>

              {/* FORM */}

              <div className="space-y-8">
                {/* DADOS */}

                <div>
                  <h2
                    className="
                      text-xl
                      font-bold
                      mb-5
                      text-slate-800
                      dark:text-white
                    "
                  >
                    Dados Pessoais
                  </h2>

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >
                    <Input
                      label="Nome"
                      placeholder="Administrador"
                    />

                    <Input
                      label="Email"
                      placeholder="admin@classplus.com"
                    />

                    <Input
                      label="Cargo"
                      placeholder="Diretoria"
                    />

                    <Input
                      label="Registro"
                      placeholder="REG-2026-001"
                    />

                    <Input
                      label="Ingresso"
                      placeholder="Janeiro 2026"
                    />
                  </div>
                </div>

                {/* SENHA */}

                <div>
                  <h2
                    className="
                      text-xl
                      font-bold
                      mb-5
                      text-slate-800
                      dark:text-white
                    "
                  >
                    Segurança
                  </h2>

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >
                    <Input
                      type="password"
                      label="Nova Senha"
                    />

                    <Input
                      type="password"
                      label="Confirmar Senha"
                    />
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    gap-4
                  "
                >
                  <button
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-6
                      py-4
                      rounded-2xl
                      transition-all
                    "
                  >
                    <Save size={18} />

                    Salvar Alterações
                  </button>

                  <button
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-slate-200
                      dark:bg-slate-800
                      text-slate-800
                      dark:text-white
                      px-6
                      py-4
                      rounded-2xl
                      transition-all
                    "
                  >
                    <Lock size={18} />

                    Alterar Senha
                  </button>

                  <button
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-red-600
                      hover:bg-red-700
                      text-white
                      px-6
                      py-4
                      rounded-2xl
                      transition-all
                    "
                  >
                    <LogOut size={18} />

                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
}

function Input({
  label,
  placeholder,
  type = "text",
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="
          font-medium
          text-slate-700
          dark:text-white
        "
      >
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full
          p-4
          rounded-2xl
          border
          border-slate-300
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
          transition-all
        "
      />
    </div>
  );
}