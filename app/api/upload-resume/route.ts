import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    // Accept both field names:
    // "file" - existing application workflow
    // "resume" - applicant profile workflow
    const file =
      (data.get("file") as File | null) ||
      (data.get("resume") as File | null);

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOC, and DOCX files are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "Resume file must be smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe unique filename
    const originalName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const fileName = `${Date.now()}-${originalName}`;

    // Upload to Supabase Storage
    const { error } =
      await supabase.storage
        .from("resumes")
        .upload(
          fileName,
          buffer,
          {
            contentType:
              file.type ||
              "application/octet-stream",

            upsert: false,
          }
        );

    if (error) {
      console.error(
        "SUPABASE STORAGE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to upload resume.",
        },
        { status: 500 }
      );
    }

    // Generate public URL
    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from("resumes")
        .getPublicUrl(
          fileName
        );

    const publicUrl =
      publicUrlData.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        {
          error:
            "Resume uploaded but public URL could not be generated.",
        },
        { status: 500 }
      );
    }

    console.log(
      "RESUME UPLOAD SUCCESS:",
      publicUrl
    );

    // Return BOTH names for compatibility
    // with existing SearchEezy code.
    return NextResponse.json({
      url: publicUrl,
      fileUrl: publicUrl,
    });
  } catch (error) {
    console.error(
      "UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Upload failed.",
      },
      { status: 500 }
    );
  }
}