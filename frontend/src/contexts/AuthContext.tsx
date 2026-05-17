import { createContext, useContext, useState } from "react";

type Cargo = "admin" | "secretário(a)" | "coordenador(a)" | "professor(a)" | "aluno(a)";

interface User {
  nome: string;
  cargo: Cargo;
}

interface AuthContextType {
  user: User | null;
  login: (cargo: Cargo) => void;
  logout: () => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(cargo: Cargo) {
    setUser({ nome: "Usuário Teste", cargo });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}