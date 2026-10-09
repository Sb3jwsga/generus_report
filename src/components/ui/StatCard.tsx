import { Icon } from './Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({ label, value, sub, icon, iconBg = 'bg-primary-container/10', iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center justify-between">
      <div>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size={24} />
      </div>
    </div>
  );
}
