import { supabase, isDemoMode } from './supabaseClient';

let demoFiles = new Map();

export const uploadFile = async (bucket, filePath, file) => {
  if (isDemoMode) {
    const key = `${bucket}/${filePath}`;
    demoFiles.set(key, file);
    return {
      path: filePath,
      url: `demo://storage/${key}`,
    };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return data;
};

export const getPublicUrl = (bucket, filePath) => {
  if (isDemoMode) {
    const key = `${bucket}/${filePath}`;
    if (demoFiles.has(key)) {
      return {
        data: {
          publicUrl: `demo://storage/${key}`,
        },
      };
    }
    return {
      data: {
        publicUrl: `demo://storage/${bucket}/${filePath}`,
      },
    };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { data };
};

export const deleteFile = async (bucket, filePath) => {
  if (isDemoMode) {
    const key = `${bucket}/${filePath}`;
    demoFiles.delete(key);
    return { success: true };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }

  return data;
};

export const uploadLogo = async (locationId, file) => {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const filePath = `locations/${locationId}/logo-${timestamp}.${ext}`;

  if (isDemoMode) {
    const key = `logos/${filePath}`;
    demoFiles.set(key, file);
    return {
      path: filePath,
      publicUrl: `demo://storage/${key}`,
    };
  }

  const uploadData = await uploadFile('logos', filePath, file);
  const urlData = getPublicUrl('logos', filePath);

  return {
    path: uploadData.path,
    publicUrl: urlData.data.publicUrl,
  };
};

export const uploadEventFile = async (eventId, file) => {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const filePath = `events/${eventId}/${timestamp}-${file.name}`;

  if (isDemoMode) {
    const key = `event-files/${filePath}`;
    demoFiles.set(key, file);
    return {
      path: filePath,
      publicUrl: `demo://storage/${key}`,
    };
  }

  const uploadData = await uploadFile('event-files', filePath, file);
  const urlData = getPublicUrl('event-files', filePath);

  return {
    path: uploadData.path,
    publicUrl: urlData.data.publicUrl,
  };
};

export const uploadLocationFile = async (locationId, file) => {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const filePath = `locations/${locationId}/${timestamp}-${file.name}`;

  if (isDemoMode) {
    const key = `location-files/${filePath}`;
    demoFiles.set(key, file);
    return {
      path: filePath,
      publicUrl: `demo://storage/${key}`,
    };
  }

  const uploadData = await uploadFile('location-files', filePath, file);
  const urlData = getPublicUrl('location-files', filePath);

  return {
    path: uploadData.path,
    publicUrl: urlData.data.publicUrl,
  };
};
