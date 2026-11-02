const TABS = [
  ["", "All", "all"],
  ["scheduled", "Scheduled", "scheduled"],
  ["completed", "Completed", "completed"],
  ["cancelled", "Cancelled", "cancelled"],
];

export default function FilterBar({ filters, setFilters, doctors, counts }) {
  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const hasFilters = filters.q || filters.date || filters.doctor || filters.status;

  return (
    <div>
      <div className="tabs" role="group" aria-label="Filter by status">
        {TABS.map(([value, label, key]) => (
          <button
            key={key}
            type="button"
            className="tab"
            aria-pressed={filters.status === value}
            onClick={() => setFilters({ ...filters, status: value })}
          >
            <span className={`dot dot-${key}`} aria-hidden="true" />
            {label}
            <span className="count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by patient name or email"
          value={filters.q}
          onChange={set("q")}
          aria-label="Search patients"
        />
        <input type="date" value={filters.date} onChange={set("date")} aria-label="Filter by date" />
        <select value={filters.doctor} onChange={set("doctor")} aria-label="Filter by doctor">
          <option value="">All doctors</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!hasFilters}
          onClick={() => setFilters({ q: "", date: "", status: "", doctor: "" })}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}