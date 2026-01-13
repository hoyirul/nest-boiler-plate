// src/shared/approval/approval.utils.ts

import { ApprovalLine, ApprovalLog } from './approval.types';

export function mapLogsByApprovalId(
  logs: ApprovalLog[],
): Map<number, ApprovalLog> {
  return new Map(logs.map(l => [l.approval_id, l]));
}

export function findCurrentLine(
  lines: ApprovalLine[],
  logMap: Map<number, ApprovalLog>,
): ApprovalLine | null {
  return lines.find(line => !logMap.has(line.id)) ?? null;
}
