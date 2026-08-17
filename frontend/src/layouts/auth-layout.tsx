import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export function AuthLayout() {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div className="flex w-full flex-col overflow-y-auto px-6 py-8 sm:px-12 md:w-1/2 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200 p-16 md:flex dark:from-slate-900 dark:to-slate-950">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10 max-w-lg space-y-8 text-center">
          <Logo withWordmark={false} size={96} className="mx-auto justify-center opacity-90 drop-shadow-sm" />

          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Maîtrisez votre temps,
            <br />
            <span style={{ color: 'var(--brand-red)' }}>transformez vos projets.</span>
          </h2>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            GuineeTache est votre partenaire quotidien pour une productivité sans limites. Gérez vos tâches avec
            la précision et l'énergie de la Guinée.
          </p>

          <div className="flex justify-center gap-3 pt-2 opacity-90">
            <div className="h-2 w-16 rounded-full" style={{ backgroundColor: 'var(--brand-red)' }} />
            <div className="h-2 w-8 rounded-full" style={{ backgroundColor: 'var(--brand-yellow)' }} />
            <div className="h-2 w-16 rounded-full" style={{ backgroundColor: 'var(--brand-green)' }} />
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, var(--brand-red) 0%, var(--brand-yellow) 50%, var(--brand-green) 100%)' }}
        />
      </div>
    </div>
  )
}
