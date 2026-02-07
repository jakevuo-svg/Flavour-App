import { supabase, isDemoMode } from './supabaseClient';

const INITIAL_DEMO_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'BLACK BOX 360',
    capacity: 120,
    type: 'Event Space',
    address: 'Helsinki',
    description: 'Monikäyttöinen tapahtuma-areena 360° projisoinneilla.',
    logo_url: null,
  },
  {
    id: 'loc-2',
    name: 'KELLOHALLI',
    capacity: 200,
    type: 'Event Hall',
    address: 'Helsinki',
    description: 'Historiallinen ja tunnelmallinen tapahtumatila.',
    logo_url: null,
  },
  {
    id: 'loc-3',
    name: 'FLAVOUR STUDIO',
    capacity: 30,
    type: 'Studio',
    address: 'Helsinki',
    description: 'Ammattimainen studio kuvauksiin ja workshopeihin.',
    logo_url: null,
  },
  {
    id: 'loc-4',
    name: 'CUISINE',
    capacity: 60,
    type: 'Restaurant',
    address: 'Helsinki',
    description: 'Tyylikäs ravintola illallisiin ja juhlatilaisuuksiin.',
    logo_url: null,
  },
  {
    id: 'loc-5',
    name: 'PIZZALA',
    capacity: 40,
    type: 'Restaurant',
    address: 'Helsinki',
    description: 'Rento ja viihtyisä pizzaravintola.',
    logo_url: null,
  },
  {
    id: 'loc-6',
    name: 'FLAVOUR CATERING',
    capacity: null,
    type: 'Catering Service',
    address: 'Helsinki',
    description: 'Täyden palvelun catering kaikkiin tapahtumiin.',
    logo_url: null,
  },
];

let demoLocations = JSON.parse(JSON.stringify(INITIAL_DEMO_LOCATIONS));
let demoFiles = [];
let demoFileNextId = 1;

export const getLocations = async () => {
  if (isDemoMode) {
    return demoLocations;
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }

  return data || [];
};

export const getLocation = async (id) => {
  if (isDemoMode) {
    return demoLocations.find(l => l.id === id) || null;
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching location:', error);
    throw error;
  }

  return data || null;
};

export const updateLocation = async (id, data) => {
  const updateData = {
    ...data,
    modified_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const location = demoLocations.find(l => l.id === id);
    if (location) {
      Object.assign(location, updateData);
      return location;
    }
    throw new Error('Location not found');
  }

  const { data: updatedLocation, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating location:', error);
    throw error;
  }

  return updatedLocation;
};

export const getLocationFiles = async (locationId) => {
  if (isDemoMode) {
    return demoFiles.filter(f => f.location_id === locationId);
  }

  const { data, error } = await supabase
    .from('location_files')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching location files:', error);
    throw error;
  }

  return data || [];
};

export const addLocationFile = async (locationId, fileName, filePath, fileType) => {
  const fileData = {
    location_id: locationId,
    file_name: fileName,
    file_path: filePath,
    file_type: fileType,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const id = `file-${demoFileNextId++}`;
    const newFile = { id, ...fileData };
    demoFiles.push(newFile);
    return newFile;
  }

  const { data: newFile, error } = await supabase
    .from('location_files')
    .insert([fileData])
    .select()
    .single();

  if (error) {
    console.error('Error adding location file:', error);
    throw error;
  }

  return newFile;
};

export const removeLocationFile = async (fileId) => {
  if (isDemoMode) {
    demoFiles = demoFiles.filter(f => f.id !== fileId);
    return true;
  }

  const { error } = await supabase
    .from('location_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('Error removing location file:', error);
    throw error;
  }

  return true;
};
