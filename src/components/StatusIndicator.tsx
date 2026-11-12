import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export type AnyStatus =
  | 'Paid'
  | 'Present'
  | 'Enrolled'
  | 'Pending'
  | 'Leave'
  | 'Unpaid'
  | 'Absent'
  | 'At-Risk';

interface StatusIndicatorProps {
  status: AnyStatus;
}

const STATUS_STYLE: Record<
  AnyStatus,
  {
    bg: string;
    text: string;
    Icon: typeof CheckCircle2;
  }
> = {
  Paid: {
    bg: 'bg-[#10b981]/12',
    text: 'text-[#047857]',
    Icon: CheckCircle2,
  },
  Present: {
    bg: 'bg-[#10b981]/12',
    text: 'text-[#047857]',
    Icon: CheckCircle2,
  },
  Enrolled: {
    bg: 'bg-[#0ea5e9]/12',
    text: 'text-[#0369a1]',
    Icon: ShieldCheck,
  },
  Pending: {
    bg: 'bg-[#f59e0b]/14',
    text: 'text-[#b45309]',
    Icon: Clock,
  },
  Leave: {
    bg: 'bg-[#f59e0b]/14',
    text: 'text-[#b45309]',
    Icon: Clock,
  },
  Unpaid: {
    bg: 'bg-[#f43f5e]/12',
    text: 'text-[#be123c]',
    Icon: AlertCircle,
  },
  Absent: {
    bg: 'bg-[#f43f5e]/12',
    text: 'text-[#be123c]',
    Icon: AlertCircle,
  },
  'At-Risk': {
    bg: 'bg-[#f43f5e]/12',
    text: 'text-[#be123c]',
    Icon: AlertCircle,
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const { bg, text, Icon } = STATUS_STYLE[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 ${bg} ${text}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
