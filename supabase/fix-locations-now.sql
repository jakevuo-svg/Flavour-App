-- ============================================================================
-- DIAGNOSTIIKKA + KORJAUS: Lokaatiot näkyviin
-- Aja tämä Supabase SQL Editorissa
-- ============================================================================

-- 1. Tarkista onko dataa ylipäätään
SELECT 'ENNEN: locations count' as info, count(*) as tulos FROM locations;

-- 2. Tarkista käyttäjän tila (onko admin + active)
SELECT id, name, email, role, is_active
FROM users
WHERE email = 'jake@flavourventures.com';

-- 3. Varmista että käyttäjä on admin + active
UPDATE users SET role = 'admin', is_active = true
WHERE email = 'jake@flavourventures.com';

-- 4. Poista vanhat lokaatiot ja lisää uudet
DELETE FROM locations;

INSERT INTO locations (name, type, capacity, address, description, "contactPerson", "contactEmail", "contactPhone", equipment, "techSpecs", "kitchenEquipment", notes, created_at, modified_at)
VALUES
  ('BLACK BOX 360', 'Tapahtumatila', 50,
   'Tripla, Pasila, Helsinki',
   'Suuri, visuaalisesti vaikuttava ja helposti muuntautuva tapahtumatila. Tummaa tilaa kiertävät massiiviset näytöt mahdollistavat tilan muuntamisen täysin tapahtuman teeman, brändin tai viestin mukaiseksi. Kokonaisuuteen kuuluu myös näköalaravintolan puoli.',
   '', 'info@flavours.fi', '0400-219921',
   'Joustavat tilaratkaisut istuviin tai seisoviin tilaisuuksiin. Tilaan yhdistyvä panoraamaravintola.',
   '360° immersiiviset visuaaliset pinnat. Huippuluokan ääni- ja esitystekniikka.',
   'Oma ravintola räätälöi tarjoilut toiveiden mukaan.',
   'Pinta-ala n. 650 m². Minimi 50 henkilöä. Sopii: seminaarit, tuotelanseeraukset, yritystapahtumat, iltatilaisuudet.',
   now(), now()),

  ('KELLOHALLI', 'Tapahtumatila', 30,
   'Teurastamo, Helsinki',
   'Joustava ja luonteikas tapahtumatila Teurastamon sydämessä. Teollinen tila mukautuu monenlaisiin tapahtumiin yritysseminaareista iltajuhliin ja istuviin illallisiin.',
   '', 'info@flavours.fi', '0400-219921',
   'Erittäin muunneltavat tilaratkaisut. Sisältää: Iso Sali, Klubi, Kabinetti, Terassi, Studio.',
   'Urbaani teollinen tunnelma. Täyden palvelun tapahtumatuotanto.',
   'Catering- ja baaripalvelut saatavilla. Tapahtumaan räätälöidyt tarjoilut.',
   'Minimi 30 henkilöä. Sopii: seminaarit, yritystapahtumat, illalliset, juhlat, työpajat.',
   now(), now()),

  ('FLAVOUR STUDIO', 'Tapahtumatila', 20,
   'Teurastamo, Helsinki',
   'Joustava tapahtumatila, joka on suunniteltu elämyksiin ruoan parissa, kuten kokkikouluihin, yksityisillallisiin ja luoviin tilaisuuksiin.',
   '', 'info@flavours.fi', '0400-219921',
   'Joustavat kalusteet ja tilaratkaisut. Istumapaikat illallisille tai työpajoihin.',
   'Intiimi tunnelma ammattimaisilla puitteilla.',
   'Täysin varusteltu keittiö kokkailutapahtumiin.',
   'Pinta-ala n. 150 m². Minimi 20 henkilöä. Sopii: työpajat, illalliset, seminaarit, bränditapahtumat.',
   now(), now()),

  ('CUISINE – CHEF''S TABLE', 'Illallistila', 10,
   'Teurastamo, Helsinki',
   'Yksityinen keittiö- ja illallistila, jossa ruoka on kokemuksen keskiössä. Vieraat voivat seurata – ja halutessaan osallistua – kun kokit valmistavat menun paikan päällä.',
   '', 'info@flavours.fi', '0400-219921',
   'Yhteinen pöytäryhmä. Mahdollisuus osallistua ruoanlaittoon.',
   'Rauhallinen, intiimi tunnelma.',
   'Kokkivetoinen illalliselämys. Viiniparitukset ja suunnitellut menut.',
   'Pinta-ala n. 50 m². Minimi 10 henkilöä. Sopii: yksityiset illalliset, tastingit, kulinaariset elämykset.',
   now(), now()),

  ('PIZZALA', 'Työpajatila', 10,
   'Teurastamo, Helsinki',
   'Herkullinen napolilainen pizzatyöpajakokemus tunnelmallisessa tiilimiljöössä.',
   '', 'info@flavours.fi', '0400-219921',
   'Rento ja sosiaalinen ilmapiiri. Yhteisöllinen kokemus hyvän ruoan parissa.',
   '',
   'Aito puulämmitteinen pizzauuni. Ohjatut pizzatyöpajat.',
   'Pinta-ala n. 100 m². Minimi 10 henkilöä. Sopii: tiimiytyminen, rennot yritystapahtumat, työpajat.',
   now(), now());

-- 5. Varmista SECURITY DEFINER funktiot
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 6. Korjaa RLS-policyt
DROP POLICY IF EXISTS "admin_locations_all" ON locations;
DROP POLICY IF EXISTS "workers_locations_select" ON locations;
DROP POLICY IF EXISTS "authenticated_locations_all" ON locations;

CREATE POLICY "admin_locations_all" ON locations
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "workers_locations_select" ON locations
  FOR SELECT USING (public.is_active_user());

-- 7. Tarkista tulos
SELECT 'JÄLKEEN: locations count' as info, count(*) as tulos FROM locations;
SELECT name, type, capacity, address FROM locations ORDER BY name;
