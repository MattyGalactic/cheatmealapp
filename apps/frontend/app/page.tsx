import Link from "next/link";
import { LandingSearchForm } from "../components/LandingSearchForm";

export default function HomePage() {
  return (
    <main className="hero">
      <div className="container">
        <section className="hero-card" aria-labelledby="cheatmeal-title">
          <p className="eyebrow">Nashville Pilot</p>
          <p className="brand" id="cheatmeal-title">Cheat Meal</p>
          <p className="tagline">Enter the number of calories you have left for the day</p>

          <LandingSearchForm />

          <p className="footer-note">National chains only. Results within 10 miles.</p>
          <p className="footer-note">
            Health endpoint: <Link href="/api/health">/api/health</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
