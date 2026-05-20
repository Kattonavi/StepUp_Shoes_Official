interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}
