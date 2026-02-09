-- Seed Flavour Ventures locations (Teurastamo, Helsinki)
-- Run in Supabase SQL Editor

-- First check what exists
SELECT name FROM locations;

-- Insert locations (skip if name already exists)
INSERT INTO locations (name, type, capacity, address, description, contact_person, contact_email, contact_phone, equipment, tech_specs, kitchen_equipment, notes, created_at, modified_at)
VALUES
  ('BLACK BOX 360', 'Tapahtumatila', 200,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Monikäyttöinen tapahtumatila 360° projisoinneilla. Immerse-kokemukset ja gaala-illalliset.',
   'Kassu Noronen', 'kassu@flavour.fi', '+358 40 123 4567',
   'Pöydät: 20 kpl pyöreä (8hlö), 10 kpl pitkä (12hlö). Tuolit: 200 kpl. Baaritiskit: 2 kpl. Naulakot: 3 kpl.',
   '360° projektori (4x 4K laser). PA-järjestelmä (JBL PRX). Langaton mikrofoni x4. Valaistus: DMX-ohjattu.',
   'Lämmityskeittiö. Lämpöhauteet x4. Kylmätilat. Astianpesukone (teollisuus).',
   'Lastauslaituri takapihalla. Avaimet Kassulta. Hälytys pois klo 07 jälkeen automaattisesti.',
   now(), now()),

  ('KELLOHALLI', 'Tapahtumatila', 300,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Historiallinen kellohalli Teurastamolla. Korkea katto, teollinen tunnelma. Illalliset, juhlat ja yritystapahtumat.',
   'Kassu Noronen', 'kassu@flavour.fi', '+358 40 123 4567',
   'Pitkät pöydät: 15 kpl (á 10 hlö). Pyöreät pöydät: 25 kpl (á 8 hlö). Tuolit: 300 kpl. Lava (koottava): 4m x 3m.',
   'Projektorit: 2x. PA: QSC K12.2 x4 + sub. Langaton mikrofoni x2. Spottivalot: 8 kpl.',
   'Täysi ammattikeittiö viereisessä tilassa. Uuni x3 (Rational). Induktio x8. Kylmähuone + pakastin.',
   'Kellohallin lattia herkkä — ei teippiä suoraan! Käytä suojalevyjä raskaalle kalustolle.',
   now(), now()),

  ('FLAVOUR STUDIO', 'Kokkauskoulu', 50,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Kokkauskoulu ja studio. Tiimikokkausta, workshopeja ja tuotekehitystä. 4 kokkauspisteettä.',
   'Milla Kokkonen', 'milla@flavour.fi', '+358 40 234 5678',
   'Kokkauspisteeet: 4 kpl (á 10-12 hlö). Näyttöruutu jokaisella pisteellä. Istumapaikkoja: 50.',
   'Näytöt: 4x 55". Pääruutu: 75". Kamera: overhead. Mikrofoni: langaton headset x2.',
   'Induktioliesi x8 (2/piste). Uuni x4 (1/piste). Leikkuulaudat, veitset, työvälineet (pistekohtaiset setit).',
   'Esilinat pestävä jokaisen tapahtuman jälkeen. Veitset teroitettava viikoittain.',
   now(), now()),

  ('CUISINE', 'Ravintola', 80,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Ravintola yksityistilaisuuksille ja illallisille. Intiimi tunnelma, sopii fine dining -kokemuksille.',
   'Tomi Keittiömestari', 'tomi@flavour.fi', '+358 40 345 6789',
   'Pöydät: 10 kpl (á 8 hlö). Baaritiskit: 1 kpl. Lounge-alue: sohvat + nojatuolit.',
   'Näyttö: 1x 65". PA: kompakti (taustamusiikki). Mikrofoni: 1 langaton.',
   'Täysi ravintolakeittiö. À la carte -taso. Pastakone. Sous vide x4.',
   'Max 80 hlö istuen, 100 hlö cocktail-tyyliin.',
   now(), now()),

  ('PIZZALA', 'Ravintola', 60,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Pizzaravintola ja tapahtumatila. Rento tunnelma, sopii afterworkeille ja epämuodollisille tapahtumille.',
   'Mikko Pizzamestari', 'mikko@flavour.fi', '+358 40 456 7890',
   'Pöydät: 12 kpl. Baaritiskit: 1 kpl. Terassi: 30 paikkaa (kesäkausi).',
   'Bluetooth-kaiutin. Näyttö: 1x 50".',
   'Pizzauuni (puu). Pizzauuni (sähkö). Kylmäpöytä.',
   'Terassi auki touko-syyskuu. Pizzauunin esilämmitys 45 min.',
   now(), now()),

  ('FLAVOUR CATERING', 'Catering', 500,
   'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
   'Catering-palvelut ulkoisiin tapahtumapaikkoihin. Toimitamme ruoat, juomat ja henkilökunnan.',
   'Sanna Catering', 'sanna@flavour.fi', '+358 40 567 8901',
   'Kuljetuskalusto: pakettiauto x2. Lämpöboksit: 20 kpl. Kylmälaukut: 15 kpl. Chafing dish: 30 kpl.',
   '',
   'Valmistuskeittiö Teurastamolla. Kapasiteetti: 500 annosta/päivä.',
   'Tilaukset vähintään 5 arkipäivää etukäteen. Minimitilaus 20 hlö.',
   now(), now())

ON CONFLICT DO NOTHING;

-- Verify
SELECT name, type, capacity FROM locations ORDER BY name;
