import Link from "next/link";
import { headers } from "next/headers";
import { ResultsListClient } from "../../components/ResultsListClient";
import { fetchRecommendations } from "../../lib/api";

type ResultsPageProps = {
  searchParams: {
    calories?: string;
    page?: string;
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

  const nextHref = `/results?calories=${calories}&page=${page + 1}`;

  return (
    <main className="results-shell">
      <div className="results-page-container">
        <header className="results-header">
          <p className="eyebrow">Cheat Meal</p>
          <h1 className="results-title">Spend your last {calories} calories wisely.</h1>
          <p className="results-subtitle">One strong move beats a dozen mediocre ones.</p>
          <div className="results-meta-row">
            <p className="results-meta">Nashville pilot · National chains within 10 miles{data ? ` · Source: ${data.meta.dataSource}` : ""}</p>
            <Link className="results-meta-link" href="/">Adjust calories</Link>
          </div>
        </header>

        {error ? <p className="empty">{error}</p> : null}

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
