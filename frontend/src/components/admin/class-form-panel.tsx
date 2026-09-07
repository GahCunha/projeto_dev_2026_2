import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../../services/api-client'
import type { ClassFormData, WorkshopClass } from '../../types/workshop-class'
import { Button } from '../ui/button'

type ClassFormPanelProps = {
  workshopTitle: string
  workshopClass?: WorkshopClass
  onSubmit: (data: ClassFormData) => Promise<void>
  onClose: () => void
}

type MeetingForm = {
  key: number
  date: string
  startTime: string
  endTime: string
  location: string
}

type FormState = {
  name: string
  capacity: string
  price: string
  meetings: MeetingForm[]
}

function toLocalDateTimeParts(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  const localDateTime = new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16)

  return {
    date: localDateTime.slice(0, 10),
    time: localDateTime.slice(11, 16),
  }
}

function emptyMeeting(key: number): MeetingForm {
  return { key, date: '', startTime: '', endTime: '', location: '' }
}

function combineLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString()
}

export function ClassFormPanel({
  workshopTitle,
  workshopClass,
  onSubmit,
  onClose,
}: ClassFormPanelProps) {
  const [nextMeetingKey, setNextMeetingKey] = useState(
    () => workshopClass?.meetings.length ?? 1,
  )
  const [form, setForm] = useState<FormState>(() =>
    workshopClass
      ? {
          name: workshopClass.name,
          capacity: String(workshopClass.capacity),
          price: String(workshopClass.price),
          meetings: workshopClass.meetings.map((meeting, index) => {
            const start = toLocalDateTimeParts(meeting.startsAt)
            const end = toLocalDateTimeParts(meeting.endsAt)

            return {
              key: index,
              date: start.date,
              startTime: start.time,
              endTime: end.time,
              location: meeting.location,
            }
          }),
        }
      : {
          name: '',
          capacity: '12',
          price: '0',
          meetings: [emptyMeeting(0)],
        },
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  function updateMeeting(
    key: number,
    field: keyof Omit<MeetingForm, 'key'>,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      meetings: current.meetings.map((meeting) =>
        meeting.key === key ? { ...meeting, [field]: value } : meeting,
      ),
    }))
  }

  function addMeeting() {
    setForm((current) => ({
      ...current,
      meetings: [...current.meetings, emptyMeeting(nextMeetingKey)],
    }))
    setNextMeetingKey((current) => current + 1)
  }

  function removeMeeting(key: number) {
    setForm((current) => ({
      ...current,
      meetings: current.meetings.filter((meeting) => meeting.key !== key),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: form.name.trim(),
        capacity: Number(form.capacity),
        price: Number(form.price.replace(',', '.')),
        meetings: form.meetings.map(
          ({ date, startTime, endTime, location }) => ({
            startsAt: combineLocalDateTime(date, startTime),
            endsAt: combineLocalDateTime(date, endTime),
            location: location.trim(),
          }),
        ),
      })
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível salvar a turma.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-carbon/55"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="h-full w-full max-w-3xl overflow-y-auto border-l border-rule bg-light shadow-photo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-form-title"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rule bg-paper px-5 py-5 sm:px-7">
          <div>
            <p className="mb-1 font-mono text-xs tracking-wider text-ochre uppercase">
              {workshopTitle}
            </p>
            <h2
              className="font-display text-2xl font-bold text-carbon"
              id="class-form-title"
            >
              {workshopClass ? 'Editar turma' : 'Criar turma'}
            </h2>
          </div>
          <button
            className="min-h-10 border border-rule bg-deep px-3 font-mono text-xs font-bold tracking-wider text-carbon uppercase transition hover:border-carbon hover:bg-paper"
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            Fechar ×
          </button>
        </header>

        <form className="space-y-8 px-5 py-6 sm:px-7" onSubmit={handleSubmit}>
          <fieldset className="grid gap-5 sm:grid-cols-3">
            <legend className="mb-4 font-display text-lg font-bold text-carbon">
              Dados da turma
            </legend>
            <FormField
              className="sm:col-span-3"
              label="Nome da turma"
              id="class-name"
            >
              <input
                className={inputStyles}
                id="class-name"
                minLength={3}
                maxLength={100}
                required
                autoFocus
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex.: Turma noturna de setembro"
              />
            </FormField>
            <FormField label="Vagas" id="class-capacity">
              <input
                className={inputStyles}
                id="class-capacity"
                type="number"
                min={1}
                max={500}
                required
                value={form.capacity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacity: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              className="sm:col-span-2"
              label="Preço em reais"
              id="class-price"
              hint="Use 0 para uma turma gratuita."
            >
              <input
                className={inputStyles}
                id="class-price"
                type="number"
                min={0}
                max={100000}
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
              />
            </FormField>
          </fieldset>

          <section aria-labelledby="class-meetings-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3
                  className="font-display text-lg font-bold text-carbon"
                  id="class-meetings-title"
                >
                  Aulas da turma
                </h3>
                <p className="mt-1 text-sm text-muted">
                  A inscrição inclui todas as datas cadastradas.
                </p>
              </div>
              <Button variant="outline" onClick={addMeeting}>
                Adicionar aula
              </Button>
            </div>

            <div className="grid gap-5">
              {form.meetings.map((meeting, index) => (
                <section
                  className="border border-rule bg-paper p-4 sm:p-5"
                  key={meeting.key}
                  aria-labelledby={`meeting-${meeting.key}-title`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-rule/70 pb-3">
                    <h3
                      className="font-display text-lg font-bold text-carbon"
                      id={`meeting-${meeting.key}-title`}
                    >
                      Aula {index + 1}
                    </h3>
                    <button
                      className="min-h-10 font-mono text-xs tracking-wider text-danger uppercase underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      disabled={form.meetings.length === 1}
                      onClick={() => removeMeeting(meeting.key)}
                    >
                      Remover
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField label="Data" id={`meeting-${meeting.key}-date`}>
                      <input
                        className={inputStyles}
                        id={`meeting-${meeting.key}-date`}
                        type="date"
                        required
                        value={meeting.date}
                        onChange={(event) =>
                          updateMeeting(meeting.key, 'date', event.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label="Hora de início"
                      id={`meeting-${meeting.key}-start-time`}
                    >
                      <input
                        className={inputStyles}
                        id={`meeting-${meeting.key}-start-time`}
                        type="time"
                        required
                        value={meeting.startTime}
                        onChange={(event) =>
                          updateMeeting(
                            meeting.key,
                            'startTime',
                            event.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      label="Hora de término"
                      id={`meeting-${meeting.key}-end-time`}
                    >
                      <input
                        className={inputStyles}
                        id={`meeting-${meeting.key}-end-time`}
                        type="time"
                        required
                        min={meeting.startTime || undefined}
                        value={meeting.endTime}
                        onChange={(event) =>
                          updateMeeting(
                            meeting.key,
                            'endTime',
                            event.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      className="sm:col-span-3"
                      label="Local"
                      id={`meeting-${meeting.key}-location`}
                    >
                      <input
                        className={inputStyles}
                        id={`meeting-${meeting.key}-location`}
                        minLength={3}
                        maxLength={160}
                        required
                        value={meeting.location}
                        onChange={(event) =>
                          updateMeeting(
                            meeting.key,
                            'location',
                            event.target.value,
                          )
                        }
                      />
                    </FormField>
                  </div>
                </section>
              ))}
            </div>
          </section>

          {error && (
            <p
              className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-rule pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : workshopClass
                  ? 'Salvar alterações'
                  : 'Criar turma'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

const inputStyles =
  'min-h-11 w-full rounded-sm border border-rule bg-light px-3 text-sm text-ink placeholder:text-muted/60 hover:border-muted'

function FormField({
  label,
  id,
  hint,
  className,
  children,
}: {
  label: string
  id: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label
        className="mb-1.5 block font-mono text-xs tracking-wider text-muted uppercase"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
