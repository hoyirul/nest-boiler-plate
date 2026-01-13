// src/shared/approval/approval.types.ts

export type ApprovalStepState = 'WAITING' | 'CURRENT' | 'DONE';

export interface Action {
  code: string;
  label: string;
}

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
  action_id: number; // template action
  action?: Action;

  // Allowed actions diambil dari master / transition table
  allowed_actions?: Action[];
}

export interface ApprovalLog {
  approval_id: number;
  status_from: number;
  action_id: number;
  status_to: number;
  changed_by: string;
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
  allowed_actions: Action[]; // bisa approve/reject
  next_action: { code: string; label: string } | null;
}

export interface ApprovalState {
  current_step: number | null;
  current_approval_id: number | null;
  can_approve: boolean;
  next_action: { code: string; label: string } | null;
  lines: ApprovalLineState[];
}

export interface Transition {
  fromStatus: string;  // code status 'draft', 'submitted'
  action: string;      // code action 'submit', 'approve'
  toStatus: string;    // code status 'submitted', 'approved'
}

