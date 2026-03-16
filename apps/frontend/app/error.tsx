"use client";

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
                <p className="hero-support">The app hit an unexpected error. Try again and we’ll get you back to the menu.</p>
              </div>
              <button type="button" className="submit-btn" onClick={() => reset()}>
                Try again
              </button>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
