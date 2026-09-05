import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // --------------------------------------------------
    // 1. AUTHENTICATE RECRUITER
    // --------------------------------------------------

    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const token =
      authorization.replace(
        "Bearer ",
        ""
      );

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. VERIFY RECRUITER RESUME SEARCH ACCESS
    // --------------------------------------------------

    const {
      data: recruiterProfile,
      error:
        recruiterProfileError,
    } = await supabase
      .from("profiles")
      .select(
        "resumeSearchEnabled"
      )
      .eq("id", user.id)
      .single();

    if (
      recruiterProfileError ||
      !recruiterProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Recruiter profile not found.",
        },
        { status: 403 }
      );
    }

    if (
      recruiterProfile.resumeSearchEnabled !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "Resume access is available only to authorized premium recruiters.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 3. GET CANDIDATE ID
    // --------------------------------------------------

    const {
      searchParams,
    } = new URL(req.url);

    const candidateId =
      searchParams.get(
        "candidateId"
      );

    if (!candidateId) {
      return NextResponse.json(
        {
          error:
            "Missing candidateId.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. FETCH CANDIDATE PRIVACY SETTINGS
    // --------------------------------------------------

    const {
      data: candidate,
      error: candidateError,
    } = await supabase
      .from("candidate_profiles")
      .select(
        "id, resumeurl, allow_resume_download, searchable, profile_visibility"
      )
      .eq(
        "id",
        candidateId
      )
      .single();

    if (
      candidateError ||
      !candidate
    ) {
      return NextResponse.json(
        {
          error:
            "Candidate profile not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. CHECK PROFILE SEARCH PRIVACY
    // --------------------------------------------------

    if (
      candidate.searchable ===
      false
    ) {
      return NextResponse.json(
        {
          error:
            "This candidate is not searchable.",
        },
        { status: 403 }
      );
    }

    if (
      candidate.profile_visibility ===
      "private"
    ) {
      return NextResponse.json(
        {
          error:
            "This candidate profile is private.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. CHECK RESUME DOWNLOAD PERMISSION
    // --------------------------------------------------

    if (
      candidate.allow_resume_download !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "This candidate has not allowed recruiters to download or view their resume.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 7. VERIFY RESUME EXISTS
    // --------------------------------------------------

    const resumeUrl =
      candidate.resumeurl;

    if (!resumeUrl) {
      return NextResponse.json(
        {
          error:
            "No resume is available for this candidate.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 8. EXTRACT SUPABASE STORAGE PATH
    // --------------------------------------------------

    let storagePath =
      resumeUrl;

    const publicMarker =
      "/storage/v1/object/public/resumes/";

    const signedMarker =
      "/storage/v1/object/sign/resumes/";

    if (
      resumeUrl.includes(
        publicMarker
      )
    ) {
      storagePath =
        resumeUrl.split(
          publicMarker
        )[1];
    } else if (
      resumeUrl.includes(
        signedMarker
      )
    ) {
      storagePath =
        resumeUrl.split(
          signedMarker
        )[1].split("?")[0];
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid resume storage URL.",
        },
        { status: 400 }
      );
    }

    // Decode URL-encoded characters
    try {
      storagePath =
        decodeURIComponent(
          storagePath
        );
    } catch {
      // Keep original path if decoding fails
    }

    if (!storagePath) {
      return NextResponse.json(
        {
          error:
            "Invalid resume storage path.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 9. GENERATE SHORT-LIVED SIGNED URL
    // --------------------------------------------------

    const {
      data: signedUrlData,
      error:
        signedUrlError,
    } =
      await supabase.storage
        .from("resumes")
        .createSignedUrl(
          storagePath,
          300
        );

    if (
      signedUrlError ||
      !signedUrlData?.signedUrl
    ) {
      console.error(
        "SIGNED RESUME URL ERROR:",
        signedUrlError
      );

      return NextResponse.json(
        {
          error:
            "Unable to generate secure resume access.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. RETURN SHORT-LIVED URL
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      url:
        signedUrlData.signedUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error(
      "RESUME ACCESS ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to access resume.",
      },
      { status: 500 }
    );
  }
}