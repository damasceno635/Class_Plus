import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Cargo } from "../../contexts/AuthContext";

const DesempenhoAdmin = lazy(() => import("./admin/DesempenhoAdmin"));
const DesempenhoSecretary = lazy(() => import("./secretary/DesempenhoSecretary"));
const DesempenhoCoordinator = lazy(() => import("./coordinator/DesempenhoCoordinator"));
const DesempenhoTeacher = lazy(() => import("./teacher/DesempenhoTeacher"));
const DesempenhoStudent = lazy(() => import("./student/DesempenhoStudent"));

export default function Desempenho() {
  const { user } = useAuth();

  console.log("cargo:", user?.cargo);

  const desempenho: Record<Cargo, React.ReactNode> = {
    admin: <DesempenhoAdmin />,
    secretary: <DesempenhoSecretary />,
    coordinator: <DesempenhoCoordinator />,
    teacher: <DesempenhoTeacher />,
    student: <DesempenhoStudent />
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
      {desempenho[user.cargo]}
    </Suspense>
  );
}