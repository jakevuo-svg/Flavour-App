-- ============================================================================
-- Typedwn Seed Data: With Secure Corporate Party 11.2.2026
-- Run in Supabase SQL Editor
-- ============================================================================

-- Clear all existing data (order matters for foreign keys)
DELETE FROM event_assignments;
DELETE FROM event_tasks;
DELETE FROM notes;
DELETE FROM location_files;
DELETE FROM event_files;
DELETE FROM activity_log;
DELETE FROM events;
DELETE FROM persons;
DELETE FROM locations;

-- ============================================================================
-- 1. LOCATION: Kellohalli / Teurastamo
-- ============================================================================

INSERT INTO locations (id, name, address, description, capacity, "contactPerson", "contactEmail", notes)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Kellohalli',
  'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
  'Tapahtumatila Teurastamolla. Kellohalli + Club-tila.',
  300,
  'Stina',
  '',
  'Kellohalli päätila + Club-alue baareineen. B-side käytettävissä tarvittaessa.'
);

-- ============================================================================
-- 2. PERSONS: Workers & Contacts
-- ============================================================================

-- Front of House staff
INSERT INTO persons (id, first_name, last_name, email, phone, role, type, company, notes, created_by) VALUES
('b1000000-0000-0000-0000-000000000001', 'Karina', '', '', '', 'Vuoropäällikkö', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 17:00-23:00', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000002', 'Sami', '', '', '', 'Baarimestari', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 15:00-01:00 / Bar 1', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000003', 'Hippi', '', '', '', 'Baarimestari', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 15:30-23:30 / Bar 1 + bar back', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000004', 'Carlo', '', '', '', 'Baarimestari', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 15:00-00:00 / Bar 2', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000005', 'Tiia', '', '', '', 'Bar back', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 15:00-01:00 / Bar back + blocking', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000006', 'Anni', '', '', '', 'Tarjoilija', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 17:00-22:00 / Ruokapisteet + blocking', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000007', 'Heidi', '', '', '', 'Yleismies', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 17:00-21:00 / Apukäsi / 2. host', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000008', 'Moona', '', '', '', 'Baarimestari', 'Yhteistyökumppani', 'Flavour Ventures', 'Vuoro 17:00-22:00/22:30 / Bar 1', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Kitchen staff
('b1000000-0000-0000-0000-000000000009', 'Riko', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', 'Ruokapiste', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000010', 'Maki', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', 'Ruokapiste', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000011', 'Forkan', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', 'Ruokapiste', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000012', 'Luka', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', '', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000013', 'Kristian', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', 'Flavors?', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000014', 'Kassu', '', '', '', 'Kokki', 'Yhteistyökumppani', 'Flavour Ventures', 'Juoksupoika / yleistuki', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Coat check
('b1000000-0000-0000-0000-000000000015', 'Jocke', '', '', '', 'Narikka', 'Yhteistyökumppani', '', 'Ovi', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000016', 'Raimo', '', '', '', 'Narikka', 'Yhteistyökumppani', '', 'Narikka', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000017', 'Miikka', '', '', '', 'Narikka', 'Yhteistyökumppani', '', 'Narikka (?)', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000018', 'Schener', '', '', '', 'Narikka', 'Yhteistyökumppani', '', 'Hymyilevä tervehtijä / alueen blokkaus', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Sales / Management
('b1000000-0000-0000-0000-000000000019', 'Stina', '', '', '', 'Myynti', 'Yhteistyökumppani', 'Flavour Ventures', 'Tilauksen täyttäjä / myynti', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('b1000000-0000-0000-0000-000000000020', 'Matti', '', '', '', 'Tekniikka', 'Yhteistyökumppani', 'Flavour Ventures', 'Tekninen lista / juomalista', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Entertainment
('b1000000-0000-0000-0000-000000000021', 'Timo', 'Koivupelto', '', '', 'Esiintyjä', 'Yhteistyökumppani', '', 'Iltabändi', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Client contact
('b1000000-0000-0000-0000-000000000022', 'With Secure', '', '', '', 'Tilaaja', 'Asiakas', 'With Secure', 'Pikkujoulut & kickoff -tilaisuus', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- ============================================================================
-- 3. EVENT: With Secure Corporate Party
-- ============================================================================

INSERT INTO events (
  id, name, type, date, start_time, end_time,
  location_id, location_name, guest_count, status,
  company, "clientName", contact,
  notes, "attentionNotes", "orderNotes",
  workers, "notesList",
  created_by
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'With Secure Pikkujoulut & Kickoff',
  'Yritysjuhlat',
  '2026-02-11',
  '17:30',
  '00:00',
  'a1000000-0000-0000-0000-000000000001',
  'Kellohalli',
  250,
  'CONFIRMED',
  'With Secure',
  'With Secure',
  'With Secure',
  'With Securen yritysjuhlat rock-teemalla. Kellohalli + Club. 250 vierasta. Ruokapisteet, 2 baaria, live-musiikki.',
  E'RUOKA-AINEALLERGIAT (23+ rajoitusta):\n- 23 kasvisruoka\n- 4 gluteeniton\n- 5x pähkinäallergia\n- Äyriäisallergia\n- Palkokasviallergia\n- Selleri/sellerijallergia\n- Maapähkinä + omenankuori-allergia\n- Laktoositon\n- Useita monimutkaisia allergioita (ks. tilauslomake)\n\nNARIKKA: 4 hlö (asiakas hyväksynyt)\nB-SIDE käytettävissä tarvittaessa',
  E'RUOKAPISTEET (Club):\n1. Rage Against the Mala (V, G) - Kylmät nuudelit syvässä mala-kastikkeessa, tahini-mayo, kevätsipuli. ENEMMÄN KASTIKETTA KUIN KUNNIATAPAHTUMASSA.\n2. King of Rock Fried Chicken (L) - Rapea paistettu kana, salaatti, hunaja-sinappi brioche-sämpylässä.\n3. Black Sabbath Slayer Fries - Veggie Edition (L, G) - Rapeat ranskalaiset, savuinen chipotle-cheddar, punasipuli, seesami.\n4. Smells Like Teen Spirit Brownie (L, G) - Tiheä suklaabrownie. Club iso kasa + Kellohalli kahvipiste.',
  '["b1000000-0000-0000-0000-000000000001","b1000000-0000-0000-0000-000000000002","b1000000-0000-0000-0000-000000000003","b1000000-0000-0000-0000-000000000004","b1000000-0000-0000-0000-000000000005","b1000000-0000-0000-0000-000000000006","b1000000-0000-0000-0000-000000000007","b1000000-0000-0000-0000-000000000008","b1000000-0000-0000-0000-000000000009","b1000000-0000-0000-0000-000000000010","b1000000-0000-0000-0000-000000000011","b1000000-0000-0000-0000-000000000012","b1000000-0000-0000-0000-000000000013","b1000000-0000-0000-0000-000000000014","b1000000-0000-0000-0000-000000000015","b1000000-0000-0000-0000-000000000016","b1000000-0000-0000-0000-000000000017","b1000000-0000-0000-0000-000000000018"]'::jsonb,
  '[]'::jsonb,
  '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'
);

-- ============================================================================
-- 4. TASKS for the event
-- ============================================================================

INSERT INTO event_tasks (id, event_id, title, description, status, priority, created_by) VALUES
-- Prep day 10.2
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Club setup pohjapiirroksen mukaan', 'Poista 5 kevytpöytää, aseta seisomapöydät keskelle, alkumalja-pöydät 2 lasilla ja mustilla pöytäliinoilla', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Narikka-alueen järjestely', 'Järjestä narikka, siivoa vessat, täytä hygieniatarvikkeet, nimetarrat naulakkoihin', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Juomien täyttö kylmäkaappiin', 'Täytä juomat erillisen juomalistan mukaan (Matti). Toinen baari = viinibaari rajatulla valikoimalla.', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Kellohallin setup pohjapiirroksen mukaan', 'Ylimääräiset kalusteet varastoon ja takakäytävälle', 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Event day 11.2
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Ruokapisteet valmiiksi klo 15', 'Astiat, lautasliinat, aterimet. Anni vastuussa.', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Alkumaljastation klo 16:30', 'Kylmälaukut, tuotteet, avaajat. Olut, lonkero, 0% juomat - HDCO lonkero', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Tila valmis klo 17:15', 'Valot, musiikki, tunnelma. Tervehtijä ovelle. Karina vastuussa.', 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'Laske drinkkiliput illan jälkeen', 'Laske ja lähetä kuva Stinalle', 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),
('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000001', 'Sulkemistoimet', 'Roskat pois, baarien täyttö seuraavaa päivää varten', 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- ============================================================================
-- 5. NOTES for the event
-- ============================================================================

INSERT INTO notes (id, event_id, content, author, created_by) VALUES
('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
 E'AIKATAULU 11.2:\n10:00 Ovet auki / Event Garden\n17:00 Kaikki valmista\n17:30 Ovet auki\n18:30 Avaussanat (johtaja + host)\n18:30 Ruokapisteet valmiina\n18:45 Tarjoilu alkaa\n20:00 House Band (2 biisiä)\n20:20 Bändi 1. setti\n21:00 Mahdollinen ohjelma (ilmagitarakilpailu)\n21:45 Bändi 2. setti\n23:30 Valosignaali\n00:00 Tila tyhjä',
 'Stina', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
 E'TYÖVUOROT:\nKarina 17:00-23:00\nSami 15:00-01:00 / Bar 1\nHippi 15:30-23:30 / Bar 1 + bar back\nCarlo 15:00-00:00 / Bar 2\nTiia 15:00-01:00 / Bar back + blocking\nAnni 17:00-22:00 / Ruokapisteet + blocking\nHeidi 17:00-21:00 / Apukäsi / 2. host\nMoona 17:00-22:00/22:30 / Bar 1',
 'Stina', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001',
 E'ALKUMALJAT:\nAnni, Moona, Hippi jakavat. Alkumaljojen jälkeen Anni siirtyy ruokapisteille, Moona Bar 1:een.\n\nBAR 1: Hippi (bar back), Sami, Moona\nBAR 2: Carlo, Tiia (tukena)',
 'Stina', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001',
 E'KEITTIÖ:\nRiko - ruokapiste\nMaki - ruokapiste\nForkan - ruokapiste\nLuka - \nKristian - Flavors?\nKassu - Juoksupoika',
 'Stina', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');
