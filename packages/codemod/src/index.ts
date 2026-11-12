export interface CodemodChange {
  rule: string
  from: string
  to: string
}

export interface CodemodResult {
  code: string
  changed: boolean
  changes: CodemodChange[]
}

const FORM_ROW_TAG_RE = /<((?:Miu)?FormRow|form-row|miu-form-row)\b([^>]*?)(\/?)>/g
const DENSE_ATTR_RE = /(?:^|\s)(:dense="true"|:dense='true'|dense(?:="true"|='true')?)(?=\s|$)/
const DENSITY_ATTR_RE = /(?:^|\s):?density\s*=/

/**
 * Migrates deprecated `<FormRow dense>` / `<MiuFormRow :dense="true">` usages
 * to `density="compact"`, preserving all sibling props and skipping elements
 * that already specify `density`.
 */
export function migrateFormRowDense(source: string): CodemodResult {
  const changes: CodemodChange[] = []
  const code = source.replace(
    FORM_ROW_TAG_RE,
    (full, tag: string, attrs: string, selfClose: string) => {
      const denseMatch = DENSE_ATTR_RE.exec(attrs)
      if (!denseMatch) return full

      const hasDensity = DENSITY_ATTR_RE.test(attrs)
      const updatedAttrs = hasDensity
        ? attrs.replace(DENSE_ATTR_RE, "")
        : attrs.replace(DENSE_ATTR_RE, ' density="compact"')

      const cleanedAttrs = updatedAttrs.replace(/\s{2,}/g, " ")
      const next = `<${tag}${cleanedAttrs}${selfClose}>`
      changes.push({
        rule: "form-row-dense-to-density",
        from: denseMatch[1] ?? "dense",
        to: hasDensity ? "(removed redundant dense)" : 'density="compact"',
      })
      return next
    },
  )

  return {
    code,
    changed: changes.length > 0,
    changes,
  }
}

export function transformSource(source: string): CodemodResult {
  return migrateFormRowDense(source)
}
