'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useUpdateNotesMutation } from '@/hooks/admin/useMessageMutations'

interface Props {
  messageId: string
  currentNotes: string | null
}

export default function MessageNotesForm({ messageId, currentNotes }: Props) {
  const [notes, setNotes] = useState(currentNotes ?? '')
  const mutation = useUpdateNotesMutation()

  function handleSave() {
    mutation.mutate({ id: messageId, payload: { internalNotes: notes || null } })
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Notas internas
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Agrega notas internas sobre este mensaje..."
        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
      <button
        onClick={handleSave}
        disabled={mutation.isPending}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-60"
      >
        <Save className="w-3.5 h-3.5" />
        {mutation.isPending ? 'Guardando...' : 'Guardar notas'}
      </button>
    </div>
  )
}
