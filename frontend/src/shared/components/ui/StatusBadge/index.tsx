import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  labelMap: Record<string, string>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'dot';
}

export function StatusBadge({
  status,
  colorMap,
  labelMap,
  size = 'sm',
  variant = 'light',
}: StatusBadgeProps) {
  return (
    <Badge color={colorMap[status] ?? 'gray'} size={size} variant={variant}>
      {labelMap[status] ?? status}
    </Badge>
  );
}

export {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  DISPATCH_STATUS_COLORS,
  DISPATCH_STATUS_LABELS,
  PROMOTION_STATUS_COLORS,
  PROMOTION_STATUS_LABELS,
  PROMOTION_TYPE_COLORS,
  PROMOTION_TYPE_LABELS,
} from './constants';
