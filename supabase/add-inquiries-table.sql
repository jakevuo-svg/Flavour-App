-- Inquiries / Tiedustelut lead management table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact info
  contact_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',

  -- Inquiry details
  requested_date TEXT DEFAULT '',
  description TEXT DEFAULT '',
  guest_count INTEGER,
  source TEXT DEFAULT 'MANUAALINEN',  -- MANUAALINEN, LOMAKE, SÄHKÖPOSTI

  -- Sales pipeline
  status TEXT DEFAULT 'UUSI',  -- UUSI, VASTATTU, TARJOTTU, VAHVISTETTU, LASKUTETTU, MAKSETTU, HÄVITTY
  offered TEXT DEFAULT '',
  price NUMERIC,
  invoice_number TEXT DEFAULT '',
  invoiced_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  outcome TEXT DEFAULT '',
  notes TEXT DEFAULT '',

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_name TEXT DEFAULT '',

  -- Link to event when converted
  event_id UUID REFERENCES events(id),

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_received_at ON inquiries(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_event_id ON inquiries(event_id);

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage inquiries"
  ON inquiries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
