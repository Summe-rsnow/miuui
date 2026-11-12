import { inject, type ComputedRef, type InjectionKey } from "vue"

export interface MiuFormFieldContext {
  id: ComputedRef<string>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
}

export const MIU_FORM_FIELD_KEY: InjectionKey<MiuFormFieldContext> = Symbol("miu-form-field")

export function useMiuFormField(): MiuFormFieldContext | null {
  return inject(MIU_FORM_FIELD_KEY, null)
}
