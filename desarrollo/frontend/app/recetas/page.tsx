'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Upload,
  Plus,
  X,
  Trash2,
  FileText,
  Utensils,
  Clock,
  Users,
  ExternalLink,
} from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type Recipe } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { savePdf, getPdf, deletePdf } from '@/lib/recipes-db'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Snack', 'Bebida', 'Otro']
const MAX_MB = 25

export default function RecetasPage() {
  const hydrated = useHydrated()
  const recipes = useThemis((s) => s.recipes)
  const addRecipe = useThemis((s) => s.addRecipe)
  const removeRecipe = useThemis((s) => s.removeRecipe)

  const fileRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState('Todas')
  const [viewing, setViewing] = useState<Recipe | null>(null)
  const [uploading, setUploading] = useState(false)

  // Formulario manual
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Almuerzo')
  const [time, setTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(recipes.map((r) => r.category).filter(Boolean)))],
    [recipes],
  )
  const visible = filter === 'Todas' ? recipes : recipes.filter((r) => r.category === filter)

  const onUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') continue
        if (file.size > MAX_MB * 1024 * 1024) {
          alert(`"${file.name}" supera ${MAX_MB} MB y no se puede guardar localmente.`)
          continue
        }
        const id = addRecipe({
          kind: 'pdf',
          title: file.name.replace(/\.pdf$/i, ''),
          category: 'Otro',
          ingredients: '',
          steps: '',
          time: '',
          servings: '',
          fileName: file.name,
        })
        await savePdf(id, file)
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submitManual = () => {
    if (!title.trim()) return
    addRecipe({
      kind: 'manual',
      title: title.trim(),
      category,
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      time: time.trim(),
      servings: servings.trim(),
      fileName: '',
    })
    setTitle('')
    setTime('')
    setServings('')
    setIngredients('')
    setSteps('')
    setOpen(false)
  }

  const onRemove = (r: Recipe) => {
    if (!confirm(`¿Eliminar "${r.title}"?`)) return
    if (r.kind === 'pdf') deletePdf(r.id).catch(() => {})
    removeRecipe(r.id)
    if (viewing?.id === r.id) setViewing(null)
  }

  return (
    <div>
      <GreetingHeader
        eyebrow="Recetas"
        title="Tu recetario"
        subtitle="Tus recetas favoritas, siempre a mano."
        gradient="from-coral via-sun to-rose"
      />

      {/* Acciones */}
      <section className="px-6 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Subiendo…' : 'Subir PDF'}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
          >
            {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? 'Cerrar' : 'Añadir receta'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => onUpload(e.target.files)}
        />

        {open && (
          <div className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la receta"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Tiempo"
                className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              />
              <input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="Porc."
                className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              />
            </div>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Ingredientes (uno por línea)"
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="Preparación (un paso por línea)"
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <button
              onClick={submitManual}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Guardar receta
            </button>
          </div>
        )}
      </section>

      {/* Filtros */}
      {hydrated && categories.length > 1 && (
        <section className="px-6 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  filter === c ? 'border-coral bg-coral/10 text-coral' : 'border-border text-muted-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Biblioteca */}
      <section className="px-6 py-6">
        {hydrated && visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
            Todavía nada aquí — sube un PDF o añade tu primera receta.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hydrated &&
              visible.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setViewing(r)}
                  className="group flex flex-col rounded-2xl border border-border/60 bg-card p-4 text-left shadow-sm transition-colors hover:border-coral/40"
                >
                  <span
                    className={cn(
                      'mb-3 flex h-11 w-11 items-center justify-center rounded-2xl',
                      r.kind === 'pdf' ? 'bg-rose/15 text-rose' : 'bg-mint/20 text-mint',
                    )}
                  >
                    {r.kind === 'pdf' ? <FileText className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}
                  </span>
                  <p className="line-clamp-2 text-sm font-semibold leading-tight">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.category}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    {r.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {r.time}
                      </span>
                    )}
                    {r.servings && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {r.servings}
                      </span>
                    )}
                    {r.kind === 'pdf' && <span className="font-medium text-rose">PDF</span>}
                  </div>
                </button>
              ))}
          </div>
        )}
      </section>

      {viewing && <RecipeViewer recipe={viewing} onClose={() => setViewing(null)} onRemove={onRemove} />}
    </div>
  )
}

function RecipeViewer({
  recipe,
  onClose,
  onRemove,
}: {
  recipe: Recipe
  onClose: () => void
  onRemove: (r: Recipe) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Barra superior */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 py-3">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 truncate font-heading text-base font-semibold">{recipe.title}</p>
        <button
          onClick={() => onRemove(recipe)}
          aria-label="Eliminar receta"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {recipe.kind === 'pdf' ? (
        <PdfView id={recipe.id} name={recipe.fileName} />
      ) : (
        <ManualView recipe={recipe} />
      )}
    </div>
  )
}

function PdfView({ id, name }: { id: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl: string | undefined
    getPdf(id)
      .then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
        } else setError(true)
      })
      .catch(() => setError(true))
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  if (error)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No se pudo cargar el PDF. Puede que se haya borrado el almacenamiento del navegador.
      </div>
    )
  if (!url)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando receta…
      </div>
    )

  return (
    <>
      <iframe src={url} title={name} className="min-h-0 w-full flex-1" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center justify-center gap-2 border-t border-border/60 py-3 text-sm font-medium text-violet"
      >
        <ExternalLink className="h-4 w-4" /> Abrir en pestaña nueva
      </a>
    </>
  )
}

function ManualView({ recipe }: { recipe: Recipe }) {
  const ingredients = recipe.ingredients.split('\n').filter((l) => l.trim())
  const steps = recipe.steps.split('\n').filter((l) => l.trim())

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-coral/15 px-2.5 py-1 text-xs font-medium text-coral">
            {recipe.category}
          </span>
          {recipe.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {recipe.time}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {recipe.servings} porciones
            </span>
          )}
        </div>

        {ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-heading text-lg font-semibold">Ingredientes</h3>
            <ul className="space-y-1.5">
              {ingredients.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            <h3 className="mb-2 font-heading text-lg font-semibold">Preparación</h3>
            <ol className="space-y-2.5">
              {steps.map((st, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet/10 font-mono text-xs font-semibold text-violet">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{st}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
