export type Visibility = 'workspace-edit' | 'private'

/**
 * Two-mode visibility selector used by the access modal. The underlying
 * office row only stores `is_private`, so the UI keeps the model honest:
 * either the workspace can edit, or access is restricted to named people.
 */
export function VisibilityRadio({
  value,
  onChange,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
}) {
  const opts: { v: Visibility; label: string; hint: string }[] = [
    {
      v: 'workspace-edit',
      label: 'Workspace can edit',
      hint: 'Everyone on the O&O workspace can open and edit this office.',
    },
    {
      v: 'private',
      label: 'Restricted access',
      hint: 'Only named people you grant below can open this office.',
    },
  ]
  return (
    <div className="space-y-1.5 text-sm">
      {opts.map((o) => (
        <label key={o.v} className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value={o.v}
            checked={value === o.v}
            onChange={() => onChange(o.v)}
            className="mt-0.5"
          />
          <div>
            <div className="font-medium">{o.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{o.hint}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
