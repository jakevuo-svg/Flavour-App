-- ============================================================================
-- With Secure — Lisätiedot palaverimuistiosta
-- Aja Supabasessa JÄLKEEN seed-withsecure.sql
-- ============================================================================

-- ============================================================================
-- LISÄHENKILÖT
-- ============================================================================

-- Jonina (Arnen kautta, asiakkaan kontakti paikan päällä)
INSERT INTO persons (id, first_name, last_name, email, phone, role, type, company, notes, created_by) VALUES
('b1000000-0000-0000-0000-000000000023', 'Jonina', '', '', '', 'Tapahtumakoordinaattori', 'Yhteistyökumppani', '', 'Arnen kautta. Asiakkaan yhteyshenkilö paikan päällä. Sympaattinen, hyvä kontakti.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- DJ Dosse (illan juontaja)
('b1000000-0000-0000-0000-000000000024', 'DJ Dosse', '', '', '', 'Juontaja', 'Yhteistyökumppani', '', 'Illan juontaja. EI juonna ruokia. Ei käy läpi menua etukäteen.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Arne (Event Garden, tuottaja)
('b1000000-0000-0000-0000-000000000025', 'Arne', '', '', '', 'Tuottaja', 'Yhteistyökumppani', 'Event Garden', 'Toi eventtikeisin meille. Tekniikkavastaava. Event Garden rakentaa lavan + äänitekniikan.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Betsi (blokkari)
('b1000000-0000-0000-0000-000000000026', 'Betsi', '', '', '', 'Blokkari', 'Yhteistyökumppani', '', 'Pyydetty 11.2. klo 17:30-23:30. EI VAHVISTETTU. Ollut monessa meidän tilaisuudessa.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- ============================================================================
-- LISÄMUISTIINPANOT (palaverista)
-- ============================================================================

-- Baarilogistiikka
INSERT INTO notes (id, event_id, content, author, created_by) VALUES
('e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001',
 E'BAARILOGISTIIKKA:\n\n• 5 drinkkilippua / hlö, á 7€\n• 2 maksupäätettä, 2 baaria\n• Omalla rahalla saa ostaa lisää + koktaileja\n• Drinkkilipuilla EI koktaileja\n\nBAR 1 (pääbaari): Laaja valikoima\n- Sami, Moona, Hippi (bar back)\n\nBAR 2 (viinibaari): Rajattu valikoima\n- Carlo, Tiia tukena\n- Olvi IPA (halutaan eroon), alkoholiton vaihtoehto, viinit\n\nALKUMALJAT:\n- Olutta, lonkeroa, alkoholitonta olutta kylmälaukuissa\n- HDCO lonkero (ei katsota onko normi)\n- Asiakas toivoi EI tölkkikamaa → pullot/hanat\n- Menee drinkkilipulle\n- 3-4 henkilöä: Anni, Moona, Hippi\n- Transition: Anni → ruokapisteet, Moona → Bar 1\n\nB-SIDE: Auki tarvittaessa klo 02 asti (sovittu Vesan kanssa)\n- Mahdollinen pieni koktaililista omalla rahalla\n- Soitettava Mänille koktaililistasta',
 'Palaveri 9.2.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- Ruokakonsepti & keittiöjaot tarkennettu
INSERT INTO notes (id, event_id, content, author, created_by) VALUES
('e1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001',
 E'RUOKAKONSEPTI — TARKENNETTU PALAVERISTA:\n\n1. RAGE AGAINST THE MALA (V, G):\n- Paksu riisinuudeli (ei vehnä, koska myyty gluteenittomana)\n- ENEMMÄN kastiketta kuin Honor-tapahtumassa\n- Rikon maistettava huomenna (10.2.)\n- Ulkonäkö pitää saada "rock"-teemaan → mustat versiot, tumma ilme\n- Forkan hoitaa pisteen\n\n2. KING OF ROCK FRIED CHICKEN (L):\n- Sama kuin Paulikissa meni\n- Kristian nostaa, Riko täyttää keittiöstä\n- 2 henkilöä pisteellä\n\n3. BLACK SABBATH SLAYER FRIES (L, G):\n- Maki hoitaa pisteen\n- Forkan tukena (pisteet vierekkäin → Forkan ei tarvitse koko aikaa seistä)\n\n4. BROWNIE (L, G):\n- Iso kasa, EI pientä piperrettävää (ei sovi rock-teemaan)\n- Tomusokeri + kuivattuja kukkia/tummaa liilaista\n- Mahdollisesti musta koristekastike päälle\n- Club: iso kasa + Kellohalli: kahvipiste\n- Kassu hoitaa brownie-pisteet + koristelu\n\nKASSU: Juoksupoika + browniet + yleiset täytöt\nLUKA: Ei tarvita keskiviikkona\nJOONA: Ei tarvita (ei lounasta → saa vapaata)\nKRISTIAN: Mukana maustamiseen/laatuun, voi lähteä pääruuhkan jälkeen',
 'Palaveri 9.2.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- Erikoisruokavaliot & menu-esitys
INSERT INTO notes (id, event_id, content, author, created_by) VALUES
('e1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001',
 E'ERIKOISRUOKAVALIOT & MENU-ESITYS:\n\n• Allergiat vaikuttavat vähän: ei punaista lihaa koko menussa, kaikki GF paitsi chicken sandwich\n• Erikoisruokavalioihmiset saavat annokset SAMOILTA pisteiltä (ei keittiöstä)\n• DJ Dosse EI juonna ruokia eikä käy menua läpi\n\nMENU-KYLTIT:\n• Jake tekee menutaulut\n• ENGLANNIKSI (osa porukasta English-speaking)\n• MAHDOLLISIMMAN ISOLLA fontilla (hämärässä näkee)\n• Useampaan pisteeseen + pystypöydille\n• Screenille myös menun kuva (jos Arnella ei tarvetta screenille)\n\nASIAKASPROFIILI:\n• Osa koodareita (huppupäisiä, kokista juovia) → tulevat ehkä vain ruoan takia\n• Osa toimiston muita työntekijöitä\n• 2 yhteyshenkilöä — ottavat rennon linjan tapahtuman suhteen',
 'Palaveri 9.2.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- Tekniikka & logistiikka
INSERT INTO notes (id, event_id, content, author, created_by) VALUES
('e1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001',
 E'TEKNIIKKA & LOGISTIIKKA:\n\n• Event Garden (Arne) rakentaa lavan Kellohallin keittiön eteen + äänitekniikka\n• Klo 10 Event Garden paikalla\n• Matti hoitaa tekniikkalistan\n• Arnen kautta tulee kaikki tekniikkaan liittyvä info\n• Bändin backstage rider tarkistettava → päkkäritila siivottava\n• Jonina (Arnen kontakti) paikan päällä asiakkaan yhteyshenkilönä\n\nBLOKKAUS:\n• Betsi pyydetty 11.2. klo 17:30-23:30 — EI VAHVISTETTU\n• Jos Betsi ei pääse, kysytään Ellalta varahenkilöä\n• Tiia voidaan tarvittaessa siirtää baarista blokkaamaan\n• Schener blokkaa narikka-alueella\n\nULKOTULET: Laita listalle — tarkista onko meillä vai pitääkö tilata\n\nMATTI: Pidä MIPA-numero päällä — monille annettu sun numero',
 'Palaveri 9.2.', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');

-- ============================================================================
-- LISÄTEHTÄVÄT (palaverista)
-- ============================================================================

INSERT INTO event_tasks (id, event_id, title, description, status, priority, created_by) VALUES

-- Maistatus
('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001',
 'Mala-nuudelien maistatus 10.2.',
 'Riko maistaa mala-nuudeliannoksen. Paksu riisinuudeli (ei vehnä). Enemmän kastiketta kuin Honorissa. Tarkista ulkonäkö — pitää sopia rock-teemaan.',
 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Menu-kyltit
('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000001',
 'Menutaulut ja kyltit',
 'Jake tekee menutaulut. ENGLANNIKSI. Iso fontti (näkyy hämärässä). Useampaan paikkaan + pystypöydille. Screenille myös (jos Arnella ei tarvetta).',
 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Blokkari vahvistus
('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000001',
 'Blokkari-vahvistus (Betsi)',
 'Betsi pyydetty 11.2. klo 17:30-23:30. Ei vielä vahvistettu. Jos ei pääse → kysy Ellalta varahenkilöä.',
 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Ulkotulet
('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000001',
 'Ulkotulet — tarkista + tilaa',
 'Tarkista onko meillä ulkotulia vai pitääkö tilata. Laitetaan keskiviikoksi.',
 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Cocktail-lista B-side
('d1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000001',
 'B-side cocktail-lista',
 'Soita Mänille cocktail-listasta. Pieni 2-3 cocktailin lista B-sidelle, omalla rahalla. Rock-teema. Ananasmehua jäänyt Riikan juhlista → chili-twist?',
 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Backstage/päkkäri siivous
('d1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000001',
 'Backstage / päkkäri siivous',
 'Siivoa bändin backstage-tila. Tarkista bändin rider. Matti näyttää paikan päällä missä päkkäri on.',
 'TODO', 'MEDIUM', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Brownie-dekot
('d1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000001',
 'Brownie-koristelu mietittävä',
 'Ei pientä piperrettävää (ei sovi rock-teemaan). Iso kasa. Tomusokeri + kuivattuja tummia kukkia (liilanruskeaa). Mahdollisesti musta koristekastike. Mietitään lisää.',
 'TODO', 'LOW', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e'),

-- Drinkkilippujen lasku
('d1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000001',
 'Drinkkilippujen lasku illan jälkeen',
 'Laske drinkkiliput illan päätteeksi. Lähetä kuva Stinalle. Selkeä kirjanpito.',
 'TODO', 'HIGH', '7e50bafd-b0ad-4921-90f8-6a49f3bfda1e');
