/*import { useAuth } from "../../contexts/AuthContext";
import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardSecretary from "./secretary/DashboardSecretary";
import DashboardCoordinator from "./coordinator/DashboardCoordinator";
import DashboardTeacher from "./teacher/DashboardTeacher";
import DashboardStudent from "./student/DashboardStudent";

export default function Dashboard() {
  const { user } = useAuth();

  // Roteamento baseado no cargo
  switch (user?.cargo) {
    case "admin":
      return <DashboardAdmin />;
    case "secretário(a)":
      return <DashboardSecretary />;
    case "coordenador(a)":
      return <DashboardCoordinator />;
    case "professor(a)":
      return <DashboardTeacher />;
    case "aluno(a)":
      return <DashboardStudent />;
    default:
      return <DashboardAdmin />; // Fallback
  }
}*/

// Dashboard.tsx com lazy loading
import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Cargo } from "../../contexts/AuthContext";

const DashboardAdmin = lazy(() => import("./admin/DashboardAdmin"));
const DashboardSecretary = lazy(() => import("./secretary/DashboardSecretary"));
const DashboardCoordinator = lazy(() => import("./coordinator/DashboardCoordinator"));
const DashboardTeacher = lazy(() => import("./teacher/DashboardTeacher"));
const DashboardStudent = lazy(() => import("./student/DashboardStudent"));

export default function Dashboard() {
  const { user } = useAuth();

  console.log("cargo:", user?.cargo);

  const dashboards: Record<Cargo, React.ReactNode> = {
    admin: <DashboardAdmin />,
    secretary: <DashboardSecretary />,
    coordinator: <DashboardCoordinator />,
    teacher: <DashboardTeacher />,
    student: <DashboardStudent />
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      {dashboards[user.cargo]}
    </Suspense>
  );
}