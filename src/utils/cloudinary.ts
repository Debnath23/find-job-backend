import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

cloudinary.config({
  // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // api_key: process.env.CLOUDINARY_API_KEY,
  // api_secret: process.env.CLOUDINARY_API_SECRET,

  cloud_name: 'dnljaiskr',
  api_key: '287677496845536',
  api_secret: '94Heu92e9yOWYTwh8XFMoAuAtoA',
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    // file has been uploaded successfull
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    // delete the old file on cloudinary
    await cloudinary.uploader.destroy(localFilePath);
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
