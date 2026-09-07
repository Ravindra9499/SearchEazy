import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. VERIFY EMPLOYER / RECRUITER ACCESS
    // --------------------------------------------------

    const {
      data: recruiterProfile,
      error: recruiterProfileError,
    } = await supabase
      .from("profiles")
      .select(
        "role, resumeSearchEnabled"
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
      recruiterProfile.role !==
      "employer"
    ) {
      return NextResponse.json(
        {
          error:
            "Candidate profiles are available only to employer accounts.",
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
            "Candidate profile access is available only to authorized premium recruiters.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 3. GET CANDIDATE ID
    // --------------------------------------------------

    const {
      id: candidateId,
    } = await context.params;

    if (!candidateId) {
      return NextResponse.json(
        {
          error:
            "Missing candidate ID.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. FETCH CANDIDATE PROFILE
    // --------------------------------------------------

    const {
      data: candidate,
      error: candidateError,
    } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("id", candidateId)
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
    // 5. CHECK SEARCHABILITY
    // --------------------------------------------------

    if (
      candidate.searchable === false
    ) {
      return NextResponse.json(
        {
          error:
            "This candidate is not searchable.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. CHECK PROFILE VISIBILITY
    // --------------------------------------------------

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
    // 7. APPLY FIELD-LEVEL PRIVACY
    // --------------------------------------------------

    const safeCandidate = {
      ...candidate,

      // Email
      useremail:
        candidate.show_email === true
          ? candidate.useremail
          : null,

      // Phone
      phone:
        candidate.show_phone === true
          ? candidate.phone
          : null,

      // Never send the stored resume URL
      // to the browser.
      resumeurl: null,
    };

    // --------------------------------------------------
    // 8. RETURN PRIVACY-FILTERED PROFILE
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        candidate:
          safeCandidate,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "CANDIDATE PROFILE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load candidate profile.",
      },
      { status: 500 }
    );
  }
}