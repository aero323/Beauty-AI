import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { statusLabel, statusToneClass } from '../../lib/approvalEngine';
import type { ApprovalRequest } from '../../lib/approvalTypes';

export function ApprovalStatusBadge({ request, className }: { request: ApprovalRequest; className?: string }) {
  return (
    <Badge variant="outline" className={cn('py-0 text-[10px] font-bold', statusToneClass(request), className)}>
      {statusLabel(request)}
    </Badge>
  );
}
