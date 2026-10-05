"use server";

import { updateLeadStatusAction } from "@/app/actions/leads";

/**
 * Plain form-action wrapper for the lead-status select, which submits on
 * change and therefore has no place to surface action state.
 */
export async function updateStatusFormAction(formData: FormData) {
  await updateLeadStatusAction(null, formData);
}