export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-4 px-8 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Remote · Acme Sandbox Corp
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
        Org chart
      </h1>
      <p className="max-w-xl text-lg text-zinc-600">
        Scaffold is live. Chart data and Norma chrome land in the next issues.
      </p>
    </main>
  );
}
