import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  index?: number;
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-teal-600',
  iconBgColor = 'bg-teal-50 dark:bg-teal-950',
  prefix = '',
  suffix = '',
  decimals = 0,
  index = 0,
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  const TrendIcon = isPositive
    ? TrendingUp
    : isNegative
      ? TrendingDown
      : Minus;

  const trendColor = isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : isNegative
      ? 'text-red-500 dark:text-red-400'
      : 'text-zinc-400 dark:text-zinc-500';

  const trendBg = isPositive
    ? 'bg-emerald-50 dark:bg-emerald-950/40'
    : isNegative
      ? 'bg-red-50 dark:bg-red-950/40'
      : 'bg-zinc-100 dark:bg-zinc-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-glow group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-xl shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-2 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]"
              delay={index * 0.1}
            />
          </div>

          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trendColor} ${trendBg}`}
            >
              <TrendIcon className="w-3.5 h-3.5" />
              <span>
                {isPositive ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              <span className="opacity-60 font-normal mr-1">من الأسبوع الماضي</span>
            </motion.div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} transition-colors duration-300`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
      </div>

      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
