import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  description:
    'Aviso de privacidad integral de MarkaLab conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
  robots: { index: true, follow: true },
}

const ACTUALIZADO = '24 de septiembre de 2026'

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold text-[#1E2A4A] md:text-2xl">{titulo}</h2>
      <div className="space-y-3 text-[0.97rem] leading-relaxed text-[#1E2A4A]/80">{children}</div>
    </section>
  )
}

export default function AvisoDePrivacidad() {
  return (
    <div className="bg-[#F0EBE3]">
      <header className="bg-[#1E2A4A] px-4 pb-14 pt-28 text-white md:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Aviso de Privacidad
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Qué datos recabamos, para qué los usamos y cómo puedes pedirnos que dejemos de
            usarlos.
          </p>
          <p className="mt-6 text-sm text-white/40">Última actualización: {ACTUALIZADO}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <Seccion titulo="Quién es responsable de tus datos">
          <p>
            <strong>MarkaLab</strong>, con domicilio en Jardines del Pedregal, Ciudad de México,
            es responsable del tratamiento de los datos personales que nos proporcionas.
          </p>
          <p>
            Para cualquier tema relacionado con este aviso puedes escribirnos a{' '}
            <a href="mailto:comercial@markalab.com.mx" className="font-medium text-[#E8621A] underline">
              comercial@markalab.com.mx
            </a>
            .
          </p>
        </Seccion>

        <Seccion titulo="Qué datos recabamos">
          <p>Según cómo nos contactes, podemos recabar:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Nombre y nombre de tu empresa.</li>
            <li>Correo electrónico y teléfono.</li>
            <li>Giro de tu negocio y la información comercial que compartas al describir tus retos.</li>
            <li>El contenido de las conversaciones que tengas con Kala, nuestra asistente de chat.</li>
            <li>Datos técnicos de navegación: página desde la que escribes e identificador de sesión.</li>
          </ul>
          <p>
            <strong>No recabamos datos personales sensibles</strong> —origen racial o étnico, estado
            de salud, creencias religiosas, preferencias sexuales o similares—, ni datos
            financieros o patrimoniales a través de este sitio. Te pedimos que no los incluyas en
            los formularios ni en el chat.
          </p>
        </Seccion>

        <Seccion titulo="Para qué los usamos">
          <p>Usamos tus datos para las siguientes finalidades necesarias:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Responder tus preguntas y darte seguimiento.</li>
            <li>Preparar y presentarte una propuesta de servicios.</li>
            <li>Agendar y confirmar reuniones contigo.</li>
            <li>Si eres cliente, darte acceso a los entregables de tu proyecto y a su estado de avance.</li>
          </ul>
          <p>Y para estas finalidades adicionales, que puedes rechazar sin que afecte lo anterior:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Enviarte contenido, novedades o invitaciones de MarkaLab.</li>
            <li>Evaluar y mejorar la calidad de nuestra atención.</li>
          </ul>
          <p>
            Si no quieres que usemos tus datos para las finalidades adicionales, escríbenos a{' '}
            <a href="mailto:comercial@markalab.com.mx" className="font-medium text-[#E8621A] underline">
              comercial@markalab.com.mx
            </a>{' '}
            en cualquier momento.
          </p>
        </Seccion>

        <Seccion titulo="Kala, nuestra asistente de chat">
          <p>
            Kala es una asistente automatizada, no una persona. Las conversaciones que tengas con
            ella se guardan para dar seguimiento comercial y se procesan con servicios de
            inteligencia artificial de terceros.
          </p>
          <p>
            No compartas con Kala contraseñas, datos bancarios, números de tarjeta ni información
            sensible. Si eres cliente, Kala te pedirá confirmar tu identidad antes de darte
            información de tu proyecto, y nunca te mostrará documentos en el chat: te los envía al
            correo con el que estás registrado.
          </p>
        </Seccion>

        <Seccion titulo="Con quién los compartimos">
          <p>
            No vendemos ni rentamos tus datos. Los compartimos únicamente con proveedores que nos
            ayudan a operar el servicio y que están obligados a protegerlos:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Servicios de infraestructura, correo, calendario y almacenamiento en la nube.</li>
            <li>Proveedores de automatización de procesos y de inteligencia artificial conversacional.</li>
            <li>Autoridades competentes, cuando exista una obligación legal.</li>
          </ul>
          <p>
            Algunos de estos proveedores operan fuera de México. Al usar este sitio consientes esa
            transferencia en los términos del artículo 37 de la Ley.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos ARCO">
          <p>
            Tienes derecho a <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong> si
            son inexactos, <strong>cancelarlos</strong> cuando consideres que no se requieren, y{' '}
            <strong>oponerte</strong> a su uso para fines específicos. También puedes revocar tu
            consentimiento en cualquier momento.
          </p>
          <p>
            Para ejercerlos, envía tu solicitud a{' '}
            <a href="mailto:comercial@markalab.com.mx" className="font-medium text-[#E8621A] underline">
              comercial@markalab.com.mx
            </a>{' '}
            incluyendo tu nombre, un medio para contactarte, la descripción clara de lo que pides y
            un documento que acredite tu identidad.
          </p>
          <p>
            Te responderemos en un plazo máximo de 20 días hábiles. Si la respuesta es procedente,
            se hará efectiva dentro de los 15 días hábiles siguientes.
          </p>
        </Seccion>

        <Seccion titulo="Cuánto tiempo los conservamos">
          <p>
            Conservamos tus datos mientras exista una relación comercial o una posibilidad real de
            que se dé, y después durante el tiempo que exijan las obligaciones fiscales y legales
            aplicables. Cumplido ese plazo, se eliminan o se anonimizan.
          </p>
        </Seccion>

        <Seccion titulo="Cookies y tecnologías similares">
          <p>
            Este sitio usa almacenamiento local del navegador para mantener tu sesión de chat
            mientras dure la pestaña. Esa información no se comparte con terceros con fines
            publicitarios y puedes borrarla desde la configuración de tu navegador.
          </p>
        </Seccion>

        <Seccion titulo="Cambios a este aviso">
          <p>
            Podemos actualizar este aviso cuando cambien nuestras prácticas o la legislación
            aplicable. La versión vigente siempre estará publicada en esta página, con su fecha de
            actualización.
          </p>
        </Seccion>

        <Seccion titulo="Si algo no te parece">
          <p>
            Si consideras que tu derecho a la protección de datos personales fue vulnerado, puedes
            acudir ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección
            de Datos Personales (INAI).
          </p>
        </Seccion>

        <div className="mt-14 border-t border-[#1E2A4A]/10 pt-8">
          <Link
            href="/"
            className="inline-block rounded-full bg-[#E8621A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#C4511A]"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
