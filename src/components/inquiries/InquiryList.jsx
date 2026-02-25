import { useState } from 'react';
import S from '../../styles/theme';
import { INQUIRY_STATUSES, INQUIRY_STATUS_COLORS } from '../../hooks/useInquiries';

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getDate()}.${dt.getMonth() + 1}.${dt.getFullYear()}`;
};

export default function InquiryList({ inquiries, onInquiryClick, onAddClick, searchQuery }) {
  const [statusFilter, setStatusFilter] = useState('');

  // Filter by search query
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

  // Filter by status
  const filtered = searchFiltered.filter((inq) => {
    if (!statusFilter) return true;
    return inq.status === statusFilter;
  });

  // Sort by received_at descending (newest first)
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.received_at || 0).getTime();
    const dateB = new Date(b.received_at || 0).getTime();
    return dateB - dateA;
  });

  // Calculate stats
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

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 10,
    fontWeight: 700,
    background: INQUIRY_STATUS_COLORS[status] + '22',
    color: INQUIRY_STATUS_COLORS[status],
    border: `1px solid ${INQUIRY_STATUS_COLORS[status]}`,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Status Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setStatusFilter('')}
          style={{
            ...S.btnBlack,
            background: statusFilter === '' ? '#444' : '#222',
            border: statusFilter === '' ? '2px solid #aaa' : '1px solid #444',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          KAIKKI
        </button>
        {INQUIRY_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              ...statusBadgeStyle(status),
              cursor: 'pointer',
              transition: 'all 0.2s',
              background:
                statusFilter === status
                  ? INQUIRY_STATUS_COLORS[status] + '44'
                  : INQUIRY_STATUS_COLORS[status] + '22',
              border:
                statusFilter === status
                  ? `2px solid ${INQUIRY_STATUS_COLORS[status]}`
                  : `1px solid ${INQUIRY_STATUS_COLORS[status]}`,
              padding: statusFilter === status ? '2px 8px' : '2px 8px',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          padding: '12px',
          background: '#1a1a1a',
          border: '1px solid #333',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>YHTEENSÄ</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{totalCount}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>UUSI</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: INQUIRY_STATUS_COLORS.UUSI }}>
            {counts.UUSI}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>VASTATTU</div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: INQUIRY_STATUS_COLORS.VASTATTU }}
          >
            {counts.VASTATTU}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>TARJOTTU</div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: INQUIRY_STATUS_COLORS.TARJOTTU }}
          >
            {counts.TARJOTTU}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>VAHVISTETTU</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: INQUIRY_STATUS_COLORS.VAHVISTETTU,
            }}
          >
            {counts.VAHVISTETTU}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>PIPELINE €</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {pipelineTotal.toLocaleString('fi-FI')}
          </div>
        </div>
      </div>

      {/* ADD Button */}
      <div>
        <button onClick={onAddClick} style={{ ...S.btnBlack, cursor: 'pointer' }}>
          + UUSI TIEDUSTELU
        </button>
      </div>

      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          padding: '12px 8px',
          borderBottom: '1px solid #333',
          background: '#1a1a1a',
          fontWeight: 700,
          fontSize: 11,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <div style={{ flex: '0 0 60px' }}>PVM</div>
        <div style={{ flex: '0 0 120px' }}>YRITYS</div>
        <div style={{ flex: '1' }}>YHTEYSHENKILÖ</div>
        <div style={{ flex: '0 0 50px' }}>PAX</div>
        <div style={{ flex: '0 0 90px' }}>STATUS</div>
        <div style={{ flex: '0 0 80px', textAlign: 'right' }}>HINTA</div>
        <div style={{ flex: '0 0 100px' }}>VASTUUHENKILÖ</div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sorted.length > 0 ? (
          sorted.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => onInquiryClick(inquiry)}
              style={{
                display: 'flex',
                gap: '0',
                padding: '8px',
                borderBottom: '1px solid #333',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                background: '#0a0a0a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0a0a0a';
              }}
            >
              <div style={{ flex: '0 0 60px', padding: '8px', fontSize: 12 }}>
                {fmtDate(inquiry.received_at)}
              </div>
              <div style={{ flex: '0 0 120px', padding: '8px', fontSize: 12 }}>
                {inquiry.company || '-'}
              </div>
              <div style={{ flex: '1', padding: '8px', fontSize: 12 }}>
                {inquiry.contact_name || '-'}
              </div>
              <div style={{ flex: '0 0 50px', padding: '8px', fontSize: 12, textAlign: 'center' }}>
                {inquiry.guest_count || '-'}
              </div>
              <div style={{ flex: '0 0 90px', padding: '8px', fontSize: 12 }}>
                <span style={statusBadgeStyle(inquiry.status)}>{inquiry.status}</span>
              </div>
              <div style={{ flex: '0 0 80px', padding: '8px', fontSize: 12, textAlign: 'right' }}>
                {inquiry.price ? `${inquiry.price.toLocaleString('fi-FI')} €` : '-'}
              </div>
              <div style={{ flex: '0 0 100px', padding: '8px', fontSize: 12 }}>
                {inquiry.assigned_name || '-'}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: '#666',
              fontSize: 12,
            }}
          >
            Ei tiedusteluja
          </div>
        )}
      </div>
    </div>
  );
}