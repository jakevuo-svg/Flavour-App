import { useState } from 'react';
import S from '../../styles/theme';
import { supabase } from '../../services/supabaseClient';

// Helper to download a blob
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Collect all attachment URLs from events and locations
const collectAttachmentUrls = (events, locations) => {
  const files = [];
  (events || []).forEach(e => {
    (e.menuAttachments || []).forEach(att => {
      if (att.publicUrl || att.url) {
        files.push({ url: att.publicUrl || att.url, folder: `events/${e.id}/menu`, name: att.name || att.path?.split('/').pop() || 'file' });
      }
    });
    (e.orderAttachments || []).forEach(att => {
      if (att.publicUrl || att.url) {
        files.push({ url: att.publicUrl || att.url, folder: `events/${e.id}/orders`, name: att.name || att.path?.split('/').pop() || 'file' });
      }
    });
  });
  (locations || []).forEach(loc => {
    if (loc.logo_url) {
      files.push({ url: loc.logo_url, folder: `locations/${loc.id}`, name: `logo.${loc.logo_url.split('.').pop()?.split('?')[0] || 'png'}` });
    }
    (loc.files || []).forEach(f => {
      if (f.publicUrl || f.url) {
        files.push({ url: f.publicUrl || f.url, folder: `locations/${loc.id}/files`, name: f.name || f.path?.split('/').pop() || 'file' });
      }
    });
  });
  return files;
};

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(''); // which button is active
  const [progress, setProgress] = useState('');
  const [lastExport, setLastExport] = useState(null);
  const [error, setError] = useState('');

  // Fetch all database data
  const fetchAllData = async () => {
    const [eventsRes, personsRes, notesRes, tasksRes, locationsRes, assignmentsRes] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('persons').select('*').order('first_name'),
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*').order('name'),
      supabase.from('event_assignments').select('*'),
    ]);
    const errors = [eventsRes, personsRes, notesRes, tasksRes, locationsRes, assignmentsRes]
      .filter(r => r.error).map(r => r.error.message);
    if (errors.length > 0) throw new Error(errors.join(', '));
    return {
      events: eventsRes.data || [],
      persons: personsRes.data || [],
      notes: notesRes.data || [],
      tasks: tasksRes.data || [],
      locations: locationsRes.data || [],
      event_assignments: assignmentsRes.data || [],
    };
  };

  // JSON export (database only)
  const exportJSON = async () => {
    setExporting(true);
    setExportType('json');
    setError('');
    setProgress('Haetaan dataa...');
    try {
      const data = await fetchAllData();
      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: 'Typedwn CRM',
          version: '1.0',
          counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
        },
        ...data,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const date = new Date().toISOString().split('T')[0];
      const filename = `typedwn-backup-${date}.json`;
      downloadBlob(blob, filename);

      setLastExport({ date: new Date().toLocaleString('fi-FI'), filename, counts: exportData.metadata.counts });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message || 'Export epäonnistui');
    } finally {
      setExporting(false);
      setProgress('');
      setExportType('');
    }
  };

  // CSV export (events only)
  const exportCSV = async () => {
    setExporting(true);
    setExportType('csv');
    setError('');
    try {
      const { data: events, error: err } = await supabase
        .from('events').select('*').order('date', { ascending: false });
      if (err) throw err;

      const headers = ['name', 'date', 'end_date', 'start_time', 'end_time', 'company', 'booker', 'contact', 'location_name', 'guest_count', 'status', 'type', 'language', 'erv', 'is_archived'];
      const rows = (events || []).map(e =>
        headers.map(h => {
          const val = e[h] ?? '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const date = new Date().toISOString().split('T')[0];
      const filename = `typedwn-tapahtumat-${date}.csv`;
      downloadBlob(blob, filename);

      setLastExport({ date: new Date().toLocaleString('fi-FI'), filename, counts: { events: (events || []).length } });
    } catch (err) {
      console.error('CSV export failed:', err);
      setError(err.message || 'CSV-vienti epäonnistui');
    } finally {
      setExporting(false);
      setExportType('');
    }
  };

  // Full ZIP export with attachments
  const exportZIP = async () => {
    setExporting(true);
    setExportType('zip');
    setError('');
    setProgress('Haetaan dataa...');
    try {
      // Dynamically load JSZip from CDN
      setProgress('Ladataan ZIP-kirjastoa...');
      if (!window.JSZip) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('JSZip-kirjaston lataus epäonnistui'));
          document.head.appendChild(script);
        });
      }

      setProgress('Haetaan tietokantadataa...');
      const data = await fetchAllData();

      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: 'Typedwn CRM',
          version: '1.0',
          includes_attachments: true,
          counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
        },
        ...data,
      };

      const zip = new window.JSZip();

      // Add JSON data
      zip.file('data.json', JSON.stringify(exportData, null, 2));

      // Collect and download attachments
      const attachments = collectAttachmentUrls(data.events, data.locations);
      let downloaded = 0;
      let failed = 0;

      for (const att of attachments) {
        setProgress(`Ladataan liitteitä... (${downloaded + 1}/${attachments.length})`);
        try {
          const response = await fetch(att.url);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(`attachments/${att.folder}/${att.name}`, blob);
            downloaded++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      setProgress('Pakataan ZIP-tiedostoa...');
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });

      const date = new Date().toISOString().split('T')[0];
      const filename = `typedwn-full-backup-${date}.zip`;
      downloadBlob(zipBlob, filename);

      const totalAttachments = attachments.length;
      setLastExport({
        date: new Date().toLocaleString('fi-FI'),
        filename,
        counts: { ...exportData.metadata.counts, liitteet: `${downloaded}/${totalAttachments}` },
      });
      if (failed > 0) {
        setError(`${failed} liitetiedostoa ei voitu ladata (saattavat olla poistettuja).`);
      }
    } catch (err) {
      console.error('ZIP export failed:', err);
      setError(err.message || 'ZIP-vienti epäonnistui');
    } finally {
      setExporting(false);
      setProgress('');
      setExportType('');
    }
  };

  return (
    <div style={{ ...S.border, ...S.bg, borderTop: 'none', padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
        VARMUUSKOPIOINTI / EXPORT
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 16, lineHeight: 1.6 }}>
        Lataa kaikki data varmuuskopioksi ulkoiselle kovalevylle.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={exportZIP}
          disabled={exporting}
          style={{
            background: exporting && exportType === 'zip' ? '#333' : '#ddd',
            color: exporting && exportType === 'zip' ? '#999' : '#111',
            border: '2px solid #ddd',
            padding: '10px 20px', fontSize: 12, fontWeight: 700,
            cursor: exporting ? 'default' : 'pointer', letterSpacing: 0.5,
            opacity: exporting && exportType !== 'zip' ? 0.4 : 1,
          }}
        >
          {exporting && exportType === 'zip' ? 'LADATAAN...' : 'TÄYSI VARMUUSKOPIO (ZIP)'}
        </button>
        <button
          onClick={exportJSON}
          disabled={exporting}
          style={{ ...S.btnWire, padding: '10px 20px', fontSize: 12, opacity: exporting && exportType !== 'json' ? 0.4 : 1 }}
        >
          {exporting && exportType === 'json' ? 'LADATAAN...' : 'DATA (JSON)'}
        </button>
        <button
          onClick={exportCSV}
          disabled={exporting}
          style={{ ...S.btnWire, padding: '10px 20px', fontSize: 12, opacity: exporting && exportType !== 'csv' ? 0.4 : 1 }}
        >
          {exporting && exportType === 'csv' ? 'LADATAAN...' : 'TAPAHTUMAT (CSV)'}
        </button>
      </div>

      <div style={{ fontSize: 10, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>
        <strong style={{ color: '#888' }}>ZIP</strong> = kaikki data + liitetiedostot (menu, tilaukset, logot) yhdessä paketissa<br />
        <strong style={{ color: '#888' }}>JSON</strong> = tietokantadata ilman liitteitä<br />
        <strong style={{ color: '#888' }}>CSV</strong> = tapahtumat taulukkomuodossa (Excel)
      </div>

      {progress && (
        <div style={{ fontSize: 12, color: '#4a9', marginBottom: 12, padding: '8px 12px', background: '#112a1a', border: '1px solid #1c4a2c' }}>
          {progress}
        </div>
      )}

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
