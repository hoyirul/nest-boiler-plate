// src/shared/approval/approval.types.ts

export type ApprovalStepState =
  | 'WAITING'
  | 'CURRENT'
  | 'DONE';

export interface ApprovalLine {
  id: number;
  step: number;
  approver_id: string;

  approver?: {
    id: string;
    name: string;
    division?: { id: number; name: string };
    department?: { id: number; name: string };
    position?: { id: number; name: string };
  };

  status_id: number;
  status?: {
    id: number;
    code: string;
    label: string;
  };
}

export interface ApprovalLog {
  approval_id: number;
  status_from: number;
  status_to: number;
  created_at: Date;
}

export interface ApprovalLineState {
  step: number;
  approver_id: string;
  approver?: {
    id: string;
    name: string;
    division?: { id: number; name: string };
    department?: { id: number; name: string };
    position?: { id: number; name: string };
  };
  state: ApprovalStepState;
  approved_at: Date | null;

  next_status: {
    id: number;
    code: string;
    label: string;
  } | null;
}

export interface ApprovalState {
  current_step: number | null;
  can_approve: boolean;
  current_approval_id: number | null;

  next_status: {
    id: number;
    code: string;
    label: string;
  } | null;

  lines: ApprovalLineState[];
}
