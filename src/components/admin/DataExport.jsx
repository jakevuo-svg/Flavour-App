import { useState } from 'react';
import S from '../../styles/theme';
import { supabase } from '../../services/supabaseClient';

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [error, setError] = useState('');

  const exportAllData = async () => {
    setExporting(true);
    setError('');
    try {
      // Fetch all tables in parallel
      const [eventsRes, personsRes, notesRes, tasksRes, locationsRes, assignmentsRes] = await Promise.all([
        supabase.from('events').select('*').order('date', { ascending: false }),
        supabase.from('persons').select('*').order('first_name'),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('locations').select('*').order('name'),
        supabase.from('event_assignments').select('*'),
      ]);

      // Check for errors
      const errors = [eventsRes, personsRes, notesRes, tasksRes, locationsRes, assignmentsRes]
        .filter(r => r.error)
        .map(r => r.error.message);
      if (errors.length > 0) throw new Error(errors.join(', '));

      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: 'Typedwn CRM',
          version: '1.0',
          counts: {
            events: (eventsRes.data || []).length,
            persons: (personsRes.data || []).length,
            notes: (notesRes.data || []).length,
            tasks: (tasksRes.data || []).length,
            locations: (locationsRes.data || []).length,
            event_assignments: (assignmentsRes.data || []).length,
          },
        },
        events: eventsRes.data || [],
        persons: personsRes.data || [],
        notes: notesRes.data || [],
        tasks: tasksRes.data || [],
        locations: locationsRes.data || [],
        event_assignments: assignmentsRes.data || [],
      };

      // Create and download JSON file
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const filename = `typedwn-backup-${date}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport({
        date: new Date().toLocaleString('fi-FI'),
        filename,
        counts: exportData.metadata.counts,
      });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message || 'Export epäonnistui');
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    setError('');
    try {
      const { data: events, error: err } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      if (err) throw err;

      // Build CSV
      const headers = ['name', 'date', 'end_date', 'start_time', 'end_time', 'company', 'booker', 'contact', 'location_name', 'guest_count', 'status', 'type', 'language', 'erv', 'is_archived'];
      const rows = (events || []).map(e =>
        headers.map(h => {
          const val = e[h] ?? '';
          // Escape CSV values
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const filename = `typedwn-tapahtumat-${date}.csv`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport({
        date: new Date().toLocaleString('fi-FI'),
        filename,
        counts: { events: (events || []).length },
      });
    } catch (err) {
      console.error('CSV export failed:', err);
      setError(err.message || 'CSV-vienti epäonnistui');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none', padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
        VARMUUSKOPIOINTI / EXPORT
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 16, lineHeight: 1.6 }}>
        Lataa kaikki data JSON- tai CSV-muodossa. Tallenna tiedosto ulkoiselle kovalevylle varmuuskopioksi.
        JSON sisältää kaiken datan (tapahtumat, henkilöt, muistiinpanot, tehtävät, sijainnit).
        CSV sisältää tapahtumat taulukkomuodossa.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={exportAllData}
          disabled={exporting}
          style={{
            ...S.btnBlack,
            padding: '10px 20px',
            fontSize: 12,
            opacity: exporting ? 0.5 : 1,
          }}
        >
          {exporting ? 'LADATAAN...' : 'LATAA KAIKKI DATA (JSON)'}
        </button>
        <button
          onClick={exportCSV}
          disabled={exporting}
          style={{
            ...S.btnWire,
            padding: '10px 20px',
            fontSize: 12,
            opacity: exporting ? 0.5 : 1,
          }}
        >
          {exporting ? 'LADATAAN...' : 'LATAA TAPAHTUMAT (CSV)'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#ff4444', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: '#2a1111', border: '1px solid #4a1c1c' }}>
          {error}
        </div>
      )}

      {lastExport && (
        <div style={{ border: '1px solid #333', padding: 12, background: '#1a1a1a' }}>
          <div style={{ fontSize: 11, color: '#4a9', fontWeight: 700, marginBottom: 6 }}>
            VIIMEISIN EXPORT
          </div>
          <div style={{ fontSize: 12, color: '#ccc', marginBottom: 4 }}>
            {lastExport.filename}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            {lastExport.date}
            {lastExport.counts && (
              <span style={{ marginLeft: 10 }}>
                {Object.entries(lastExport.counts).map(([k, v]) => `${k}: ${v}`).join(' • ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
