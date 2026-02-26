import { LandingSearchForm } from "../components/LandingSearchForm";

export default function HomePage() {
  return (
    <main className="hero">
      <div className="container">
        <section className="hero-card" aria-labelledby="cheatmeal-title">
          <p className="brand" id="cheatmeal-title">Cheat Smart.</p>
          <p className="tagline">Strategic Indulgence for the end of your day.</p>

          <LandingSearchForm />

          <p className="footer-note">National chains only. Results within 10 miles.</p>
        </section>
      </div>
    </main>
  );
}
