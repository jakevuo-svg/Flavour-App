import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

// Demo seed data for locations
let demoLocations = isDemoMode ? [
  {
    id: 'loc-1',
    name: 'BLACK BOX 360',
    type: 'Tapahtumatila',
    capacity: 200,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Monikäyttöinen tapahtumatila 360° projisoinneilla. Immerse-kokemukset ja gaala-illalliset. Tila muuntautuu täysin projisoinnin avulla — galaktisesta avaruudesta metsämaisemaan.',
    contactPerson: 'Kassu Noronen',
    contactEmail: 'kassu@flavour.fi',
    contactPhone: '+358 40 123 4567',
    driveLink: 'https://drive.google.com/drive/folders/blackbox360-files',
    equipment: 'Pöydät: 20 kpl pyöreä (8hlö), 10 kpl pitkä (12hlö)\nTuolit: 200 kpl\nBaaritiskit: 2 kpl\nNaulakot: 3 kpl (á 50 takkia)',
    techSpecs: '360° projektori (4x 4K laser)\nPA-järjestelmä (JBL PRX)\nLangaton mikrofoni x4\nValaistus: DMX-ohjattu\nHDMI-syöttö presentaatioille\nWiFi: flavour-events (salasana vaihdetaan tapahtumittain)',
    kitchenEquipment: 'Lämmityskeittiö (ei täysi kokkausmahdollisuus)\nLämpöhauteet x4\nKylmätilat\nAstianpesukone (teollisuus)',
    notes: 'Lastauslaituri takapihalla. Avaimet Kassulta.\nHälytys pois klo 07 jälkeen automaattisesti.\nParkkitilaa rajallisesti — opasta asiakkaat Teurastamon P-alueelle.',
    logo_path: null,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'loc-2',
    name: 'KELLOHALLI',
    type: 'Tapahtumatila',
    capacity: 300,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Historiallinen kellohalli Teurastamolla. Korkea katto, teollinen tunnelma. Illalliset, juhlat ja yritystapahtumat. Tilan saa täysin tyhjäksi tai kalustettua monella tapaa.',
    contactPerson: 'Kassu Noronen',
    contactEmail: 'kassu@flavour.fi',
    contactPhone: '+358 40 123 4567',
    driveLink: 'https://drive.google.com/drive/folders/kellohalli-files',
    equipment: 'Pitkät pöydät: 15 kpl (á 10 hlö)\nPyöreät pöydät: 25 kpl (á 8 hlö)\nTuolit: 300 kpl\nLava (koottava): 4m x 3m\nNaulakot: 4 kpl',
    techSpecs: 'Projektorit: 2x (pääseinä + sivuseinä)\nPA: QSC K12.2 x4 + sub\nLangaton mikrofoni x2\nSpottivalot: 8 kpl\nHDMI + VGA -liitännät',
    kitchenEquipment: 'Täysi ammattikeittiö viereisessä tilassa\nUuni x3 (Rational)\nInduktiolevy x8\nKylmähuone + pakastin\nAstianpesu (teollisuus x2)',
    notes: 'Kellohallin lattia herkkä — ei teippiä suoraan!\nKäytä aina suojalevyjä raskaalle kalustolle.\nTupakointi ehdottomasti kielletty sisätiloissa — ohjaa piha-alueelle.',
    logo_path: null,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'loc-3',
    name: 'FLAVOUR STUDIO',
    type: 'Kokkauskoulu',
    capacity: 50,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Kokkauskoulu ja studio. Tiimikokkausta, workshopeja ja tuotekehitystä. 4 kokkauspisteettä, jokaisessa oma induktioliesi, uuni ja työvälineet.',
    contactPerson: 'Milla Kokkonen',
    contactEmail: 'milla@flavour.fi',
    contactPhone: '+358 40 234 5678',
    driveLink: 'https://drive.google.com/drive/folders/studio-files',
    equipment: 'Kokkauspisteeet: 4 kpl (á 10-12 hlö)\nNäyttöruutu jokaisella pisteellä\nIstumapaikkoja: 50\nEsilinat: 60 kpl (Flavour-brändätyt)',
    techSpecs: 'Näytöt: 4x 55" (pistekohtaiset)\nPääruutu: 75" (edessä)\nKamera: overhead-kamera kokin työpisteelle\nMikrofoni: langaton headset x2\nBluetooth-kaiutin (taustamusiikki)',
    kitchenEquipment: 'Induktioliesi x8 (2/piste)\nUuni x4 (1/piste)\nLeikkuulaudat, veitset, työvälineet (pistekohtaiset setit)\nBlender x4\nKylmäkaapit pisteillä\nJääpalakone',
    notes: 'Esilinat pestävä jokaisen tapahtuman jälkeen.\nVeitset teroitettava viikoittain.\nAllergiakortit pöydille aina valmiiksi.',
    logo_path: null,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'loc-4',
    name: 'CUISINE',
    type: 'Ravintola',
    capacity: 80,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Ravintola yksityistilaisuuksille ja illallisille. Intiimi tunnelma, sopii hyvin pienemmille ryhmille ja fine dining -kokemuksille.',
    contactPerson: 'Tomi Keittiömestari',
    contactEmail: 'tomi@flavour.fi',
    contactPhone: '+358 40 345 6789',
    equipment: 'Pöydät: 10 kpl (á 8 hlö)\nBaaritiskit: 1 kpl\nLounge-alue: sohvat + nojatuolit',
    techSpecs: 'Näyttö: 1x 65"\nPA: kompakti (taustamusiikki)\nMikrofoni: 1 langaton',
    kitchenEquipment: 'Täysi ravintolakeittiö\nà la carte -taso\nPastakone\nSous vide x4',
    notes: 'Max 80 hlö istuen, 100 hlö cocktail-tyyliin.',
    logo_path: null,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'loc-5',
    name: 'PIZZALA',
    type: 'Ravintola',
    capacity: 60,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Pizzaravintola ja tapahtumatila. Rento tunnelma, sopii afterworkeille ja epämuodollisille tapahtumille.',
    contactPerson: 'Mikko Pizzamestari',
    contactEmail: 'mikko@flavour.fi',
    contactPhone: '+358 40 456 7890',
    equipment: 'Pöydät: 12 kpl\nBaaritiskit: 1 kpl\nTerassi: 30 paikkaa (kesäkausi)',
    techSpecs: 'Bluetooth-kaiutin\nNäyttö: 1x 50"',
    kitchenEquipment: 'Pizzauuni (puu)\nPizzauuni (sähkö)\nKylmäpöytä',
    notes: 'Terassi auki touko-syyskuu.\nPizzauunin esilämmitys 45 min.',
    logo_path: null,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'loc-6',
    name: 'FLAVOUR CATERING',
    type: 'Catering',
    capacity: 500,
    address: 'Työpajankatu 2, 00580 Helsinki (Teurastamo)',
    description: 'Catering-palvelut ulkoisiin tapahtumapaikkoihin. Toimitamme ruoat, juomat ja henkilökunnan mihin tahansa tilaan Helsingissä ja lähialueilla.',
    contactPerson: 'Sanna Catering',
    contactEmail: 'sanna@flavour.fi',
    contactPhone: '+358 40 567 8901',
    driveLink: 'https://drive.google.com/drive/folders/catering-files',
    equipment: 'Kuljetuskalusto: pakettiauto x2\nLämpöboksit: 20 kpl\nKylmälaukut: 15 kpl\nChafing dish: 30 kpl\nTarjoiluastiat (lasi, posliini, teräs)',
    techSpecs: '',
    kitchenEquipment: 'Valmistuskeittiö Teurastamolla\nKapasiteetti: 500 annosta/päivä',
    notes: 'Tilaukset vähintään 5 arkipäivää etukäteen.\nMinimitilaus 20 hlö.\nKuljetusmaksu Helsingin ulkopuolelle.',
    logo_path: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
] : [];

let demoLocationFiles = isDemoMode ? [
  {
    id: 'lf-1',
    location_id: 'loc-1',
    name: 'Black Box 360 pohjapiirros',
    type: 'floorplan',
    driveLink: 'https://drive.google.com/file/d/blackbox-floorplan',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'lf-2',
    location_id: 'loc-1',
    name: 'AV-tekniikan ohje',
    type: 'tech_spec',
    driveLink: 'https://drive.google.com/file/d/blackbox-av-guide',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'lf-3',
    location_id: 'loc-2',
    name: 'Kellohalli pohjapiirros v2',
    type: 'floorplan',
    driveLink: 'https://drive.google.com/file/d/kellohalli-floorplan',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'lf-4',
    location_id: 'loc-2',
    name: 'Kellohalli brändikuvat',
    type: 'branding',
    driveLink: 'https://drive.google.com/file/d/kellohalli-branding',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'lf-5',
    location_id: 'loc-3',
    name: 'Studio kokkauspisteen layout',
    type: 'floorplan',
    driveLink: 'https://drive.google.com/file/d/studio-layout',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'lf-6',
    location_id: 'loc-3',
    name: 'Menu-template Flavour Studio',
    type: 'menu',
    driveLink: 'https://drive.google.com/file/d/studio-menu-template',
    fileName: null,
    fileType: null,
    fileData: null,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
] : [];
let demoNextId = 100;

/**
 * Custom hook for managing locations data
 */
export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        setLocations([...demoLocations].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        return;
      }

      const { data, error: err } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setLocations(data || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = useCallback(async (data) => {
    try {
      setError(null);
      const locationData = {
        ...data,
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const id = `location-${demoNextId++}`;
        const newLocation = { id, ...locationData };
        demoLocations.push(newLocation);
        setLocations(prev => [newLocation, ...prev]);
        return newLocation;
      }

      const { data: newLocation, error: err } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();

      if (err) throw err;
      setLocations(prev => [newLocation, ...prev]);
      return newLocation;
    } catch (err) {
      console.error('Failed to add location:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateLocation = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = {
        ...data,
        modified_by: profile?.id,
        modified_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const location = demoLocations.find(l => l.id === id);
        if (location) {
          Object.assign(location, updateData);
          setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updateData } : l));
          return location;
        }
        throw new Error('Location not found');
      }

      const { data: updated, error: err } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setLocations(prev => prev.map(l => l.id === id ? updated : l));
      return updated;
    } catch (err) {
      console.error('Failed to update location:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const deleteLocation = useCallback(async (id) => {
    try {
      setError(null);

      if (isDemoMode) {
        demoLocations = demoLocations.filter(l => l.id !== id);
        demoLocationFiles = demoLocationFiles.filter(f => f.location_id !== id);
        setLocations(prev => prev.filter(l => l.id !== id));
        return;
      }

      const { error: err } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete location:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const addFile = useCallback(async (locationId, fileData) => {
    try {
      setError(null);

      if (isDemoMode) {
        const file = {
          id: `file-${Date.now()}`,
          location_id: locationId,
          ...fileData,
          created_at: new Date().toISOString(),
        };
        demoLocationFiles.push(file);
        return file;
      }

      const { data, error: err } = await supabase
        .from('location_files')
        .insert([{ location_id: locationId, ...fileData }])
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      console.error('Failed to add location file:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const removeFile = useCallback(async (locationId, fileId) => {
    try {
      setError(null);

      if (isDemoMode) {
        demoLocationFiles = demoLocationFiles.filter(f => f.id !== fileId);
        return;
      }

      const { error: err } = await supabase
        .from('location_files')
        .delete()
        .eq('id', fileId)
        .eq('location_id', locationId);

      if (err) throw err;
    } catch (err) {
      console.error('Failed to remove location file:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getFiles = useCallback(async (locationId) => {
    try {
      setError(null);

      if (isDemoMode) {
        return demoLocationFiles.filter(f => f.location_id === locationId);
      }

      const { data, error: err } = await supabase
        .from('location_files')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch location files:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const uploadLogo = useCallback(async (locationId, file) => {
    try {
      setError(null);

      if (isDemoMode) {
        const logoData = {
          id: `logo-${Date.now()}`,
          location_id: locationId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: `demo-logo-${Date.now()}`,
          is_logo: true,
          created_at: new Date().toISOString(),
        };
        demoLocationFiles.push(logoData);
        return logoData;
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `location-${locationId}-logo-${Date.now()}.${fileExtension}`;
      const filePath = `logos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('location-files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data, error: err } = await supabase
        .from('location_files')
        .insert([{
          location_id: locationId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          is_logo: true,
        }])
        .select()
        .single();

      if (err) throw err;

      await updateLocation(locationId, { logo_path: filePath });

      return data;
    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError(err.message);
      throw err;
    }
  }, [updateLocation]);

  return {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    addFile,
    removeFile,
    getFiles,
    uploadLogo,
    refetch: fetchLocations,
  };
}
