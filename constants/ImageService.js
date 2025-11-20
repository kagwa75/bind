import * as FileSystem from "expo-file-system";
import { supabaseUrl } from ".";
import { supabase } from "../lib/supabase";

export const uploadFile = async (
  folderName,
  fileUri,
  isImage = true,
  userId,
) => {
  try {
    let fileName = getFilePath(folderName, isImage, userId);

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: isImage ? "image/png" : "video/mp4",
      name: fileName,
    });

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, formData, {
        cacheControl: "3600",
        upsert: true, // Changed to true to allow updates
        contentType: isImage ? "image/png" : "video/mp4",
      });

    if (error) {
      console.error("fileUpload error:", error.message);
      return { success: false, error: error.message };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("fileUpload error:", error.message);
    return { success: false, error: error.message };
  }
};
export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/objects/public/uploads/${filePath}`,
    };
  }
};
export const getFilePath = (folderName, isImage, userId) => {
  return `/${folderName}/${userId}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};
//downoald the post image so as to dispaly in the share
export const downloadFile = async (url) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri;
  } catch (error) {
    console.error(error);
  }
};
export const getLocalFilePath = (filePath) => {
  let filename = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${filename}`;
};

// Keep your existing getImageService if needed elsewhere
const getImageService = (imagePath) => {
  if (imagePath) {
    return imagePath;
  } else {
    return require("../assets/images/icon.png");
  }
};
export default getImageService;
