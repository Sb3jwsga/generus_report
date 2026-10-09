import { Icon } from './Icon';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ badge, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
            <Icon name="badge" size={14} />
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
