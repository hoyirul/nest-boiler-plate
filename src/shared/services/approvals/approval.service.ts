// src/shared/approval/approval.helper.ts

import {
  ApprovalLine,
  ApprovalLog,
  ApprovalState,
} from './approval.types';
import {
  mapLogsByApprovalId,
  findCurrentLine,
} from './approval.utils';

export class ApprovalService {
  static resolve(params: {
    approvalLines: ApprovalLine[];
    approvalLogs: ApprovalLog[];
    currentUserId: string;
  }): ApprovalState {
    const { approvalLines, approvalLogs, currentUserId } = params;

    const logMap = mapLogsByApprovalId(approvalLogs);
    const currentLine = findCurrentLine(approvalLines, logMap);

    return {
      current_step: currentLine?.step ?? null,
      current_approval_id: currentLine?.id ?? null,
      next_status: currentLine?.status ?? null,

      can_approve:
        !!currentLine &&
        currentLine.approver_id === currentUserId,

      lines: approvalLines.map(line => {
        const log = logMap.get(line.id);

        return {
          step: line.step,
          approver_id: line.approver_id,
          approver: line.approver,
          state: log
            ? 'DONE'
            : line.id === currentLine?.id
              ? 'CURRENT'
              : 'WAITING',
          approved_at: log?.created_at ?? null,
          next_status: line.status ?? null,
        };
      }),
    };
  }
}
