import { useEffect, useState } from "react";
import { api } from "../api.js";
import { todayStr } from "../dates.js";
import { colorVars } from "../specialty.js";

const EMPTY = {
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  doctor: "",
  date: "",
  time: "",
  reason: "",
  notes: "",
};

export default function AppointmentForm({ doctors, editing, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fill the form when an appointment is picked for editing
  useEffect(() => {
    if (editing) {
      setForm({
        patientName: editing.patientName,
        patientEmail: editing.patientEmail,
        patientPhone: editing.patientPhone,
        doctor: editing.doctor?._id || "",
        date: editing.date,
        time: editing.time,
        reason: editing.reason,
        notes: editing.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [editing]);

  // Load free time slots whenever doctor or date changes
  useEffect(() => {
    if (!form.doctor || !form.date) {
      setSlots([]);
      return;
    }
    let ignore = false;
    api
      .getAvailability({ doctor: form.doctor, date: form.date, excludeId: editing?._id })
      .then((data) => {
        if (!ignore) setSlots(data);
      })
      .catch((e) => !ignore && setError(e.message));
    return () => {
      ignore = true;
    };
  }, [form.doctor, form.date, editing]);

  const change = (e) => {
    const { name, value } = e.target;
    // Changing doctor or date clears the chosen time, because slots differ
    setForm((f) => ({ ...f, [name]: value, ...(name === "doctor" || name === "date" ? { time: "" } : {}) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const saved = editing
        ? await api.updateAppointment(editing._id, form)
        : await api.createAppointment(form);
      setForm(EMPTY);
      setSlots([]);
      onSaved(saved, !!editing);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // The sheet takes on the colour of the chosen doctor's specialty
  const chosen = doctors.find((d) => d._id === form.doctor);
  const accent = chosen ? colorVars(chosen.specialization) : undefined;

  return (
    <form className="sheet" onSubmit={submit} noValidate style={accent}>
      <div className="sheet-head">
        <h2>{editing ? "Edit appointment" : "Book an appointment"}</h2>
        <p>{chosen ? `${chosen.name}, ${chosen.specialization}` : "Choose a doctor to get started."}</p>
      </div>

      <div className="sheet-body">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <fieldset>
          <legend>Patient</legend>
          <div className="stack">
            <label>
              Full name
              <input name="patientName" value={form.patientName} onChange={change} autoComplete="off" />
            </label>
            <div className="row">
              <label>
                Email
                <input type="email" name="patientEmail" value={form.patientEmail} onChange={change} />
              </label>
              <label>
                Phone
                <input name="patientPhone" value={form.patientPhone} onChange={change} />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Visit</legend>
          <div className="stack">
            <label>
              Doctor
              <select name="doctor" value={form.doctor} onChange={change}>
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}, {d.specialization}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input type="date" name="date" min={todayStr()} value={form.date} onChange={change} />
            </label>

            <div role="group" aria-labelledby="time-label">
              <span id="time-label" className="field-label">
                Time
              </span>
              {slots.length ? (
                <div className="slots">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      className={`slot${form.time === s.time ? " selected" : ""}`}
                      disabled={!s.available}
                      aria-pressed={form.time === s.time}
                      onClick={() => setForm((f) => ({ ...f, time: s.time }))}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hint">Choose a doctor and a date to see open times.</p>
              )}
            </div>

            <label>
              Reason for visit
              <input name="reason" value={form.reason} onChange={change} maxLength={300} />
            </label>
            <label>
              Notes (optional)
              <textarea name="notes" rows={2} value={form.notes} onChange={change} maxLength={500} />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Book appointment"}
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
              Cancel editing
            </button>
          )}
        </div>
      </div>
    </form>
  );
}