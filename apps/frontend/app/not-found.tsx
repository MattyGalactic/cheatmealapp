import Link from "next/link";

export default function NotFound() {
  return (
    <main className="hero">
      <div className="container">
        <section className="hero-card" aria-labelledby="not-found-title">
          <div className="hero-copy">
            <p className="brand" id="not-found-title">Cheat Meal</p>
            <h1 className="hero-title">That page is off the menu.</h1>
            <p className="hero-support">Head back home and we’ll find a better move.</p>
          </div>
          <Link href="/" className="button" style={{ textDecoration: "none", textAlign: "center" }}>
            Go home
          </Link>
        </section>
      </div>
    </main>
  );
}
