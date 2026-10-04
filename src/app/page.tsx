export default function Home() {
  return (
    <main className="flex flex-col gap-4 p-10">
      <h1 className="text-3xl font-extrabold">SIMUDA</h1>
      <p className="text-on-surface-variant">Cek token warna Material 3</p>
      <div className="flex flex-wrap gap-3">
        <div className="rounded-3xl bg-primary p-6 text-on-primary">primary</div>
        <div className="rounded-3xl bg-primary-container p-6 text-on-primary-container">primary-container</div>
        <div className="rounded-3xl bg-secondary-container p-6 text-on-secondary-container">secondary-container</div>
        <div className="rounded-3xl bg-tertiary-container p-6 text-on-tertiary-container">tertiary-container</div>
        <div className="rounded-3xl bg-surface-mid p-6">surface-mid</div>
        <div className="rounded-3xl bg-warning-container p-6 text-on-warning-container">warning-container</div>
      </div>
    </main>
  );
}
