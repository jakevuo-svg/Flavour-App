import { supabase } from './supabaseClient';

export const getLocations = async () => {
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
