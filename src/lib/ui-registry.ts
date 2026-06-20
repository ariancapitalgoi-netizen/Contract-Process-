
/**
 * UI Override Registry
 * 
 * This file serves as the "root source of truth" for UI customizations.
 * When a user edits text or hides elements via the "Edit Form" UI, 
 * the changes should be migrated here by the AI Agent to solve persistence issues 
 * fundamentally.
 */

export type UIOverride = {
  text?: string;
  hidden?: boolean;
  styles?: any;
};

export const UI_OVERRIDES: Record<string, UIOverride> = {
  // Example: 'Original Text': { text: 'New Text', hidden: false }
  
  // Based on user's recent "Edit Form" actions:
  'نوع تهاتر': { hidden: true },
  'تا تاریخ': { hidden: true },
  'مبلغ (ریال)': { hidden: true },
  'شماره قرارداد مرتبط': { hidden: true },
};

/**
 * Helper to get an override for a given default text
 */
export function getUIOverride(defaultText: string): UIOverride | undefined {
  return UI_OVERRIDES[defaultText];
}
