import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox', title, description }: EmptyStateProps) {
  return (
    <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <Icon name={icon} size={30} />
      </div>
      <p className="text-gray-900 font-semibold">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
