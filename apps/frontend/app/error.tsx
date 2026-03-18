"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <main className="hero">
          <div className="container">
            <section className="hero-card" aria-labelledby="error-title">
              <div className="hero-copy">
                <p className="brand" id="error-title">Cheat Meal</p>
                <h1 className="hero-title">Something went sideways.</h1>
                <p className="hero-support">The app hit an unexpected error. Try again and we’ll get you back to your options.</p>
              </div>
              <div className="status-actions">
                <button type="button" className="button" onClick={() => reset()}>
                  Try again
                </button>
                <Link href="/" className="link-button">
                  Back home
                </Link>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
