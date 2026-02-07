import { useState, useEffect } from 'react';
import S from '../../styles/theme';
import { DAYS, MONTHS, YEARS } from '../../utils/constants';
import { parseDateParts, formatDateParts } from '../../utils/helpers';
import Field from './Field';

export default function DatePicker({ value = '', onChange, label = 'DATE' }) {
  const [parts, setParts] = useState({ day: '', month: '', year: '' });

  useEffect(() => {
    setParts(parseDateParts(value));
  }, [value]);

  const handleChange = (field, val) => {
    const newParts = { ...parts, [field]: val };
    setParts(newParts);
    onChange(formatDateParts(newParts));
  };

  return (
    <Field label={label}>
      <div style={S.flexWrap}>
        {/* Day select */}
        <select
          value={parts.day}
          onChange={(e) => handleChange('day', e.target.value)}
          style={{
            ...S.selectFull,
            flex: 1,
            minWidth: 80,
            backgroundColor: '#1e1e1e',
            border: '2px solid #ddd'
          }}
        >
          <option value="">Day</option>
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        {/* Month select */}
        <select
          value={parts.month}
          onChange={(e) => handleChange('month', e.target.value)}
          style={{
            ...S.selectFull,
            flex: 1,
            minWidth: 120,
            backgroundColor: '#1e1e1e',
            border: '2px solid #ddd',
            marginLeft: 8
          }}
        >
          <option value="">Month</option>
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        {/* Year select */}
        <select
          value={parts.year}
          onChange={(e) => handleChange('year', e.target.value)}
          style={{
            ...S.selectFull,
            flex: 1,
            minWidth: 80,
            backgroundColor: '#1e1e1e',
            border: '2px solid #ddd',
            marginLeft: 8
          }}
        >
          <option value="">Year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}
