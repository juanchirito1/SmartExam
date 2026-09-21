import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: Props) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4 sm:p-5
        shadow-sm
        transition-all
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 hidden text-xs text-slate-400 sm:block">{description}</p>
          )}
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
            transition-colors
            group-hover:bg-blue-600
            group-hover:text-white
          "
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
