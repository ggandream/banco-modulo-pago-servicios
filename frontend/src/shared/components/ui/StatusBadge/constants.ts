export const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  confirmed: 'blue',
  picking: 'orange',
  scanned: 'cyan',
  invoiced: 'indigo',
  dispatched: 'teal',
  delivered: 'green',
  cancelled: 'red',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmado',
  picking: 'En Picking',
  scanned: 'Escaneado',
  invoiced: 'Facturado',
  dispatched: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const QUOTATION_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  sent: 'blue',
  approved: 'green',
  converted: 'indigo',
  expired: 'orange',
  rejected: 'red',
};

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  converted: 'Convertida',
  expired: 'Vencida',
  rejected: 'Rechazada',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: 'orange',
  paid: 'green',
  cancelled: 'red',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  cancelled: 'Anulada',
};

export const DISPATCH_STATUS_COLORS: Record<string, string> = {
  pending: 'gray',
  assigned: 'blue',
  in_transit: 'orange',
  delivered: 'green',
  partial: 'yellow',
  returned: 'red',
};

export const DISPATCH_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  in_transit: 'En Tránsito',
  delivered: 'Entregado',
  partial: 'Parcial',
  returned: 'Devuelto',
};

export const PROMOTION_STATUS_COLORS: Record<string, string> = {
  active: 'green',
  inactive: 'gray',
  scheduled: 'blue',
  expired: 'orange',
};

export const PROMOTION_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  scheduled: 'Programada',
  expired: 'Expirada',
};

export const PROMOTION_TYPE_COLORS: Record<string, string> = {
  percentage: 'violet',
  fixed: 'cyan',
  bonus: 'teal',
  nxm: 'indigo',
};

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  percentage: 'Desc. %',
  fixed: 'Desc. Fijo',
  bonus: 'Bonificación',
  nxm: 'N x M',
};
