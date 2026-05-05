import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-[#E8621A] mb-4">404</div>
        <h1 className="text-3xl font-black text-[#1E2A4A] mb-3">Página no encontrada</h1>
        <p className="text-[#1E2A4A]/60 mb-8 max-w-md mx-auto">
          La página que buscas no existe o fue movida.
          Vuelve al inicio para continuar navegando.
        </p>
        <Link
          href="/"
          className="btn-naranja text-base px-8 py-4"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
