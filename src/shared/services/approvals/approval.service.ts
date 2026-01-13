// src/shared/approval/approval.service.ts

import {
  ApprovalLine,
  ApprovalLog,
  ApprovalState,
} from './approval.types';
import {
  mapLogsByApprovalId,
  findCurrentLine,
} from './approval.utils';
import { ApprovalStepState } from './approval.types';
import { ACTION_RULES } from './approval.constants';
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
      next_action: currentLine?.action ?? null,

      can_approve:
        !!currentLine &&
        currentLine.approver_id === currentUserId,

      lines: approvalLines.map(line => {
        const log = logMap.get(line.id);
        const isCurrent = line.id === currentLine?.id;
        const state: ApprovalStepState = log ? 'DONE' : isCurrent ? 'CURRENT' : 'WAITING';

        // allowed actions berdasarkan next_action.code
        const allowed_actions = isCurrent && line.action
          ? ACTION_RULES[line.action.code.toLowerCase()] ?? []
          : [];

        return {
          step: line.step,
          approver_id: line.approver_id,
          approver: line.approver,
          state,
          approved_at: log?.created_at ?? null,
          next_action: line.action ?? null,
          allowed_actions: allowed_actions,
        };
      }),
    };
  }
}
