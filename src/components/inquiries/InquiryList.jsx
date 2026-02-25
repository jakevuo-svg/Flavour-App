import { useState } from 'react';
import S from '../../styles/theme';
import { INQUIRY_STATUSES, INQUIRY_STATUS_COLORS } from '../../hooks/useInquiries';

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getDate()}.${dt.getMonth() + 1}.`;
};

export default function InquiryList({ inquiries, onInquiryClick, onAddClick, searchQuery }) {
  const [statusFilter, setStatusFilter] = useState('');

  const searchFiltered = (inquiries || []).filter((inq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inq.contact_name?.toLowerCase().includes(q)) ||
      (inq.company?.toLowerCase().includes(q)) ||
      (inq.email?.toLowerCase().includes(q)) ||
      (inq.description?.toLowerCase().includes(q)) ||
      (inq.notes?.toLowerCase().includes(q))
    );
  });

  const filtered = searchFiltered.filter((inq) => {
    if (!statusFilter) return true;
    return inq.status === statusFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.received_at || 0).getTime();
    const dateB = new Date(b.received_at || 0).getTime();
    return dateB - dateA;
  });

  const totalCount = searchFiltered.length;
  const counts = {
    UUSI: searchFiltered.filter((i) => i.status === 'UUSI').length,
    VASTATTU: searchFiltered.filter((i) => i.status === 'VASTATTU').length,
    TARJOTTU: searchFiltered.filter((i) => i.status === 'TARJOTTU').length,
    VAHVISTETTU: searchFiltered.filter((i) => i.status === 'VAHVISTETTU').length,
  };
  const pipelineTotal = searchFiltered
    .filter((i) => i.status !== 'HÄVITTY')
    .reduce((sum, i) => sum + (i.price || 0), 0);

  const statusBadge = (status) => ({
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 10,
    fontWeight: 700,
    background: (INQUIRY_STATUS_COLORS[status] || '#666') + '22',
    color: INQUIRY_STATUS_COLORS[status] || '#666',
    border: `1px solid ${INQUIRY_STATUS_COLORS[status] || '#666'}`,
  });

  return (
    <div>
      {/* Status Filter */}
      <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
        <div style={{ ...S.pad, display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #333' }}>
          <span
            onClick={() => setStatusFilter('')}
            style={{ ...S.tag(!statusFilter), cursor: 'pointer', fontSize: 10 }}
          >
            KAIKKI ({totalCount})
          </span>
          {INQUIRY_STATUSES.map((st) => (
            <span
              key={st}
              onClick={() => setStatusFilter(statusFilter === st ? '' : st)}
              style={{
                ...statusBadge(st),
                cursor: 'pointer',
                opacity: statusFilter && statusFilter !== st ? 0.4 : 1,
              }}
            >
              {st} {counts[st] !== undefined ? `(${counts[st]})` : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {[
            { label: 'UUSI', val: counts.UUSI, color: INQUIRY_STATUS_COLORS.UUSI },
            { label: 'VASTATTU', val: counts.VASTATTU, color: INQUIRY_STATUS_COLORS.VASTATTU },
            { label: 'TARJOTTU', val: counts.TARJOTTU, color: INQUIRY_STATUS_COLORS.TARJOTTU },
            { label: 'VAHVISTETTU', val: counts.VAHVISTETTU, color: INQUIRY_STATUS_COLORS.VAHVISTETTU },
            { label: 'PIPELINE', val: `${pipelineTotal.toLocaleString('fi-FI')} €`, color: '#ddd' },
          ].map((s) => (
            <div key={s.label} style={{ flex: '1 1 60px', textAlign: 'center', padding: '10px 4px', borderRight: '1px solid #333', borderBottom: '1px solid #333' }}>
              <div style={{ fontSize: 9, color: '#888', fontWeight: 700, letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <div style={{ ...S.border, ...S.bg, borderTop: 'none', ...S.pad }}>
        <button onClick={onAddClick} style={{ ...S.btnBlack, width: '100%' }}>+ UUSI TIEDUSTELU</button>
      </div>

      {/* Inquiry Rows */}
      <div style={{ ...S.border, ...S.bg, borderTop: 'none' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 12 }}>Ei tiedusteluja</div>
        ) : (
          sorted.map((inq) => {
            const today = new Date(); today.setHours(0,0,0,0);
            const hasDeadline = inq.respond_by && !['VASTATTU','TARJOTTU','VAHVISTETTU','LASKUTETTU','MAKSETTU','HÄVITTY'].includes(inq.status);
            const deadline = hasDeadline ? new Date(inq.respond_by) : null;
            if (deadline) deadline.setHours(0,0,0,0);
            const isOverdue = deadline && deadline < today;
            const isDueToday = deadline && deadline.getTime() === today.getTime();

            return (
              <div
                key={inq.id}
                onClick={() => onInquiryClick(inq)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #333',
                  cursor: 'pointer',
                  background: isOverdue ? '#1a0a0a' : 'transparent',
                }}
              >
                {/* Row 1: Name + Status + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inq.contact_name || inq.company || 'Nimetön'}
                    </span>
                    <span style={statusBadge(inq.status)}>{inq.status}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{fmtDate(inq.received_at)}</span>
                </div>

                {/* Row 2: Company + Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {inq.company && inq.contact_name && (
                      <span style={{ fontSize: 11, color: '#888' }}>{inq.company}</span>
                    )}
                    {inq.guest_count && (
                      <span style={{ fontSize: 10, color: '#999' }}>{inq.guest_count} hlö</span>
                    )}
                    {inq.location_name && (
                      <span style={{ fontSize: 10, color: '#999' }}>{inq.location_name}</span>
                    )}
                    {inq.assigned_name && (
                      <span style={{ fontSize: 10, color: '#999' }}>→ {inq.assigned_name}</span>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {inq.price ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>{inq.price.toLocaleString('fi-FI')} €</span>
                    ) : null}
                  </div>
                </div>

                {/* Row 3: Deadline warning */}
                {(isOverdue || isDueToday) && (
                  <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: isOverdue ? '#ff6666' : '#ffaa44' }}>
                    {isOverdue ? '! VASTAUS MYÖHÄSSÄ' : '! VASTAA TÄNÄÄN'} — {fmtDate(inq.respond_by)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
