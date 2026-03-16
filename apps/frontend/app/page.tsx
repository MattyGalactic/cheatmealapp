import { LandingSearchForm } from "../components/LandingSearchForm";
import { HomeAnalytics } from "../components/HomeAnalytics";

const EXAMPLE_MEALS = [
  {
    itemName: "Grilled nuggets + fries",
    restaurant: "Chick-fil-A",
    calories: 620,
    protein: 38,
    carbs: 52,
    fat: 24,
    items: ["8-count grilled nuggets", "medium waffle fries", "diet lemonade"],
    rationale: "Best balanced indulgence under budget",
  },
  {
    itemName: "Quesadilla late-night combo",
    restaurant: "Taco Bell",
    calories: 740,
    protein: 28,
    carbs: 74,
    fat: 36,
    items: ["chicken quesadilla", "bean burrito", "Baja Blast Zero"],
    rationale: "Most satisfying late-night option under 750",
  },
  {
    itemName: "Big bowl + chips combo",
    restaurant: "Chipotle",
    calories: 690,
    protein: 35,
    carbs: 68,
    fat: 28,
    items: ["chicken burrito bowl", "chips", "diet soda"],
    rationale: "Biggest portion without blowing the day",
  },
];

export default function HomePage() {
  return (
    <main className="hero">
      <HomeAnalytics />
      <div className="container">
        <section className="hero-card" aria-labelledby="cheatmeal-title">
          <div className="hero-copy">
            <p className="brand" id="cheatmeal-title">Cheat Meal</p>
            <h1 className="hero-title">Find the smartest indulgence for the calories you have left.</h1>
          </div>

          <LandingSearchForm />

          <div className="proof-section" aria-labelledby="example-meals-title">
            <div className="proof-header">
              <p className="proof-eyebrow">Example recommendations</p>
              <h2 className="proof-title" id="example-meals-title">What a great answer looks like</h2>
            </div>

            <div className="proof-grid">
              {EXAMPLE_MEALS.map((meal) => (
                <details key={`${meal.restaurant}-${meal.calories}`} className="proof-card">
                  <summary className="proof-summary">
                    <div className="proof-summary-copy">
                      <p className="proof-item-name">{meal.itemName}</p>
                      <p className="proof-restaurant">{meal.restaurant}</p>
                    </div>
                    <div className="proof-summary-meta">
                      <span className="proof-calories">{meal.calories} cal</span>
                      <span className="proof-macros">P {meal.protein} · C {meal.carbs} · F {meal.fat}</span>
                    </div>
                  </summary>

                  <div className="proof-expanded">
                    <ul className="proof-items">
                      {meal.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <p className="proof-rationale">{meal.rationale}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <p className="footer-note">National chains only. Results within 10 miles.</p>
        </section>
      </div>
    </main>
  );
}
