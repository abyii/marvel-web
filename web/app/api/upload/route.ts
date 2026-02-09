import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLDNRY_CLOUD_NAME,
  api_key: process.env.CLDNRY_API_KEY,
  api_secret: process.env.CLDNRY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");
    console.log("Env vars present:", {
      cloud_name: !!process.env.CLDNRY_CLOUD_NAME,
      api_key: !!process.env.CLDNRY_API_KEY,
      api_secret: !!process.env.CLDNRY_API_SECRET,
    });

    // Check if Cloudinary is configured
    if (!process.env.CLDNRY_CLOUD_NAME || !process.env.CLDNRY_API_KEY || !process.env.CLDNRY_API_SECRET) {
      console.error("Cloudinary environment variables not configured");
      return NextResponse.json(
        { error: "Server misconfigured: Missing Cloudinary credentials. Check CLDNRY_CLOUD_NAME, CLDNRY_API_KEY, CLDNRY_API_SECRET in .env.local" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.size, file.type);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Uploading to Cloudinary...");

    // Upload to Cloudinary
    return new Promise<NextResponse>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "marvel_web",
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve(
              NextResponse.json(
                {
                  error: `Upload failed: ${error.message}`,
                },
                { status: 500 }
              )
            );
          } else if (result && result.secure_url) {
            console.log("File uploaded successfully:", result.secure_url);
            resolve(
              NextResponse.json(
                {
                  url: result.secure_url,
                  filename: file.name,
                  size: file.size,
                  type: file.type,
                  cloudinaryId: result.public_id,
                },
                { status: 200 }
              )
            );
          } else {
            console.error("Cloudinary upload returned no result", result);
            resolve(
              NextResponse.json(
                {
                  error: "Upload failed: No URL returned from server",
                },
                { status: 500 }
              )
            );
          }
        }
      );

      uploadStream.on("error", (error) => {
        console.error("Upload stream error:", error);
        resolve(
          NextResponse.json(
            {
              error: `Upload stream error: ${error.message}`,
            },
            { status: 500 }
          )
        );
      });

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: `File upload failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("Delete API called");

    // Check if Cloudinary is configured
    if (
      !process.env.CLDNRY_CLOUD_NAME ||
      !process.env.CLDNRY_API_KEY ||
      !process.env.CLDNRY_API_SECRET
    ) {
      console.error("Cloudinary environment variables not configured");
      return NextResponse.json(
        { error: "Server misconfigured: Missing Cloudinary credentials" },
        { status: 500 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "No publicId provided" },
        { status: 400 }
      );
    }

    console.log("Deleting from Cloudinary:", publicId);

    // Delete from Cloudinary
    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary delete error:", error);
          resolve(
            NextResponse.json(
              {
                error: `Delete failed: ${error.message}`,
              },
              { status: 500 }
            )
          );
        } else {
          console.log("File deleted successfully from Cloudinary:", result);
          resolve(
            NextResponse.json(
              {
                success: true,
                message: "File deleted from Cloudinary",
                result,
              },
              { status: 200 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("File delete error:", error);
    return NextResponse.json(
      {
        error: `Delete failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
