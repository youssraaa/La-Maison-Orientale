import { useMemo, useState } from "react";
import {
  DATE_HORIZON_DAYS,
  isoDateLocal,
  isClosedDay,
} from "../utils/reservationAvailability";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function monthLabel(date) {
  return date.toLocaleDateString("fr-BE", { month: "long", year: "numeric" });
}

function buildMonthCells(monthDate, todayIso, maxIso, selectedIso) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first: JS Sunday=0 → shift so Monday=0
  const startOffset = (first.getDay() + 6) % 7;

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - (startOffset - i));
    cells.push({
      key: `pad-${isoDateLocal(d)}`,
      day: d.getDate(),
      iso: isoDateLocal(d),
      outside: true,
      disabled: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const iso = isoDateLocal(d);
    const closed = isClosedDay(iso);
    const past = iso < todayIso;
    const beyond = iso > maxIso;
    cells.push({
      key: iso,
      day,
      iso,
      outside: false,
      closed,
      disabled: past || closed || beyond,
      selected: iso === selectedIso,
      today: iso === todayIso,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const d = new Date(`${last.iso}T12:00:00`);
    d.setDate(d.getDate() + 1);
    cells.push({
      key: `pad-${isoDateLocal(d)}`,
      day: d.getDate(),
      iso: isoDateLocal(d),
      outside: true,
      disabled: true,
    });
  }

  return cells;
}

function MonthGrid({ monthDate, todayIso, maxIso, selectedIso, onSelect }) {
  const cells = useMemo(
    () => buildMonthCells(monthDate, todayIso, maxIso, selectedIso),
    [monthDate, todayIso, maxIso, selectedIso]
  );

  return (
    <div className="reservation-cal__month">
      <h3 className="reservation-cal__month-title">{monthLabel(monthDate)}</h3>
      <div className="reservation-cal__weekdays" aria-hidden="true">
        {WEEKDAYS.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
      <div className="reservation-cal__grid" role="grid" aria-label={monthLabel(monthDate)}>
        {cells.map((cell) => (
          <button
            key={cell.key}
            type="button"
            role="gridcell"
            disabled={cell.disabled}
            aria-selected={cell.selected}
            aria-label={
              cell.outside
                ? undefined
                : cell.closed
                  ? `${cell.iso}, fermé`
                  : cell.iso
            }
            className={[
              "reservation-cal__day",
              cell.outside ? "is-outside" : "",
              cell.closed && !cell.outside ? "is-closed" : "",
              cell.selected ? "is-selected" : "",
              cell.today && !cell.selected ? "is-today" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (!cell.disabled && !cell.outside) onSelect(cell.iso);
            }}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReservationDateCalendar({ value, onChange }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);
  const todayIso = isoDateLocal(today);
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + DATE_HORIZON_DAYS - 1);
    return d;
  }, [today]);
  const maxIso = isoDateLocal(maxDate);

  const minMonth = startOfMonth(today);
  const maxMonth = startOfMonth(maxDate);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(value ? new Date(`${value}T12:00:00`) : today)
  );

  const canPrev = viewMonth > minMonth;
  const canNext = addMonths(viewMonth, 1) <= maxMonth;

  function goPrev() {
    if (!canPrev) return;
    setViewMonth((m) => addMonths(m, -1));
  }

  function goNext() {
    if (!canNext) return;
    setViewMonth((m) => addMonths(m, 1));
  }

  return (
    <div className="reservation-cal" role="dialog" aria-label="Choisir une date">
      <div className="reservation-cal__nav">
        <button
          type="button"
          className="reservation-cal__nav-btn"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <button
          type="button"
          className="reservation-cal__nav-btn"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="reservation-cal__months">
        <MonthGrid
          monthDate={viewMonth}
          todayIso={todayIso}
          maxIso={maxIso}
          selectedIso={value}
          onSelect={onChange}
        />
        <MonthGrid
          monthDate={addMonths(viewMonth, 1)}
          todayIso={todayIso}
          maxIso={maxIso}
          selectedIso={value}
          onSelect={onChange}
        />
      </div>
    </div>
  );
}
