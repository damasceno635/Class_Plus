interface MetricCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: number; 
}

export default function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300">
          {title}
        </h3>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
      <p className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      {trend !== undefined && (
        <div className={`mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% desde o mês passado
        </div>
      )}
    </div>
  );
}