'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials are set
const hasCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadReceipt(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fallback: If Cloudinary credentials are not present, return a base64 representation.
    // This allows instant local development and displays the uploaded receipt image perfectly in-chat!
    if (!hasCloudinary) {
      console.warn("⚠️ Cloudinary credentials are not configured. Falling back to local base64 preview URL.");
      const base64String = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64String}`;
      return { url: dataUrl };
    }

    // Upload to Cloudinary using raw buffer streams
    return new Promise<{ url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'finance-ai-receipts',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed, falling back to base64:", error);
            const base64String = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64String}`;
            resolve({ url: dataUrl });
          } else {
            resolve({ url: result?.secure_url || "" });
          }
        }
      );
      
      uploadStream.end(buffer);
    });

  } catch (error: any) {
    console.error("Error uploading receipt:", error);
    throw new Error(error.message || "Failed to process receipt file.");
  }
}
