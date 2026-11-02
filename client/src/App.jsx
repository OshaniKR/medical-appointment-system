import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import { todayStr } from "./dates.js";
import Header from "./components/Header.jsx";
import AppointmentForm from "./components/AppointmentForm.jsx";
import AppointmentList from "./components/AppointmentList.jsx";
import FilterBar from "./components/FilterBar.jsx";

const STATUS_TOAST = {
  scheduled: "Appointment re-scheduled",
  completed: "Marked as completed",
  cancelled: "Appointment cancelled",
};

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [todayCount, setTodayCount] = useState(null);
  const [filters, setFilters] = useState({ q: "", date: "", status: "", doctor: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    api.getDoctors().then(setDoctors).catch((e) => setError(e.message));
  }, []);

  // Status is filtered on the client, so the status tabs can show counts for every status
  const { q, date, doctor } = filters;
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, today] = await Promise.all([
        api.getAppointments({ q, date, doctor }),
        api.getAppointments({ date: todayStr(), status: "scheduled" }),
      ]);
      setAppointments(list);
      setTodayCount(today.length);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, date, doctor]);

  // Small debounce so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleSaved = (appt, wasEdit) => {
    setEditing(null);
    showToast(wasEdit ? "Changes saved" : "Appointment booked");
    load();
  };

  const handleStatus = async (appt, status) => {
    try {
      await api.updateStatus(appt._id, status);
      showToast(STATUS_TOAST[status]);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (appt) => {
    if (!window.confirm(`Delete the appointment for ${appt.patientName}? This cannot be undone.`)) return;
    try {
      await api.deleteAppointment(appt._id);
      if (editing?._id === appt._id) setEditing(null);
      showToast("Appointment deleted");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const counts = {
    all: appointments.length,
    scheduled: appointments.filter((a) => a.status === "scheduled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };
  const visible = filters.status ? appointments.filter((a) => a.status === filters.status) : appointments;
  const hasFilters = !!(filters.q || filters.date || filters.doctor || filters.status);

  return (
    <>
      <Header todayCount={todayCount} />

      <div className="container">
        {error && (
          <div className="alert alert-error page-alert" role="alert">
            {error}
          </div>
        )}

        <main className="layout">
          <section aria-label="Booking sheet">
            <AppointmentForm
              doctors={doctors}
              editing={editing}
              onSaved={handleSaved}
              onCancelEdit={() => setEditing(null)}
            />
          </section>

          <section aria-label="Appointments">
            <h2 className="list-title">Appointments</h2>
            <FilterBar filters={filters} setFilters={setFilters} doctors={doctors} counts={counts} />
            <AppointmentList
              appointments={visible}
              loading={loading}
              hasFilters={hasFilters}
              onEdit={(a) => {
                setEditing(a);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onStatus={handleStatus}
              onDelete={handleDelete}
            />
          </section>
        </main>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}