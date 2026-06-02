import MapboxMap from "./components/MapboxMap";

export default function Home() {
  const mapboxToken = process.env.PUBLIC_TOKEN_MAPBOX;

  return (
    <>
      <div className="bg-slate-50">
        <section className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Le sport en accès libre.<br />
            <span className="text-[var(--color-primary)]">Enrichi par la communauté.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            La carte collaborative des équipements sportifs publics en France. Un outil pensé pour les sportifs et le bien commun. Trouvez facilement où vous entraîner en extérieur et aidez les autres en partageant vos spots.
          </p>
        </section>
      </div>

      <section id="map" className="relative w-full h-[600px] lg:h-[calc(100vh-24rem)] border-t border-slate-200">
        <MapboxMap token={mapboxToken} className="absolute inset-0 w-full h-full bg-slate-100" />
      </section>
    </>
  );
}
