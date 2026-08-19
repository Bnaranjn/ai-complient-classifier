"use client";

import { useEffect, useMemo, useState } from "react";

type Complaint = {
  id: number;
  text: string;
  category: string | null;
  sentiment: string | null;
  severity: string | null;
  summary: string | null;
  suggestedAction: string | null;
  priorityScore: number | null;
  priorityReason: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  sentiment: { positive: number; neutral: number; negative: number };
  severity: { low: number; medium: number; high: number };
  categories: { delivery: number; billing: number; product: number; support: number; other: number };
};

const emptyStats: Stats = {
  total: 0,
  sentiment: { positive: 0, neutral: 0, negative: 0 },
  severity: { low: 0, medium: 0, high: 0 },
  categories: { delivery: 0, billing: 0, product: 0, support: 0, other: 0 },
};

const categoryLabels: Record<string, string> = {
  delivery: "Delivery",
  billing: "Billing",
  product: "Product",
  support: "Customer Support",
  other: "Other",
};

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function pretty(value: string | null | undefined) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function priorityFromScore(score: number | null) {
  if (score === null || score === undefined) return "—";
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

export default function Home() {
  const [page, setPage] = useState<"dashboard" | "complaints" | "analyze">("dashboard");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  async function loadData() {
    try {
      setLoadingData(true);
      const [complaintsResponse, statsResponse] = await Promise.all([
        fetch("/api/complaints", { cache: "no-store" }),
        fetch("/api/complaints/stats", { cache: "no-store" }),
      ]);

      if (!complaintsResponse.ok || !statsResponse.ok) {
        throw new Error("Could not load complaint data.");
      }

      const complaintsData = await complaintsResponse.json();
      const statsData = await statsResponse.json();
      setComplaints(complaintsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data.");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function analyzeComplaint() {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze complaint.");
      }

      setAnalysis(data);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze complaint.");
    } finally {
      setLoading(false);
    }
  }

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const haystack = `${item.text} ${item.category ?? ""} ${item.summary ?? ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const itemPriority = priorityFromScore(item.priorityScore).toLowerCase();
      const matchesCategory = category === "all" || item.category === category;
      const matchesPriority = priority === "all" || itemPriority === priority;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [complaints, search, category, priority]);

  const biggestCategory = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0];
  const negativePercentage = percentage(stats.sentiment.negative, stats.total);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div><strong>ComplaintLens</strong><span>AI complaint intelligence</span></div>
        </div>

        <nav>
          <button className={page === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setPage("dashboard")}><span>⌂</span> Dashboard</button>
          <button className={page === "complaints" ? "nav-item active" : "nav-item"} onClick={() => setPage("complaints")}><span>☷</span> Complaints</button>
          <button className={page === "analyze" ? "nav-item active" : "nav-item"} onClick={() => setPage("analyze")}><span>✦</span> Analyze</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-status"><span className="status-dot" /><div><strong>AI engine</strong><span>Gemini + database connected</span></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">Customer intelligence</p><h1>{page === "dashboard" ? "Complaint Overview" : page === "complaints" ? "All Complaints" : "Analyze a Complaint"}</h1></div>
          <button className="primary-btn" onClick={() => setPage("analyze")}>+ New Complaint</button>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {page === "dashboard" && (
          <div className="content">
            <section className="hero">
              <div>
                <span className="pill">● Live database</span>
                <h2>Turn customer complaints into actionable insights.</h2>
                <p>Gemini analyzes each complaint, stores the result, and turns the data into a live dashboard.</p>
              </div>
              <button className="dark-btn" onClick={() => setPage("analyze")}>Analyze complaint →</button>
            </section>

            <section className="stats-grid">
              <Stat label="Total complaints" value={loadingData ? "…" : stats.total.toString()} detail="Saved in database" />
              <Stat label="Biggest problem" value={biggestCategory ? categoryLabels[biggestCategory[0]] : "—"} detail={biggestCategory ? `${percentage(biggestCategory[1], stats.total)}% of complaints` : "No data yet"} />
              <Stat label="Negative sentiment" value={`${negativePercentage}%`} detail="AI-detected negative" />
              <Stat label="High severity" value={stats.severity.high.toString()} detail="Needs attention" />
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-heading"><div><p className="eyebrow">Distribution</p><h3>Complaints by category</h3></div><span className="muted">Live from API</span></div>
                {Object.entries(stats.categories).map(([key, count]) => (
                  <div className="bar-row" key={key}>
                    <div className="bar-meta"><span>{categoryLabels[key]}</span><strong>{percentage(count, stats.total)}%</strong></div>
                    <div className="bar-track"><div className="bar-value" style={{ width: `${percentage(count, stats.total)}%` }} /></div>
                    <small>{count} complaints</small>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-heading"><div><p className="eyebrow">AI insight</p><h3>What needs attention?</h3></div></div>
                <div className="insight-card">
                  <div className="insight-icon">!</div>
                  <div><span className="muted">Largest category</span><h3>{biggestCategory ? categoryLabels[biggestCategory[0]] : "No data yet"}</h3><p>{biggestCategory ? `${percentage(biggestCategory[1], stats.total)}% of analyzed complaints belong to this category.` : "Analyze a complaint to start building insights."}</p></div>
                </div>
                <div className="recommendation"><span>Suggested action</span><strong>Investigate the most common complaint category first.</strong></div>
              </div>
            </section>
          </div>
        )}

        {page === "analyze" && (
          <div className="content narrow">
            <div className="panel analyze-panel">
              <div className="panel-heading"><div><p className="eyebrow">Real AI classification</p><h3>What is the customer complaining about?</h3></div></div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Example: My package was supposed to arrive yesterday but it still hasn't arrived..." />
              <div className="example-row">
                <span>Try:</span>
                <button onClick={() => setText("My package was supposed to arrive yesterday but it still hasn't arrived.")}>Delivery</button>
                <button onClick={() => setText("I was charged twice for the same order.")}>Billing</button>
                <button onClick={() => setText("The app keeps crashing when I try to pay.")}>Technical</button>
              </div>
              <button className="primary-btn large" onClick={analyzeComplaint} disabled={loading || !text.trim()}>{loading ? "Analyzing with AI…" : "Analyze complaint ✦"}</button>
            </div>

            {analysis && (
              <div className="panel result-panel">
                <div className="result-header"><div><p className="eyebrow">AI result</p><h3>Complaint analyzed and saved</h3></div><span className="success-pill">✓ Saved</span></div>
                <div className="result-grid">
                  <Result label="Category" value={pretty(analysis.category)} />
                  <Result label="Sentiment" value={pretty(analysis.sentiment)} />
                  <Result label="Severity" value={pretty(analysis.severity)} />
                  <Result label="Priority score" value={analysis.priorityScore === null ? "—" : `${analysis.priorityScore}/100`} />
                </div>
                <div className="summary-box"><span>AI summary</span><p>{analysis.summary || "No summary returned."}</p></div>
                <div className="summary-box"><span>Suggested action</span><p>{analysis.suggestedAction || "No action returned."}</p></div>
                <button className="dark-btn" onClick={() => { setText(""); setAnalysis(null); setPage("complaints"); }}>View complaints →</button>
              </div>
            )}
          </div>
        )}

        {page === "complaints" && (
          <div className="content">
            <div className="panel">
              <div className="filters">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints..." />
                <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option><option value="delivery">Delivery</option><option value="billing">Billing</option><option value="product">Product</option><option value="support">Support</option><option value="other">Other</option></select>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
              </div>
              <div className="table-wrap">
                <table><thead><tr><th>Complaint</th><th>Category</th><th>Sentiment</th><th>Severity</th><th>Priority</th><th>Date</th></tr></thead>
                  <tbody>{filteredComplaints.map((item) => <tr key={item.id}><td><div className="complaint-cell"><strong>{item.summary || "Complaint"}</strong><span>{item.text}</span></div></td><td><span className="category-pill">{pretty(item.category)}</span></td><td>{pretty(item.sentiment)}</td><td>{pretty(item.severity)}</td><td><span className={`priority ${priorityFromScore(item.priorityScore).toLowerCase()}`}>{priorityFromScore(item.priorityScore)}</span></td><td className="muted">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
                </table>
                {filteredComplaints.length === 0 && <div className="empty">No complaints match your filters.</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="result-item"><span>{label}</span><strong>{value}</strong></div>; }
