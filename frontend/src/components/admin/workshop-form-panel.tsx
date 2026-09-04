import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../../services/api-client'
import type { AdminWorkshop, WorkshopFormData } from '../../types/workshop'
import { Button } from '../ui/button'
import { ImageFallback } from '../ui/image-fallback'

type WorkshopFormPanelProps = {
  workshop?: AdminWorkshop
  onSubmit: (data: WorkshopFormData) => Promise<void>
  onClose: () => void
}

type FormState = Omit<WorkshopFormData, 'startsAt' | 'materials' | 'durationMin' | 'capacity'> & {
  startsAt: string
  materials: string
  durationMin: string
  capacity: string
}

const emptyForm: FormState = {
  title: '',
  category: '',
  description: '',
  imageUrl: null,
  materials: '',
  startsAt: '',
  durationMin: '120',
  capacity: '12',
  location: '',
}

function toLocalDateTime(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function WorkshopFormPanel({ workshop, onSubmit, onClose }: WorkshopFormPanelProps) {
  const [form, setForm] = useState<FormState>(() => workshop ? {
    title: workshop.title,
    category: workshop.category,
    description: workshop.description,
    imageUrl: workshop.imageUrl,
    materials: workshop.materials.join('\n'),
    startsAt: toLocalDateTime(workshop.startsAt),
    durationMin: String(workshop.durationMin),
    capacity: String(workshop.capacity),
    location: workshop.location,
  } : emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [minimumDate] = useState(() => toLocalDateTime(new Date(Date.now() + 60_000).toISOString()))

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const materials = form.materials
      .split(/\n|,/)
      .map((material) => material.trim())
      .filter(Boolean)

    try {
      await onSubmit({
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl?.trim() || null,
        materials,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMin: Number(form.durationMin),
        capacity: Number(form.capacity),
        location: form.location.trim(),
      })
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível salvar a oficina.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-carbon/55" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="h-full w-full max-w-2xl overflow-y-auto border-l border-rule bg-light shadow-photo" role="dialog" aria-modal="true" aria-labelledby="workshop-form-title">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rule bg-paper px-5 py-5 sm:px-7">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-ochre">{workshop ? 'Editar cadastro' : 'Nova experiência'}</p>
            <h2 className="font-display text-2xl font-bold text-carbon" id="workshop-form-title">{workshop ? 'Editar oficina' : 'Criar oficina'}</h2>
          </div>
          <button className="min-h-10 px-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-carbon" type="button" onClick={onClose} aria-label="Fechar formulário">Fechar ×</button>
        </header>

        <form className="space-y-7 px-5 py-6 sm:px-7" onSubmit={handleSubmit}>
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-lg font-bold text-carbon">Identidade</legend>
            <FormField label="Título" id="title" className="sm:col-span-2">
              <input className={inputStyles} id="title" value={form.title} onChange={(event) => updateField('title', event.target.value)} minLength={3} maxLength={120} required autoFocus />
            </FormField>
            <FormField label="Categoria" id="category">
              <input className={inputStyles} id="category" value={form.category} onChange={(event) => updateField('category', event.target.value)} minLength={2} maxLength={80} placeholder="Ex.: Cerâmica" required />
            </FormField>
            <FormField label="Imagem de capa (URL)" id="imageUrl">
              <input className={inputStyles} id="imageUrl" type="url" value={form.imageUrl ?? ''} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="https://..." />
            </FormField>
            <div className="sm:col-span-2">
              <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-muted">Prévia da capa</p>
              <CoverPreview imageUrl={form.imageUrl} title={form.title} />
            </div>
            <FormField label="Descrição" id="description" className="sm:col-span-2">
              <textarea className={`${inputStyles} min-h-28 resize-y py-3`} id="description" value={form.description} onChange={(event) => updateField('description', event.target.value)} minLength={10} maxLength={1000} required />
            </FormField>
          </fieldset>

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-lg font-bold text-carbon">Agenda e vagas</legend>
            <FormField label="Data e horário" id="startsAt">
              <input className={inputStyles} id="startsAt" type="datetime-local" min={minimumDate} value={form.startsAt} onChange={(event) => updateField('startsAt', event.target.value)} required />
            </FormField>
            <FormField label="Local" id="location">
              <input className={inputStyles} id="location" value={form.location} onChange={(event) => updateField('location', event.target.value)} minLength={3} maxLength={160} required />
            </FormField>
            <FormField label="Duração (minutos)" id="durationMin">
              <input className={inputStyles} id="durationMin" type="number" min={30} max={1440} step={15} value={form.durationMin} onChange={(event) => updateField('durationMin', event.target.value)} required />
            </FormField>
            <FormField label="Quantidade de vagas" id="capacity">
              <input className={inputStyles} id="capacity" type="number" min={1} max={500} value={form.capacity} onChange={(event) => updateField('capacity', event.target.value)} required />
            </FormField>
          </fieldset>

          <FormField label="Materiais necessários" id="materials" hint="Separe os itens por linha ou vírgula. Máximo de 20.">
            <textarea className={`${inputStyles} min-h-24 resize-y py-3`} id="materials" value={form.materials} onChange={(event) => updateField('materials', event.target.value)} placeholder={'Agulha de crochê\nLinha de algodão'} />
          </FormField>

          {error && <p className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-rule pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : workshop ? 'Salvar alterações' : 'Criar oficina'}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CoverPreview({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const normalizedUrl = imageUrl?.trim() || null
  const canShowImage = normalizedUrl && normalizedUrl !== failedUrl

  return (
    <div className="relative aspect-[16/7] overflow-hidden border border-rule bg-deep shadow-craft-sm">
      {canShowImage
        ? <img className="size-full object-cover" src={normalizedUrl} alt={title ? `Prévia da capa de ${title}` : 'Prévia da capa da oficina'} onError={() => setFailedUrl(normalizedUrl)} />
        : <ImageFallback />}
      <span className="absolute bottom-3 left-3 bg-carbon/80 px-2 py-1 font-mono text-xs uppercase tracking-wider text-paper">
        {normalizedUrl && normalizedUrl === failedUrl ? 'Não foi possível carregar a imagem' : canShowImage ? 'Prévia' : 'Sem imagem de capa'}
      </span>
    </div>
  )
}

const inputStyles = 'min-h-11 w-full rounded-sm border border-rule bg-paper px-3 text-sm text-ink placeholder:text-muted/60 hover:border-muted'

function FormField({ label, id, hint, className, children }: { label: string; id: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted" htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
