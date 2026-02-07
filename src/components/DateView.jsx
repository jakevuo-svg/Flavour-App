import { useState } from 'react';
import S from '../styles/theme';

const FINNISH_MONTHS = [
  'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
  'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
];

const DateView = ({ events = [], onEventClick, onAddEvent }) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const getEventsForDay = (year, month, day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday-first
  };

  const getEventCountForDay = (year, month, day) => getEventsForDay(year, month, day).length;

  const handleMonthClick = (monthIndex) => {
    setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex);
    setSelectedDay(null);
  };

  const handleDayClick = (monthIndex, day) => {
    setSelectedDay(
      selectedDay?.month === monthIndex && selectedDay?.day === day
        ? null
        : { month: monthIndex, day }
    );
  };

  const handleAddEvent = (monthIndex, day) => {
    const dateStr = new Date(selectedYear, monthIndex, day).toISOString().split('T')[0];
    onAddEvent?.({ date: dateStr });
  };

  const selectedDayEvents = selectedDay
    ? getEventsForDay(selectedYear, selectedDay.month, selectedDay.day)
    : [];

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: "none", padding: 20 }}>
      {/* Year selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...S.label, marginBottom: 10 }}>VALITSE VUOSI:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[2026, 2027, 2028].map(year => (
            <button
              key={year}
              onClick={() => { setSelectedYear(year); setExpandedMonth(null); setSelectedDay(null); }}
              style={selectedYear === year ? S.btnBlack : S.btnWire}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month grid — 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {FINNISH_MONTHS.map((monthName, monthIndex) => (
          <div
            key={monthIndex}
            onClick={() => handleMonthClick(monthIndex)}
            style={{
              border: expandedMonth === monthIndex ? '2px solid #ddd' : '2px solid #444',
              background: expandedMonth === monthIndex ? '#2a2a2a' : '#1e1e1e',
              padding: 15,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {monthName}
            </div>
            <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{selectedYear}</div>
          </div>
        ))}
      </div>

      {/* Expanded month — FULL WIDTH below grid */}
      {expandedMonth !== null && (
        <div style={{ border: '2px solid #ddd', borderTop: 'none', background: '#1e1e1e', padding: 20 }}>
          <div style={{ ...S.label, marginBottom: 12 }}>
            {FINNISH_MONTHS[expandedMonth]} {selectedYear}
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#666', padding: 6, letterSpacing: 1 }}>
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {Array.from({ length: getFirstDayOfMonth(selectedYear, expandedMonth) }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: getDaysInMonth(selectedYear, expandedMonth) }).map((_, i) => {
              const day = i + 1;
              const eventCount = getEventCountForDay(selectedYear, expandedMonth, day);
              const isSelected = selectedDay?.month === expandedMonth && selectedDay?.day === day;
              const isToday =
                new Date().getFullYear() === selectedYear &&
                new Date().getMonth() === expandedMonth &&
                new Date().getDate() === day;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(expandedMonth, day)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    background: isSelected ? '#333' : isToday ? '#2a2a2a' : 'transparent',
                    border: isSelected ? '2px solid #ddd' : '1px solid #333',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: eventCount > 0 ? 700 : 400,
                    minHeight: 36,
                  }}
                >
                  <span>{day}</span>
                  {eventCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 3,
                      background: '#ddd', color: '#111',
                      width: 14, height: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700,
                    }}>
                      {eventCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && selectedDay.month === expandedMonth && (
            <div style={{ marginTop: 20, borderTop: '2px solid #ddd', paddingTop: 16 }}>
              <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {FINNISH_MONTHS[selectedDay.month]} {selectedDay.day}., {selectedYear}
                </div>
                <button onClick={() => handleAddEvent(selectedDay.month, selectedDay.day)} style={S.btnSmall}>
                  + LISÄÄ TAPAHTUMA
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div style={{ color: '#666', fontSize: 12 }}>Ei tapahtumia tälle päivälle</div>
              ) : (
                selectedDayEvents.map(event => (
                  <div key={event.id} onClick={() => onEventClick?.(event)} style={S.row}>
                    <span style={{ ...S.col(2), fontWeight: 600 }}>{event.name}</span>
                    <span style={S.col(1)}>{event.start_time || ''}</span>
                    <span style={S.col(1)}>{event.location_name || ''}</span>
                    <span style={S.col(1)}>{event.guest_count || ''} hlö</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateView;
