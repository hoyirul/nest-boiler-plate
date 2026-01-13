// src/shared/approval/approval.constants.ts

import { Action, Transition } from "./approval.types";

export const ACTION_RULES: Record<string, Action[]> = {
  submit: [
    { code: 'cancel', label: 'Cancel' },
  ],
  approve: [
    { code: 'reject', label: 'Reject' },
    { code: 'revise', label: 'Revise' },
  ],
};

// Master transition table
export const TRANSITIONS: Transition[] = [
  { fromStatus: 'draft', action: 'submit', toStatus: 'submitted' },
  { fromStatus: 'draft', action: 'cancel', toStatus: 'cancelled' },
  { fromStatus: 'submitted', action: 'approve', toStatus: 'approved' },
  { fromStatus: 'submitted', action: 'reject', toStatus: 'rejected' },
  { fromStatus: 'submitted', action: 'revise', toStatus: 'draft' },
  // add more transitions as needed
];
