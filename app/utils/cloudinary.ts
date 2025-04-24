let cachedCloudName: string | null = null;

export const getCloudinaryUrl = async (publicId: string, options: Record<string, any> = {}) => {
  if (!cachedCloudName) {
    cachedCloudName = await getCloudinaryConfig();
  }
  

  if (!cachedCloudName) {
    console.error('Could not get Cloudinary cloud name');
    return '';
  }
  
  let url = `https://res.cloudinary.com/${cachedCloudName}/image/upload`;
  
  const transformations: string[] = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`;
  }
  
  url += `/${publicId}`;
  
  return url;
};

const getCloudinaryConfig = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/py/cloudinary/config');
    if (response.ok) {
      const data = await response.json();
      return data.cloud_name;
    }
    return null;
  } catch (error) {
    console.error('Failed to get Cloudinary config:', error);
    return null;
  }
};

export const uploadToCloudinary = async (file: File, folder: string = 'cv_uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch('/api/py/cloudinary/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to upload to Cloudinary');
  }
  
  return await response.json();
};

export const getCloudinaryImageInfo = async (publicId: string) => {
  const response = await fetch(`/api/py/cloudinary/info?public_id=${encodeURIComponent(publicId)}`);
  
  if (!response.ok) {
    throw new Error('Failed to get image information');
  }
  
  return await response.json();
};