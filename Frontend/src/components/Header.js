export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 text-lg font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
          R
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Resumate</h1>
            <p className="text-sm text-slate-300">Precision AI resume optimizer</p>
          </div>
        </div>

        <div className="hidden rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200 sm:block">
          Live ATS Targeting
        </div>
      </div>
    </header>
  );
}
