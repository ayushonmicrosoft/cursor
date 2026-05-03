import { ExternalLink } from 'lucide-react'

export function LibraryDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
        <aside className="w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Docs</div>
            <h1 className="mt-1 text-xl font-semibold">Library</h1>
            <p className="mt-2 text-sm text-slate-500">Mini site for the block library and source references.</p>
          </div>
          <nav className="space-y-2 text-sm">
            <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="#overview">Overview</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="#sources">Sources</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="#models">Model names</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="#rendering">Rendering</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="#supabase">Supabase</a>
          </nav>
        </aside>

        <main className="flex-1 space-y-6">
          <section id="overview" className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">Library route</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Block Library Mini Site</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              This route surfaces the block library as an in-app documentation view, with source links,
              model names, renderer notes, and Supabase sync guidance.
            </p>
          </section>

          <section id="sources" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold">Source links</h3>
            <p className="mt-2 text-sm text-slate-600">The full source list lives in <code>docs/lib/index.html</code> and the data manifest.</p>
            <a className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:underline" href="/docs/lib/index.html" target="_blank" rel="noreferrer">
              Open docs mini site <ExternalLink size={14} />
            </a>
          </section>

          <section id="models" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold">Model naming</h3>
            <p className="mt-2 text-sm text-slate-600">Use the model name copied from the source page for now, and keep brand names out of the primary label.</p>
          </section>

          <section id="rendering" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold">Renderer coverage</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Konva renders the editable floor plan.</li>
              <li>Pixi mirrors the same block taxonomy for fast visualization.</li>
              <li>Shape variants should stay aligned with the library model.</li>
            </ul>
          </section>

          <section id="supabase" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold">Supabase sync</h3>
            <p className="mt-2 text-sm text-slate-600">Records upsert into <code>block_library_records</code> when the table and policies allow it.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
