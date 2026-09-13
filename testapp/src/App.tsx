export function App({ title }: { title: string }) {
  return <main className="shell">
    <span className="eyebrow">Ryvax by Kvant · React-first</span>
    <h1>{title}</h1>
    <p>SSR, hydration, typed APIs, SSG, and HMR for complete SaaS products.</p>
    <a href="/api/health">Check the API →</a>
  </main>;
}
