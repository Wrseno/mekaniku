import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgColor = 'bg-[var(--color-primary-50)]',
  iconColor = 'text-[var(--color-primary)]',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-[var(--radius-mekaniku-lg)] p-6 shadow-[var(--shadow-mekaniku)] hover:shadow-[var(--shadow-mekaniku-lg)] transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-secondary)] font-medium mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-[var(--color-charcoal)] mb-1">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-[var(--color-secondary)]">
                dari kemarin
              </span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'w-14 h-14 rounded-[var(--radius-mekaniku)] flex items-center justify-center',
            iconBgColor
          )}
        >
          <Icon className={clsx('w-7 h-7', iconColor)} />
        </div>
      </div>
    </div>
  );
}
