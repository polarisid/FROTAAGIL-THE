
'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { useEffect } from 'react';

interface SignaturePadProps {
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
  defaultName?: string; // To prefill with operator's name
}

export function SignaturePad({ field, disabled = false, defaultName }: SignaturePadProps) {
  useEffect(() => {
    // Set the signature field to the defaultName only on initial load if it's empty
    if (defaultName && !field.value && !disabled) {
      field.onChange(defaultName);
    }
    // This effect should only run when the defaultName changes, or when the form is reset (field.value becomes undefined)
  }, [defaultName, field.value, field.onChange, disabled]);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Assinatura (Digite seu nome completo)</Label>
      <Textarea
        id={field.name}
        placeholder="Digite seu nome completo como assinatura digital"
        className="min-h-[80px] resize-none rounded-md border bg-background p-3 shadow-sm focus:ring-2 focus:ring-ring font-medium"
        {...field} // Spreads value, onChange, onBlur, name, ref
        disabled={disabled}
        value={field.value ?? ''} // Ensure controlled input by providing empty string if null/undefined
        autoComplete="name"
      />
    </div>
  );
}
