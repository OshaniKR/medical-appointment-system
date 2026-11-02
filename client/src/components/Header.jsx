import { greeting, longToday } from "../dates.js";

function todayLine(count) {
  if (count === null) return "";
  if (count === 0) return "No visits are scheduled for today.";
  if (count === 1) return "1 visit is scheduled for today.";
  return `${count} visits are scheduled for today.`;
}

export default function Header({ todayCount }) {
  return (
    <header className="masthead">
      <div className="container masthead-inner">
        <div className="brand">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <rect width="40" height="40" rx="12" fill="#0B7A72" />
            <path d="M20 10v20M10 20h20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span>Medical Appointment System</span>
        </div>

        <h1>{greeting()}</h1>
        <p className="lede">
          {longToday()}. {todayLine(todayCount)}
        </p>

        {/* Heartbeat line: draws itself once on load */}
        <svg className="ecg" viewBox="0 0 600 90" aria-hidden="true" preserveAspectRatio="xMaxYMid meet">
          <path
            pathLength="1"
            d="M0 48 H130 L146 40 L162 48 H215 L232 8 L254 82 L274 34 L286 48 H370 L384 42 L398 48 H450 L466 10 L488 80 L506 38 L518 48 H600"
          />
        </svg>
      </div>
    </header>
  );
}