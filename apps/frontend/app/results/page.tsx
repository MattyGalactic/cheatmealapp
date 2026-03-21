import Link from "next/link";
import { headers } from "next/headers";
import { ResultsListClient } from "../../components/ResultsListClient";
import { fetchRecommendations } from "../../lib/api";

type ResultsPageProps = {
  searchParams: {
    calories?: string;
    page?: string;
    sort?: string;
    provider?: string;
    cravings?: string;
    match?: string;
  };
};

function parseCalorieBudget(value?: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 400;
  return Math.max(50, Math.min(2000, Math.round(parsed)));
}

function parsePage(value?: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const calories = parseCalorieBudget(searchParams.calories);
  const page = parsePage(searchParams.page);
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  let data;
  let error: string | null = null;

  try {
    data = await fetchRecommendations({ calories, page, pageSize: 10, baseUrl: origin });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load recommendations";
  }

  const nextParams = new URLSearchParams({
    calories: String(calories),
    page: String(page + 1),
  });

  if (searchParams.sort) nextParams.set("sort", searchParams.sort);
  if (searchParams.provider) nextParams.set("provider", searchParams.provider);
  if (searchParams.cravings) nextParams.set("cravings", searchParams.cravings);
  if (searchParams.match) nextParams.set("match", searchParams.match);

  const nextHref = `/results?${nextParams.toString()}`;

  return (
    <main className="results-shell">
      <div className="results-page-container">
        <header className="results-header">
          <p className="eyebrow">Cheat Meal</p>
          <h1 className="results-title">Here are strong options around your {calories}-calorie target.</h1>
          <div className="results-header-footer">
            <div>
              <p className="results-meta">National chains within 10 miles (Nashville pilot)</p>
              {data ? <p className="results-meta-source">Data source: {data.meta.dataSource}</p> : null}
            </div>
            <Link className="results-meta-link" href="/">Adjust calories</Link>
          </div>
        </header>

        {error ? (
          <section className="status-panel" aria-live="polite" aria-label="Could not load recommendations">
            <p className="status-title">We couldn’t load recommendations right now.</p>
            <p className="status-copy">Your calorie target is saved. This is usually temporary—try again in a few seconds.</p>
            <p className="status-detail">Technical detail: {error}</p>
            <div className="status-actions">
              <Link className="link-button" href={`/results?calories=${calories}&page=${page}`}>
                Try again
              </Link>
              <Link className="link-button" href="/">
                Start a new search
              </Link>
            </div>
          </section>
        ) : null}

        {!error && data ? (
          <ResultsListClient
            calorieBudget={calories}
            data={data}
            nextHref={nextHref}
          />
        ) : null}
      </div>
    </main>
  );
}
