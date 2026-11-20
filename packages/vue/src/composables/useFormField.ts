import { computed, inject, useId, type ComputedRef, type InjectionKey } from "vue"

export interface MiuFormFieldContext {
  id: ComputedRef<string>
  labelId?: ComputedRef<string | undefined>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
}

export const MIU_FORM_FIELD_KEY: InjectionKey<MiuFormFieldContext> = Symbol("miu-form-field")

export function useMiuFormField(): MiuFormFieldContext | null {
  return inject(MIU_FORM_FIELD_KEY, null)
}

export interface UseFormFieldBindingOptions {
  id?: () => string | undefined
  disabled?: () => boolean | undefined
  readonly?: () => boolean | undefined
  invalid?: () => boolean | undefined
}

export function useFormFieldBinding(options: UseFormFieldBindingOptions = {}): MiuFormFieldContext {
  const autoId = useId()
  const formField = useMiuFormField()
  return {
    id: computed(() => options.id?.() ?? formField?.id.value ?? autoId),
    labelId: computed(() => formField?.labelId?.value),
    describedBy: computed(() => formField?.describedBy.value),
    invalid: computed(() => options.invalid?.() || formField?.invalid.value || false),
    required: computed(() => formField?.required.value || false),
    disabled: computed(() => options.disabled?.() || formField?.disabled.value || false),
    readonly: computed(() => options.readonly?.() || formField?.readonly.value || false),
  }
}
