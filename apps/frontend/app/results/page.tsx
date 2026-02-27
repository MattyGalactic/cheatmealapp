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
      <div className="container results-container">
        <header className="results-header">
          <p className="eyebrow">Cheat Meal</p>
          <p className="results-subtitle">
            Spend your last {calories} calories wisely.
          </p>
          <p className="results-subtitle">
            Nashville pilot. National chains within 10 miles. <Link href="/">Adjust calories</Link>
            {data ? ` | Source: ${data.meta.dataSource}` : ""}
          </p>
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
