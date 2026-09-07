import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../../services/api-client'
import type { AdminWorkshop, WorkshopFormData } from '../../types/workshop'
import { Button } from '../ui/button'
import { ImageFallback } from '../ui/image-fallback'
import { cn } from '../../lib/utils'

type WorkshopFormPanelProps = {
  workshop?: AdminWorkshop
  onSubmit: (data: WorkshopFormData) => Promise<void>
  onClose: () => void
}

type FormState = Omit<WorkshopFormData, 'materials'> & {
  materials: string
}

const emptyForm: FormState = {
  title: '',
  category: '',
  description: '',
  imageUrl: null,
  materials: '',
}

const categoryPresets = ['Crochê', 'Cerâmica', 'Madeira', 'Têxtil'] as const

const imagePresets = [
  {
    category: 'Crochê',
    label: 'Novelos e agulha de crochê',
    url: 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e',
  },
  {
    category: 'Crochê',
    label: 'Bolsa artesanal de crochê',
    url: 'https://images.unsplash.com/photo-1594638963668-52eb9798e8ca',
  },
  {
    category: 'Crochê',
    label: 'Amigurumi e bichinhos de crochê',
    url: 'https://images.unsplash.com/photo-1766090503766-623b62f0da26',
  },
  {
    category: 'Cerâmica',
    label: 'Mãos moldando argila no torno',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
  },
  {
    category: 'Cerâmica',
    label: 'Pratos e texturas em cerâmica',
    url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
  },
  {
    category: 'Cerâmica',
    label: 'Cerâmica e formas livres',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61',
  },
  {
    category: 'Madeira',
    label: 'Bancada e plaina de marcenaria',
    url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b',
  },
  {
    category: 'Madeira',
    label: 'Madeira maciça e encaixes',
    url: 'https://tse4.mm.bing.net/th/id/OIP.ELp9-JTtTrVIhhKETH6JIAHaJ4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    category: 'Têxtil',
    label: 'Bastidor de bordado manual',
    url: 'https://images.unsplash.com/photo-1610562831268-e04a620e1b0d',
  },
  {
    category: 'Têxtil',
    label: 'Costura e tecidos artesanais',
    url: 'https://drikaartesanato.com/wp-content/uploads/2022/01/necessaire-de-tecido-passo-a-passo-capa.jpg',
  },
]

function getPresetThumbnailUrl(url: string) {
  return url.startsWith('https://images.unsplash.com/')
    ? `${url}?auto=format&fit=crop&w=320&q=75`
    : url
}

export function WorkshopFormPanel({
  workshop,
  onSubmit,
  onClose,
}: WorkshopFormPanelProps) {
  const [form, setForm] = useState<FormState>(() =>
    workshop
      ? {
          title: workshop.title,
          category: workshop.category,
          description: workshop.description,
          imageUrl: workshop.imageUrl,
          materials: workshop.materials.join('\n'),
        }
      : emptyForm,
  )

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])

  /*
   * Impede a página atrás do modal de continuar rolando.
   * Isso deixa o comportamento muito mais natural principalmente no mobile.
   */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function updateField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
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
      })
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível salvar a oficina.',
      )

      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-carbon/60 p-3 backdrop-blur-[2px] sm:p-6 lg:p-10"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      {/* Wrapper permite que a fita fique para fora sem ser cortada */}
      <div className="relative w-full max-w-5xl">
        {/* Fita decorativa */}
        <span
          className="pointer-events-none absolute -top-3 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rotate-1 bg-tape/90 shadow-sm sm:w-28"
          aria-hidden="true"
        />

        <section
          className="relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden border border-carbon bg-light shadow-photo sm:max-h-[calc(100dvh-3rem)] lg:max-h-[min(860px,calc(100dvh-5rem))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workshop-form-title"
        >
          {/* Cabeçalho fixo dentro do modal */}
          <header className="relative z-10 flex shrink-0 items-start justify-between gap-5 border-b border-rule bg-paper px-5 py-4 sm:px-7 sm:py-5">
            <div className="min-w-0">
              <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-ochre uppercase sm:text-xs">
                {workshop ? 'Editar cadastro' : 'Nova experiência'}
              </p>

              <h2
                className="m-0 font-display text-2xl font-bold tracking-tight text-carbon sm:text-3xl"
                id="workshop-form-title"
              >
                {workshop ? 'Editar oficina' : 'Criar oficina'}
              </h2>

              <p className="mt-1 hidden max-w-xl text-sm leading-relaxed text-muted sm:block">
                {workshop
                  ? 'Atualize as informações principais desta experiência.'
                  : 'Comece pela identidade da oficina. Turmas, datas e valores podem ser configurados depois.'}
              </p>
            </div>

            <button
              className="group flex size-10 shrink-0 items-center justify-center rounded-full border border-rule bg-light font-mono text-lg text-carbon transition-all duration-200 hover:rotate-6 hover:border-carbon hover:bg-carbon hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={onClose}
              aria-label="Fechar formulário"
              disabled={isSubmitting}
            >
              ×
            </button>
          </header>

          {/* Apenas esta área rola */}
          <form
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 sm:px-7 sm:pt-7"
            onSubmit={handleSubmit}
          >
            <div className="space-y-7">
              {/* Identidade */}
              <fieldset className="grid gap-5 sm:grid-cols-2">
                <legend className="mb-4 font-display text-lg font-bold text-carbon">
                  Identidade
                </legend>

                <FormField label="Título" id="title" className="sm:col-span-2">
                  <input
                    className={inputStyles}
                    id="title"
                    value={form.title}
                    onChange={(event) =>
                      updateField('title', event.target.value)
                    }
                    minLength={3}
                    maxLength={120}
                    required
                    autoFocus
                  />
                </FormField>

                <FormField
                  label="Categoria"
                  id="category"
                  className="sm:col-span-2"
                >
                  <input
                    className={inputStyles}
                    id="category"
                    value={form.category}
                    onChange={(event) =>
                      updateField('category', event.target.value)
                    }
                    minLength={2}
                    maxLength={80}
                    placeholder="Ex.: Cerâmica"
                    required
                  />

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 font-mono text-[10px] text-muted uppercase">
                      Sugestões:
                    </span>

                    {categoryPresets.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => updateField('category', category)}
                        className={cn(
                          `border border-rule px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase transition hover:border-carbon hover:bg-paper`,
                          form.category.trim().toLowerCase() ===
                            category.toLowerCase()
                            ? 'border-carbon bg-carbon font-bold text-paper'
                            : 'bg-light text-muted',
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </FormField>

                {/* Imagem */}
                <div className="space-y-3 sm:col-span-2">
                  <FormField
                    label="Imagem de capa (URL)"
                    id="imageUrl"
                    hint="Cole uma URL externa ou selecione uma foto real do acervo artesanal abaixo."
                  >
                    <input
                      className={inputStyles}
                      id="imageUrl"
                      type="url"
                      value={form.imageUrl ?? ''}
                      onChange={(event) =>
                        updateField('imageUrl', event.target.value)
                      }
                      placeholder="https://images.unsplash.com/..."
                    />
                  </FormField>

                  {/* Acervo */}
                  <div className="border border-rule bg-paper p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="block font-mono text-[11px] font-bold tracking-wider text-carbon uppercase">
                          Acervo do Ateliê
                        </span>

                        <span className="text-xs text-muted">
                          Escolha uma referência visual com um clique.
                        </span>
                      </div>

                      <span className="border border-rule bg-light px-2 py-1 font-mono text-[9px] tracking-wider text-muted uppercase">
                        {form.imageUrl
                          ? '1 selecionada'
                          : 'Nenhuma selecionada'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                      {imagePresets.map((preset) => {
                        const isSelected = form.imageUrl === preset.url

                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => {
                              updateField('imageUrl', preset.url)

                              if (!form.category) {
                                updateField('category', preset.category)
                              }
                            }}
                            className={cn(
                              `group relative aspect-[4/3] overflow-hidden border border-rule bg-light transition-all duration-200 hover:-translate-y-0.5 hover:border-carbon hover:shadow-craft-sm focus:ring-2 focus:ring-ochre focus:outline-none`,
                              isSelected
                                ? `-translate-y-0.5 border-2 border-carbon shadow-craft-sm ring-2 ring-saffron ring-offset-1`
                                : `opacity-80 hover:opacity-100`,
                            )}
                            title={`${preset.label} (${preset.category})`}
                          >
                            <img
                              src={getPresetThumbnailUrl(preset.url)}
                              alt={preset.label}
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />

                            <span className="absolute inset-x-0 bottom-0 truncate bg-carbon/85 px-1.5 py-1 font-mono text-[9px] tracking-wider text-paper uppercase">
                              {preset.category}
                            </span>

                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-carbon text-xs font-bold text-white shadow">
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Preview + descrição */}
                <div className="grid gap-5 sm:col-span-2 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <p className="mb-1.5 font-mono text-xs tracking-wider text-muted uppercase">
                      Prévia da capa
                    </p>

                    <CoverPreview imageUrl={form.imageUrl} title={form.title} />
                  </div>

                  <FormField label="Descrição" id="description">
                    <textarea
                      className={` ${inputStyles} min-h-40 resize-y py-3 lg:min-h-[190px]`}
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        updateField('description', event.target.value)
                      }
                      minLength={10}
                      maxLength={1000}
                      required
                    />
                  </FormField>
                </div>
              </fieldset>

              {/* Aviso */}
              <div className="relative border border-saffron/50 bg-saffron/10 px-4 py-3 pl-11 text-sm leading-relaxed text-carbon">
                <span
                  className="absolute top-1/2 left-4 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-saffron font-mono text-[10px] font-bold"
                  aria-hidden="true"
                >
                  i
                </span>
                Datas, locais, valores e vagas são configurados nas turmas
                depois que a oficina é criada.
              </div>

              {/* Materiais */}
              <FormField
                label="Materiais necessários"
                id="materials"
                hint="Separe os itens por linha ou vírgula. Máximo de 20."
              >
                <textarea
                  className={` ${inputStyles} min-h-28 resize-y py-3`}
                  id="materials"
                  value={form.materials}
                  onChange={(event) =>
                    updateField('materials', event.target.value)
                  }
                  placeholder={'Agulha de crochê\nLinha de algodão'}
                />
              </FormField>

              {error && (
                <p
                  className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Ações sempre acessíveis */}
            <div className="sticky bottom-0 z-10 -mx-5 mt-7 flex flex-col-reverse gap-3 border-t border-rule bg-light/95 px-5 py-4 shadow-[0_-10px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:-mx-7 sm:flex-row sm:justify-between sm:px-7">
              <span className="hidden self-center font-mono text-[9px] tracking-[0.18em] text-muted uppercase sm:block">
                {workshop
                  ? 'Revise antes de salvar'
                  : 'Sua próxima oficina começa aqui'}
              </span>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Salvando...'
                    : workshop
                      ? 'Salvar alterações'
                      : 'Criar oficina'}
                </Button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

function CoverPreview({
  imageUrl,
  title,
}: {
  imageUrl: string | null
  title: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const normalizedUrl = imageUrl?.trim() || null

  const canShowImage = normalizedUrl && normalizedUrl !== failedUrl

  return (
    <div className="relative aspect-[16/9] overflow-hidden border border-rule bg-deep shadow-craft-sm">
      {canShowImage ? (
        <img
          className="size-full object-cover"
          src={normalizedUrl}
          alt={
            title ? `Prévia da capa de ${title}` : 'Prévia da capa da oficina'
          }
          onError={() => setFailedUrl(normalizedUrl)}
        />
      ) : (
        <ImageFallback />
      )}

      <span className="absolute bottom-3 left-3 bg-carbon/85 px-2 py-1 font-mono text-[10px] tracking-wider text-paper uppercase">
        {normalizedUrl && normalizedUrl === failedUrl
          ? 'Não foi possível carregar a imagem'
          : canShowImage
            ? 'Prévia'
            : 'Sem imagem de capa'}
      </span>
    </div>
  )
}

const inputStyles = `
  min-h-11
  w-full
  rounded-sm
  border
  border-rule
  bg-paper
  px-3
  text-sm
  text-ink
  outline-none
  transition
  placeholder:text-muted/60
  hover:border-muted
  focus:border-carbon
  focus:ring-2
  focus:ring-ochre/20
`

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

      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
      )}
    </div>
  )
}
