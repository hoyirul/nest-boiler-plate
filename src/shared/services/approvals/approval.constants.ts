// src/shared/approval/approval.constants.ts

import { Action, Transition } from "./approval.types";

/**
 * Global action rules that define what actions
 * are allowed after a specific action is performed.
 * 
 * These rules are reusable across all modules.
 */
export const ACTION_RULES: Record<string, Action[]> = {
  submit: [
    { code: "cancel", label: "Cancel" },
  ],
  approve: [
    { code: "reject", label: "Reject" },
    { code: "revise", label: "Revise" },
  ],
};

/**
 * Workflow transition configuration per module.
 * 
 * Each module can define its own approval flow:
 * - fromStatus: current status
 * - action: action taken
 * - toStatus: result status
 * 
 * This allows different modules to have different workflows.
 */
export const WORKFLOW_TRANSITIONS: Record<string, Transition[]> = {
  examples: [
    { fromStatus: "draft", action: "submit", toStatus: "submitted" },
    { fromStatus: "draft", action: "cancel", toStatus: "canceled" },

    { fromStatus: "submitted", action: "approve", toStatus: "approved" },
    { fromStatus: "submitted", action: "reject", toStatus: "rejected" },
    { fromStatus: "submitted", action: "revise", toStatus: "draft" },
  ],

  /**
   * Example for future module (just reference)
   */
  // leave: [
  //   { fromStatus: "draft", action: "submit", toStatus: "in-review" },
  //   { fromStatus: "in-review", action: "approve", toStatus: "approved" },
  //   { fromStatus: "in-review", action: "reject", toStatus: "rejected" },
  // ],
};

/**
 * Final statuses per module.
 * 
 * When a document reaches one of these statuses,
 * it is considered completed and no further action is allowed.
 */
export const MODULE_FINAL_STATUSES: Record<string, string[]> = {
  example: ["canceled", "rejected", "revised", "approved"],

  // leave: ["approved", "rejected"],
};

/**
 * Default workflow fallback.
 * 
 * Used if a module is not explicitly configured.
 */
export const DEFAULT_TRANSITIONS: Transition[] = [
  { fromStatus: "draft", action: "submit", toStatus: "submitted" },
];

/**
 * Default final statuses fallback.
 */
export const DEFAULT_FINAL_STATUSES = ["approved", "rejected", "canceled"];

/**
 * Helper to get workflow transitions by module.
 * Falls back to default if module is not registered.
 */
export function getTransitions(module: string): Transition[] {
  return WORKFLOW_TRANSITIONS[module] ?? DEFAULT_TRANSITIONS;
}

/**
 * Helper to get final statuses by module.
 * Falls back to default if module is not registered.
 */
export function getFinalStatuses(module: string): string[] {
  return MODULE_FINAL_STATUSES[module] ?? DEFAULT_FINAL_STATUSES;
}
