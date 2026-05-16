import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileBarChart,
  LineChart,
  DollarSign,
  BookOpen,
  CalendarDays,
  ClipboardList,
  DatabaseBackup,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      label: "Alunos",
      title: "Alunos",
      icon: <GraduationCap size={20} />,
      path: "/alunos",
    },
    {
      label: "Funcionários",
      title: "Funcionários",
      icon: <Users size={20} />,
      path: "/funcionarios",
    },
    {
      label: "Roteiro de Aula",
      title: "Roteiro de Aula",
      icon: <BookOpen size={20} />,
      path: "/roteiro-aula",
    },
    {
      label: "Calendário Escolar",
      title: "Calendário Escolar",
      icon: <CalendarDays size={20} />,
      path: "/calendario",
    },
    {
      label: "Desempenho Acadêmico",
      title: "Desempenho Acadêmico",
      icon: <LineChart size={20} />,
      path: "/desempenho",
    },
    {
      label: "Requisições",
      title: "Requisições",
      icon: <ClipboardList size={20} />,
      path: "/requisicoes",
    },
    {
      label: "Financeiro",
      title: "Financeiro",
      icon: <DollarSign size={20} />,
      path: "/financeiro",
    },
    {
      label: "Relatórios",
      title: "Relatórios",
      icon: <FileBarChart size={20} />,
      path: "/reports",
    },
    {
      label: "Backup",
      title: "Backup",
      icon: <DatabaseBackup size={20} />,
      path: "/backup",
    },
  ];

  return (
    <aside
      className={`
        ${collapsed ? "w-24" : "w-72"}
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
            transition-all
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

      <nav className="flex flex-col gap-3 mt-10">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              hover:bg-slate-800
              transition-all
              cursor-pointer
              text-left
              w-full
            "
          >
            {item.icon}

            {!collapsed && (
              <span className="text-sm font-medium">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}