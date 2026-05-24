import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { DynamicFormField } from "@/lib/forms/form-field-types";

export async function fetchCheckoutFormFields(slug: string, sectionId: string) {
  const res = await apiClient.get<
    ApiResponse<{ globalFields: DynamicFormField[]; segmentFields: DynamicFormField[] }>
  >(`/events/slug/${slug}/checkout-form`, { params: { sectionId } });
  return res.data.data!;
}
