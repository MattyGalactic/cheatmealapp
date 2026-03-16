import { LandingSearchForm } from "../components/LandingSearchForm";

const EXAMPLE_MEALS = [
  {
    calories: 620,
    restaurant: "Chick-fil-A",
    items: ["8-count grilled nuggets", "medium waffle fries", "diet lemonade"],
    rationale: "Best balanced indulgence under budget",
  },
  {
    calories: 740,
    restaurant: "Taco Bell",
    items: ["chicken quesadilla", "bean burrito", "Baja Blast Zero"],
    rationale: "Most satisfying late-night option under 750",
  },
  {
    calories: 690,
    restaurant: "Chipotle",
    items: ["chicken burrito bowl", "chips", "diet soda"],
    rationale: "Biggest portion without blowing the day",
  },
];

export default function HomePage() {
  return (
    <main className="hero">
      <div className="container">
        <section className="hero-card" aria-labelledby="cheatmeal-title">
          <div className="hero-copy">
            <p className="brand" id="cheatmeal-title">Cheat Meal</p>
            <h1 className="hero-title">Find the smartest indulgence for the calories you have left.</h1>
            <p className="hero-support">
              Skip the menu spiral. Get one strong fast-food move that still fits the day.
            </p>
          </div>

          <div className="hero-action-block">
            <LandingSearchForm />
            <p className="hero-action-note">Start with your remaining calories and let Cheat Meal do the hard part.</p>
          </div>

          <div className="proof-section" aria-labelledby="example-meals-title">
            <div className="proof-header">
              <p className="proof-eyebrow">Example recommendations</p>
              <h2 className="proof-title" id="example-meals-title">What a great answer looks like</h2>
              <p className="proof-copy">
                Built to recommend one genuinely satisfying move fast — not dump a wall of menu data on you when you're already hungry.
              </p>
            </div>

            <div className="proof-grid">
              {EXAMPLE_MEALS.map((meal) => (
                <article key={`${meal.restaurant}-${meal.calories}`} className="proof-card">
                  <div className="proof-card-topline">
                    <span className="proof-calories">{meal.calories} cal</span>
                    <span className="proof-restaurant">{meal.restaurant}</span>
                  </div>

                  <ul className="proof-items">
                    {meal.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <p className="proof-rationale">{meal.rationale}</p>
                  <p className="proof-note">Exact menu combinations like this are what Cheat Meal is built to surface.</p>
                </article>
              ))}
            </div>
          </div>

          <p className="footer-note">National chains only. Results within 10 miles.</p>
        </section>
      </div>
    </main>
  );
}
