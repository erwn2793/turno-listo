import Link from "next/link";
import { MonthlyChart } from "@/components/monthly-chart";
import { getRepository } from "@/lib/datos";
import { formatSoles } from "@/lib/format";
import type { Business } from "@/lib/types";

const benefits = [
  {
    title: "Horario visible",
    text: "El cliente ve solo las horas que de verdad están libres.",
  },
  {
    title: "Menos mensajes",
    text: "La cita queda confirmada en la página, sin ida y vuelta por el celular.",
  },
  {
    title: "Panel simple",
    text: "Ves las reservas de todos tus locales en una sola tabla.",
  },
];

const steps = [
  {
    number: "1",
    title: "Publica tu negocio",
    text: "Agregas un archivo con tus servicios, precios y horario.",
  },
  {
    number: "2",
    title: "El cliente elige",
    text: "Escoge el servicio, el día y una hora disponible.",
  },
  {
    number: "3",
    title: "Llegan a la cita",
    text: "La reserva aparece en el panel y el cliente ya sabe a qué hora venir.",
  },
];

const testimonials = [
  {
    quote:
      "Antes anotaba las citas en un cuaderno. Ahora mis clientes de Surquillo reservan solos.",
    name: "Rosa Delgado",
    role: "Barbería Don Lucho",
  },
  {
    quote:
      "La limpieza dental se llena sin que la recepción pase el día contestando el teléfono.",
    name: "Hugo Salazar",
    role: "Consultorio Dental Sonrisa",
  },
  {
    quote: "Las clases del domingo se agotan y yo me entero en el panel.",
    name: "Valeria Paredes",
    role: "Estudio Yoga Miraflores",
  },
];

export default async function HomePage() {
  const businesses = await getRepository().listBusinesses();

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Reservas para negocios locales
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Tus clientes reservan en un minuto
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Barberías, consultorios y estudios en el Perú publican su horario y reciben citas
            sin cuaderno ni mensajes eternos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#negocios"
              className="rounded-full bg-teal-700 px-6 py-3 text-center font-semibold text-white hover:bg-teal-800"
            >
              Ver negocios
            </a>
            <Link
              href="/panel"
              className="rounded-full bg-white px-6 py-3 text-center font-semibold text-teal-800 ring-1 ring-teal-200 hover:bg-teal-50"
            >
              Abrir el panel
            </Link>
          </div>
        </div>
        <img
          src="/imagenes/portada-local.png"
          alt="Ilustración del local con el horario del día"
          className="h-72 w-full rounded-3xl object-cover shadow-lg md:h-[28rem]"
        />
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-3xl bg-teal-50 p-6">
              <h2 className="text-xl font-bold text-teal-900">{benefit.title}</h2>
              <p className="mt-3 leading-7 text-slate-700">{benefit.text}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-4">
          <img
            src="/imagenes/equipo-atencion.png"
            alt="Equipo atendiendo con la agenda del día a la vista"
            className="h-64 w-full rounded-3xl object-cover md:h-96"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Cómo funciona</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="rounded-3xl border border-teal-100 bg-white p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 font-bold text-white">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-teal-800 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Lo que dicen los locales</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.name} className="rounded-3xl bg-teal-900/60 p-6">
                <blockquote className="text-lg leading-8">“{item.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-teal-100">
                  <span className="block font-semibold text-white">{item.name}</span>
                  {item.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="negocios" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Negocios en Lima</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Tres locales de ejemplo. En el curso vas a sumar el tuyo con un archivo JSON.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-900">Reservas por mes</h2>
          <p className="mt-3 text-slate-600">Ejemplo para ver cómo crece la agenda.</p>
          <div className="mt-8 rounded-3xl border border-slate-200 p-4 md:p-6">
            <MonthlyChart />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <img
          src="/imagenes/calendario-citas.png"
          alt="Calendario de citas de la semana"
          className="h-64 w-full rounded-3xl object-cover md:h-96"
        />
        <p className="mt-4 text-center text-slate-600">
          Un horario claro, en el celular y en el proyector del local.
        </p>
      </section>
    </main>
  );
}

function BusinessCard({ business }: { business: Business }) {
  const lowest = Math.min(...business.servicios.map((service) => service.precioSoles));

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-2" style={{ backgroundColor: business.colorMarca }} />
      <div className="p-6">
        <p className="text-sm font-semibold text-teal-700">
          {business.rubro} · {business.distrito}
        </p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{business.nombre}</h3>
        <p className="mt-3 leading-7 text-slate-600">{business.descripcion}</p>
        <p className="mt-4 font-semibold text-slate-800">Desde {formatSoles(lowest)}</p>
        <Link
          href={`/${business.slug}`}
          className="mt-6 inline-flex rounded-full bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
        >
          Ver horarios
        </Link>
      </div>
    </article>
  );
}
