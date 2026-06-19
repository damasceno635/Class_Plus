import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";

export type Cargo = "admin" | "secretary" | "coordinator" | "teacher" | "student";

interface User {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo; 
}

interface AuthContextData {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quando o usuário abre a página, verifica se ele já estava logado antes
  useEffect(() => {
    const storagedUser = localStorage.getItem("@ClassPlus:user");
    const storagedToken = localStorage.getItem("@ClassPlus:token");

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
    setIsLoading(false);  // só libera depois de verificar
  }, []);

  async function login(email: string, senha: string) {
    try {
      // POST para a API real
      const response = await api.post("/login", { email, senha });

      const { user, token } = response.data;

      // Salva o token e os dados do usuário no navegador (para não deslogar ao atualizar a página)
      localStorage.setItem("@ClassPlus:token", token);
      localStorage.setItem("@ClassPlus:user", JSON.stringify(user));

      // Atualiza o estado da aplicação
      setUser(user);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Email ou senha incorretos!");
      throw error; // Repassa o erro para a tela de login lidar
    }
  }

  function logout() {
    // Limpa a memória do navegador e o estado
    localStorage.removeItem("@ClassPlus:token");
    localStorage.removeItem("@ClassPlus:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}