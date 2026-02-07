import { useState, useEffect } from 'react';
import S from '../../styles/theme';
import { HALF_HOURS } from '../../utils/constants';
import { parseTimeParts, formatTimeParts } from '../../utils/helpers';
import Field from './Field';

export default function TimePicker({ value = '', onChange, label = 'TIME RANGE' }) {
  const [parts, setParts] = useState({ startH: '', startM: '', endH: '', endM: '' });

  useEffect(() => {
    if (value) {
      const { startH, startM, endH, endM } = parseTimeParts(value);
      setParts({ startH, startM, endH, endM });
    }
  }, [value]);

  const handleChange = (field, val) => {
    const newParts = { ...parts, [field]: val };
    setParts(newParts);

    // If changing start time, use the value from HALF_HOURS directly
    if (field === 'startTime') {
      const [h, m] = val.split(':');
      newParts.startH = h;
      newParts.startM = m;
    }
    // If changing end time, use the value from HALF_HOURS directly
    if (field === 'endTime') {
      const [h, m] = val.split(':');
      newParts.endH = h;
      newParts.endM = m;
    }

    onChange(formatTimeParts(newParts));
  };

  const startTimeValue = `${parts.startH}:${parts.startM}`;
  const endTimeValue = `${parts.endH}:${parts.endM}`;

  return (
    <Field label={label}>
      <div style={S.flexWrap}>
        {/* Start time select */}
        <select
          value={startTimeValue}
          onChange={(e) => handleChange('startTime', e.target.value)}
          style={{
            ...S.selectFull,
            flex: 1,
            minWidth: 100,
            backgroundColor: '#1e1e1e',
            border: '2px solid #ddd'
          }}
        >
          <option value=":">Start Time</option>
          {HALF_HOURS.map((time) => (
            <option key={`start-${time}`} value={time}>
              {time}
            </option>
          ))}
        </select>

        {/* End time select */}
        <select
          value={endTimeValue}
          onChange={(e) => handleChange('endTime', e.target.value)}
          style={{
            ...S.selectFull,
            flex: 1,
            minWidth: 100,
            backgroundColor: '#1e1e1e',
            border: '2px solid #ddd',
            marginLeft: 8
          }}
        >
          <option value=":">End Time</option>
          {HALF_HOURS.map((time) => (
            <option key={`end-${time}`} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}
