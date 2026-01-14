// src/shared/approval/approval.service.ts
import { formatDate } from "@/shared/utils/parse";

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
import {
  ACTION_RULES,
  getFinalStatuses
} from './approval.constants';
export class ApprovalService {
  static resolve(params: {
    module: string;
    approvalLines: ApprovalLine[];
    approvalLogs: ApprovalLog[];
    currentStatus?: string;
    currentUserId: string;
  }): ApprovalState {
    const { module, approvalLines, approvalLogs, currentStatus, currentUserId } = params;

    const logMap = mapLogsByApprovalId(approvalLogs);
    const currentLine = findCurrentLine(approvalLines, logMap);
    
    // Get final status based on module
    const FINAL_STATUSES = getFinalStatuses(module);

    /**
     * If document already in FINAL STATUS
     * - No more actions
     * - All steps considered stopped / completed visually
     */
    if (FINAL_STATUSES.includes((currentStatus ?? "").toLowerCase())) {
      const upperStatus = (currentStatus ?? "").toUpperCase();

      return {
        current_step: currentLine?.step ?? null,
        current_approval_id: currentLine?.id ?? null,
        next_action: null,
        can_approve: false,

        lines: approvalLines.map(line => {
          const log = logMap.get(line.id);

          let state: ApprovalStepState;

          switch (upperStatus) {
            case "CANCELED":
              state = "CANCELED";
              break;
            case "REJECTED":
              state = "REJECTED";
              break;
            case "REVISED":
              state = "REVISED";
              break;
            default:
              state = "DONE";
          }

          return {
            step: line.step,
            approver_id: line.approver_id,
            approver: line.approver,
            state,
            status_from: log?.status_from,
            status_to: log?.status_to,
            actioned_at: log ? formatDate(log.created_at, "datetime") : null,
            next_action: line.action ?? null,
            allowed_actions: [],
          };
        }),
      };
    }

    /**
     * Normal running approval flow
     */
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

        const state: ApprovalStepState =
          log
            ? "DONE"
            : isCurrent
            ? "CURRENT"
            : "WAITING";

        const baseCode = (line.action?.code ?? "").toLowerCase();

        const allowed_actions =
          isCurrent && baseCode
            ? ACTION_RULES[baseCode] ?? []
            : [];

        return {
          step: line.step,
          approver_id: line.approver_id,
          approver: line.approver,
          state,
          status_from: log?.status_from,
          status_to: log?.status_to,
          actioned_at: log ? formatDate(log.created_at, "datetime") : null,
          next_action: line.action ?? null,
          allowed_actions,
        };
      }),
    };
  }
}
