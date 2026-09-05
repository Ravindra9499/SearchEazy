import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    /* -------------------------------------------------------
       1. VERIFY AUTHENTICATED USER
    ------------------------------------------------------- */

    const authHeader =
      req.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authHeader.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      authError ||
      !user
    ) {
      console.error(
        "RESUME SEARCH AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* -------------------------------------------------------
       2. VERIFY RECRUITER PROFILE
    ------------------------------------------------------- */

    const {
      data: recruiterProfile,
      error: recruiterError,
    } =
      await supabase
        .from("profiles")
        .select(
          "id, email, role, resumeSearchEnabled"
        )
        .eq(
          "id",
          user.id
        )
        .single();

    if (
      recruiterError ||
      !recruiterProfile
    ) {
      console.error(
        "RECRUITER PROFILE ERROR:",
        recruiterError
      );

      return NextResponse.json(
        {
          error:
            "Recruiter profile not found.",
        },
        {
          status: 403,
        }
      );
    }

    /* -------------------------------------------------------
       3. VERIFY EMPLOYER / RECRUITER ROLE
    ------------------------------------------------------- */

    if (
      recruiterProfile.role !==
      "employer"
    ) {
      return NextResponse.json(
        {
          error:
            "Resume Search is available only to authorized recruiters.",
        },
        {
          status: 403,
        }
      );
    }

    /* -------------------------------------------------------
       4. VERIFY RESUME SEARCH ACCESS
    ------------------------------------------------------- */

    if (
      recruiterProfile.resumeSearchEnabled !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "Resume Search access is not enabled for this recruiter.",
        },
        {
          status: 403,
        }
      );
    }

    /* -------------------------------------------------------
       5. READ SEARCH PARAMETERS
    ------------------------------------------------------- */

    const {
      searchParams,
    } = new URL(req.url);

    const keyword =
      searchParams
        .get("keyword")
        ?.trim()
        .toLowerCase() || "";

    const location =
      searchParams
        .get("location")
        ?.trim()
        .toLowerCase() || "";

    const remote =
      searchParams.get(
        "remote"
      );

    const workType =
      searchParams.get(
        "workType"
      );

    const radius =
      searchParams.get(
        "radius"
      );

    /* -------------------------------------------------------
       6. FETCH SEARCHABLE CANDIDATE PROFILES
       
       PRIVACY FILTERING IS PERFORMED SERVER-SIDE.
    ------------------------------------------------------- */

    let query =
      supabase
        .from(
          "candidate_profiles"
        )
        .select(`
          id,
          created_at,
          useremail,
          fullname,
          title,
          skills,
          experience,
          education,
          location,
          zipcode,
          resumeurl,
          summary,
          remote,
          first_name,
          last_name,
          phone,
          city,
          state,
          profile_headline,
          current_company,
          profession,
          availability_status,
          work_types,
          work_location,
          expected_salary,
          salary_type,
          notice_period,
          profile_visibility,
          show_email,
          show_phone,
          allow_resume_download,
          searchable,
          email_verified,
          phone_verified,
          candidate_verified,
          profile_completion,
          profile_views,
          recruiter_contacts,
          last_active,
          profile_updated_at
        `)
        .eq(
          "searchable",
          true
        )
        .neq(
          "profile_visibility",
          "private"
        );

    /* -------------------------------------------------------
       7. FETCH CANDIDATES
    ------------------------------------------------------- */

    const {
      data: candidates,
      error: candidatesError,
    } =
      await query;

    if (
      candidatesError
    ) {
      console.error(
        "RESUME SEARCH QUERY ERROR:",
        candidatesError
      );

      return NextResponse.json(
        {
          error:
            "Failed to search candidate profiles.",
        },
        {
          status: 500,
        }
      );
    }

    /* -------------------------------------------------------
       8. APPLY KEYWORD FILTER
    ------------------------------------------------------- */

    let filteredCandidates =
      candidates || [];

    if (
      keyword
    ) {
      filteredCandidates =
        filteredCandidates.filter(
          (candidate) => {
            const searchableText =
              [
                candidate.fullname,
                candidate.first_name,
                candidate.last_name,
                candidate.title,
                candidate.skills,
                candidate.experience,
                candidate.education,
                candidate.location,
                candidate.summary,
                candidate.profile_headline,
                candidate.current_company,
                candidate.profession,
                candidate.availability_status,
                candidate.work_location,
                candidate.notice_period,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
              keyword
            );
          }
        );
    }

    /* -------------------------------------------------------
       9. APPLY LOCATION FILTER
    ------------------------------------------------------- */

    if (
      location
    ) {
      filteredCandidates =
        filteredCandidates.filter(
          (candidate) => {
            const locationText =
              [
                candidate.location,
                candidate.city,
                candidate.state,
                candidate.zipcode,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return locationText.includes(
              location
            );
          }
        );
    }

    /* -------------------------------------------------------
       10. APPLY REMOTE FILTER
    ------------------------------------------------------- */

    if (
      remote ===
      "true"
    ) {
      filteredCandidates =
        filteredCandidates.filter(
          (candidate) =>
            candidate.remote ===
            true
        );
    }

    /* -------------------------------------------------------
       11. APPLY WORK TYPE FILTER
    ------------------------------------------------------- */

    if (
      workType
    ) {
      filteredCandidates =
        filteredCandidates.filter(
          (candidate) => {
            if (
              !Array.isArray(
                candidate.work_types
              )
            ) {
              return false;
            }

            return candidate.work_types.some(
              (type: string) =>
                type
                  .toLowerCase()
                  .includes(
                    workType.toLowerCase()
                  )
            );
          }
        );
    }

    /* -------------------------------------------------------
       12. RADIUS PARAMETER
       
       The existing Resume Search page handles
       its own location/radius logic.
       
       We preserve the parameter for compatibility.
    ------------------------------------------------------- */

    void radius;

    /* -------------------------------------------------------
       13. ENFORCE FIELD-LEVEL PRIVACY
    ------------------------------------------------------- */

    const safeCandidates =
      filteredCandidates.map(
        (candidate) => {
          const safeCandidate = {
            ...candidate,
          };

          /* -----------------------------------------------
             EMAIL PRIVACY
          ------------------------------------------------ */

          if (
            candidate.show_email !==
            true
          ) {
            safeCandidate.useremail =
              null;
          }

          /* -----------------------------------------------
             PHONE PRIVACY
          ------------------------------------------------ */

          if (
            candidate.show_phone !==
            true
          ) {
            safeCandidate.phone =
              null;
          }

          /* -----------------------------------------------
             RESUME PRIVACY
             
             IMPORTANT:
             The actual resume is NOT returned unless
             the candidate explicitly allows it.
             
             Even when allowed, the Resume Search page
             should use /api/resume-access to generate
             a short-lived signed URL.
          ------------------------------------------------ */

          if (
            candidate.allow_resume_download !==
            true
          ) {
            safeCandidate.resumeurl =
              null;
          }

          return safeCandidate;
        }
      );

    /* -------------------------------------------------------
       14. RETURN SAFE CANDIDATE DATA
    ------------------------------------------------------- */

    return NextResponse.json(
      {
        candidates:
          safeCandidates,
        total:
          safeCandidates.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "RESUME SEARCH API CRASH:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to perform resume search.",
      },
      {
        status: 500,
      }
    );
  }
}