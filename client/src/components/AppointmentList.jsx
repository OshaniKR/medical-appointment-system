import { colorVars, initials } from "../specialty.js";
import { formatDate } from "../dates.js";

const STATUS_LABEL = { scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };

export default function AppointmentList({ appointments, loading, hasFilters, onEdit, onStatus, onDelete }) {
  if (loading && appointments.length === 0) return <p className="hint">Loading appointments…</p>;

  if (appointments.length === 0) {
    return (
      <div className="empty">
        <strong>{hasFilters ? "Nothing matches these filters" : "No appointments yet"}</strong>
        <p>
          {hasFilters
            ? "Clear the filters to see every appointment."
            : "Fill in the booking sheet to add the first one."}
        </p>
      </div>
    );
  }

  return (
    <ul className="slips">
      {appointments.map((a) => (
        <li key={a._id} className={`slip status-${a.status}`} style={colorVars(a.doctor?.specialization)}>
          <div className="slip-stub">
            <span className="slip-time">{a.time}</span>
            <span className="slip-date">{formatDate(a.date)}</span>
          </div>

          <div className="slip-body">
            <div className="slip-top">
              <div className="doc">
                <span className="avatar" aria-hidden="true">
                  {a.doctor ? initials(a.doctor.name) : "?"}
                </span>
                <div>
                  <strong>{a.doctor ? a.doctor.name : "Doctor removed"}</strong>
                  {a.doctor && <span className="spec">{a.doctor.specialization}</span>}
                </div>
              </div>
              <span className={`stamp stamp-${a.status}`}>{STATUS_LABEL[a.status]}</span>
            </div>

            <h3>{a.patientName}</h3>
            <p className="reason">{a.reason}</p>
            <p className="contact">
              <span>{a.patientEmail}</span>
              <span>{a.patientPhone}</span>
            </p>
            {a.notes && <p className="note">Notes: {a.notes}</p>}

            <div className="slip-actions">
              <button className="btn btn-small" onClick={() => onEdit(a)}>
                Edit
              </button>
              {a.status === "scheduled" && (
                <>
                  <button className="btn btn-small" onClick={() => onStatus(a, "completed")}>
                    Mark completed
                  </button>
                  <button className="btn btn-small btn-warn" onClick={() => onStatus(a, "cancelled")}>
                    Cancel
                  </button>
                </>
              )}
              {a.status === "cancelled" && (
                <button className="btn btn-small" onClick={() => onStatus(a, "scheduled")}>
                  Re-schedule
                </button>
              )}
              <button className="btn btn-small btn-danger" onClick={() => onDelete(a)}>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}