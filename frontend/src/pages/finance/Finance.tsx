import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AdminFinance from "./admin/AdminFinance";
import SecretaryFinance from "./secretary/SecretaryFinance";
import StudentFinance from "./student/StudentFinance";

export default function Finance() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.cargo) {
    case "admin":
      return <AdminFinance />;
    case "secretary":
      return <SecretaryFinance />;
    case "student":
      return <StudentFinance />;
    default:
      // Coordenadores e Professores geralmente não têm acesso ao módulo financeiro
      return <Navigate to="/dashboard" replace />;
  }
}