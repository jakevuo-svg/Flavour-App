import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

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

      let filePath = fileData.driveLink || '';

      // If actual file data (base64) is provided, upload to Supabase Storage
      if (fileData.fileData && fileData.fileName) {
        const fileExtension = fileData.fileName.split('.').pop();
        const safeFileName = `loc-${locationId}-${Date.now()}.${fileExtension}`;
        const storagePath = `location-files/${safeFileName}`;

        // Convert base64 data URI to blob
        const response = await fetch(fileData.fileData);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('location-files')
          .upload(storagePath, blob, { upsert: true, contentType: fileData.fileType || 'application/octet-stream' });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('location-files')
          .getPublicUrl(storagePath);

        filePath = urlData?.publicUrl || storagePath;
      }

      // Insert metadata record
      const { data, error: err } = await supabase
        .from('location_files')
        .insert([{
          location_id: locationId,
          file_name: fileData.name || fileData.fileName || 'Untitled',
          file_path: filePath,
          file_type: fileData.fileType || fileData.type || 'other',
          uploaded_by: profile?.id,
        }])
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      console.error('Failed to add location file:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const removeFile = useCallback(async (locationId, fileId) => {
    try {
      setError(null);

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

      const { data, error: err } = await supabase
        .from('location_files')
        .select('*')
        .eq('location_id', locationId);
      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch location files:', err);
      setError(err.message);
      return [];
    }
  }, []);

  const uploadLogo = useCallback(async (locationId, file) => {
    try {
      setError(null);

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
