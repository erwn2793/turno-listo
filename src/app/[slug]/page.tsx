import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { getRepository } from "@/lib/datos";
import { formatWhatsappPhone, WEEKDAY_LABELS, WEEKDAYS } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const businesses = await getRepository().listBusinesses();
  return businesses.map((business) => ({ slug: business.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getRepository().getBusiness(slug);
  if (!business) {
    return { title: "Negocio no encontrado" };
  }
  return {
    title: business.nombre,
    description: business.descripcion,
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getRepository().getBusiness(slug);
  if (!business) {
    notFound();
  }

  const whatsappText = encodeURIComponent(
    `Hola ${business.nombre}, quiero consultar una cita.`,
  );

  return (
    <main>
      <header className="text-white" style={{ backgroundColor: business.colorMarca }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            ← Todos los negocios
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-white/80">
            {business.rubro} · {business.distrito}
          </p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">{business.nombre}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">{business.descripcion}</p>
          <a
            href={`https://wa.me/${business.telefonoWhatsapp}?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-900"
          >
            WhatsApp {formatWhatsappPhone(business.telefonoWhatsapp)}
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Horario</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {WEEKDAYS.map((weekday) => {
              const schedule = business.horario[weekday];
              const label =
                "cerrado" in schedule && schedule.cerrado
                  ? "Cerrado"
                  : "abre" in schedule
                    ? `${schedule.abre} – ${schedule.cierra}`
                    : "Cerrado";
              return (
                <li key={weekday} className="flex justify-between gap-3 text-slate-700">
                  <span>{WEEKDAY_LABELS[weekday]}</span>
                  <span className="font-semibold">{label}</span>
                </li>
              );
            })}
          </ul>
        </aside>
        <BookingForm business={business} />
      </div>
    </main>
  );
}
