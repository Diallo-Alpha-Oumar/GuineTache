import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CompassIcon className="size-8" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold">404</h1>
        <p className="text-muted-foreground">Cette page n'existe pas.</p>
      </div>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
