export default function ResultsLoading() {
  return (
    <main className="results-shell" aria-busy="true" aria-live="polite">
      <div className="results-page-container">
        <header className="results-header">
          <p className="eyebrow">Cheat Meal</p>
          <h1 className="results-title">Finding strong options for your calorie target...</h1>
          <p className="results-subtitle">We’re scoring meals by fit, protein, and practical satisfaction.</p>
        </header>

        <section className="status-panel loading-panel" aria-label="Loading recommendations">
          <p className="status-title">Building your recommendations</p>
          <p className="status-copy">This usually takes a moment.</p>
          <div className="loading-list" aria-hidden="true">
            <div className="loading-card" />
            <div className="loading-card" />
            <div className="loading-card" />
          </div>
        </section>
      </div>
    </main>
  );
}
