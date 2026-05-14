import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  University,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  return (
    <aside
      className={`
      ${
        collapsed ? "w-24" : "w-60"
      }

      sticky
      top-0
      h-screen
      flex-shrink-0
      bg-slate-900
      text-white
      p-5
      transition-all
      duration-300
      flex
      flex-col
      overflow-y-auto
    `}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              Class+
            </h1>

            <p className="text-sm opacity-70">
              Gestão Escolar
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-2
            rounded-lg
            hover:bg-slate-800
            cursor-pointer
          "
        >
          {collapsed ? (
            <ChevronRight />
          ) : (
            <ChevronLeft />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-4 mt-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          <LayoutDashboard />

          {!collapsed && <span>Dashboard</span>}
        </button>

        <button
          onClick={() => navigate("/alunos")}
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          <GraduationCap />

          {!collapsed && <span>Alunos</span>}
        </button>

        <button
          onClick={() => navigate("/funcionarios")}
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          <Users />

          {!collapsed && <span>Funcionários</span>}
        </button>

        <button
          onClick={() => navigate("/relatorios")}
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          <FileBarChart />

          {!collapsed && <span>Relatórios</span>}
        </button>

        <button
          onClick={() => navigate("/backup")}
          className="
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            hover:bg-slate-800
            transition-all
            cursor-pointer
          "
        >
          <DatabaseBackup />

          {!collapsed && <span>Backup</span>}
        </button>
      </nav>
    </aside>
  );
}