const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function OpsTimePicker({ value, onChange, disabled, placeholder = "—" }) {
  const [hh = "", mm = ""] = (value || "").split(":");

  function setH(e) {
    onChange(e.target.value + (mm ? ":" + mm : ":00"));
  }
  function setM(e) {
    onChange((hh || "00") + ":" + e.target.value);
  }

  if (disabled) {
    return (
      <span className="ops-timepicker ops-timepicker--disabled">
        <span className="ops-timepicker__placeholder">{value ? value.slice(0, 5) : placeholder}</span>
      </span>
    );
  }

  return (
    <span className="ops-timepicker">
      <select className="ops-timepicker__select" value={hh} onChange={setH}>
        <option value="">{placeholder}</option>
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="ops-timepicker__sep">:</span>
      <select className="ops-timepicker__select ops-timepicker__select--mm" value={mm} onChange={setM}>
        <option value="">--</option>
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </span>
  );
}

export default OpsTimePicker;
