"use client";

import { useEffect, useState } from "react";
import { DynamicFormRenderer } from "@/components/forms/dynamic-form-renderer";
import type { DynamicFormField } from "@/lib/forms/form-field-types";
import type { FormValues } from "@/lib/forms/conditional-form";
import { fetchCheckoutFormFields } from "@/services/events/checkout-form.service";
import { useCheckoutStore } from "@/store/checkout.store";

interface CheckoutCustomFormProps {
  onValuesChange: (responses: { fieldKey: string; value: string | string[] | boolean | number }[]) => void;
}

export function CheckoutCustomForm({ onValuesChange }: CheckoutCustomFormProps) {
  const item = useCheckoutStore((s) => s.item);
  const [fields, setFields] = useState<DynamicFormField[]>([]);
  const [values, setValues] = useState<FormValues>({});

  useEffect(() => {
    if (!item?.eventSlug || !item.sectionId) return;
    fetchCheckoutFormFields(item.eventSlug, item.sectionId)
      .then((data) => {
        const merged = [...(data.globalFields ?? []), ...(data.segmentFields ?? [])];
        setFields(merged);
      })
      .catch(() => setFields([]));
  }, [item?.eventSlug, item?.sectionId]);

  useEffect(() => {
    const responses = Object.entries(values).map(([fieldKey, value]) => ({ fieldKey, value }));
    onValuesChange(responses);
  }, [values, onValuesChange]);

  if (!fields.length) return null;

  return (
    <DynamicFormRenderer
      fields={fields}
      values={values}
      onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
    />
  );
}
