import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(
  process.env.RESEND_API_KEY
);

async function verifyJobOwnership(
  jobId: number,
  userEmail: string
) {
  const {
    data: existingJob,
    error,
  } = await supabase
    .from("jobs")
    .select("id, userEmail")
    .eq("id", jobId)
    .single();

  if (
    error ||
    !existingJob
  ) {
    return {
      authorized: false,
      message:
        "Job not found",
    };
  }

  if (
    existingJob.userEmail
      ?.trim()
      ?.toLowerCase() !==
    userEmail
      ?.trim()
      ?.toLowerCase()
  ) {
    return {
      authorized: false,
      message:
        "Unauthorized job access",
    };
  }

  return {
    authorized: true,
  };
}

// GET jobs

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userEmail =
      searchParams.get("userEmail");

    console.log(
      "GET JOBS userEmail:",
      userEmail
    );

    let query = supabase
      .from("jobs")
      .select("*");

    // Employer-specific filtering

    if (
      userEmail &&
      userEmail !== "undefined"
    ) {
      query = query.eq(
        "userEmail",
        userEmail
      );
    }

    const { data, error } =
      await query.order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(
        "GET JOBS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    // ADD VERIFIED STATUS FROM PROFILES TABLE

    const jobsWithVerification =
      await Promise.all(
        (data || []).map(
          async (job) => {
            try {
              const {
                data: profile,
              } =
                await supabase
                  .from(
                    "profiles"
                  )
                  .select(
                    "isverified"
                  )
                  .eq(
                    "email",
                    job.userEmail
                  )
                  .single();

              return {
                ...job,

                isverified:
                  profile?.isverified ===
                  true,
              };
            } catch {
              return {
                ...job,

                isverified:
                  false,
              };
            }
          }
        )
      );

    console.log(
      "RETURNING JOBS:",
      jobsWithVerification?.map(
        (job) => ({
          id: job.id,
          title:
            job.title,
          userEmail:
            job.userEmail,
          isverified:
            job.isverified,
        })
      )
    );

    return NextResponse.json(
      jobsWithVerification
    );
  } catch (error) {
    console.error(
      "GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "GET failed",
      },
      { status: 500 }
    );
  }
}

// POST new job

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    console.log(
      "POST JOB BODY:",
      body
    );

    if (
      !body.title ||
      !body.company ||
      !body.location ||
      !body.userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required job fields",
        },
        { status: 400 }
      );
    }

    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .select("*")
        .eq(
          "email",
          body.userEmail
        )
        .single();

    if (profileError) {
      console.error(
        "PROFILE ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Employer profile not found",
        },
        { status: 500 }
      );
    }

    const isPremium =
      profile.subscriptionPlan ===
      "premium";

    if (!isPremium) {
      const remainingPosts =
        Number(
          profile.freePostsRemaining || 0
        );

      if (
        remainingPosts <=
        0
      ) {
        return NextResponse.json(
          {
            error:
              "Free job posting limit reached. Please upgrade your subscription.",
          },
          { status: 403 }
        );
      }
    }

    const { data, error } =
      await supabase
        .from("jobs")
        .insert([
          {
            title:
              body.title,

            company:
              body.company,

            location:
              body.location,

            description:
              body.description,

            jobType:
              body.jobType,

            category:
              body.category,

            salaryMin:
              body.salaryMin
                ? Number(
                    body.salaryMin
                  )
                : null,

            salaryMax:
              body.salaryMax
                ? Number(
                    body.salaryMax
                  )
                : null,

            salaryType:
              body.salaryType,

            currency:
              body.currency,

            screeningQuestions:
              body.screeningQuestions,

            companyLogo:
              body.companyLogo,

            verified:
              profile.isverified ===
              true,

            isverified:
              profile.isverified ===
              true,

            companyDescription:
              body.companyDescription,

            companyWebsite:
              body.companyWebsite,

            featured:
              body.featured,

            userEmail:
              body.userEmail,
          },
        ])
        .select()
        .single();

    if (error) {
      console.error(
        "POST ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "POST failed",
      },
      { status: 500 }
    );
  }
}

// DELETE job

export async function DELETE(
  req: Request
) {
  try {
    const body =
      await req.json();

    if (
      !body.userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Missing employer email",
        },
        { status: 403 }
      );
    }

    const ownership =
      await verifyJobOwnership(
        Number(body.id),
        body.userEmail
      );

    if (
      !ownership.authorized
    ) {
      return NextResponse.json(
        {
          error:
            ownership.message,
        },
        { status: 403 }
      );
    }

    const { data, error } =
      await supabase
        .from("jobs")
        .delete()
        .eq(
          "id",
          Number(body.id)
        )
        .select();

    if (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No matching job found to delete",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        "Job deleted",

      deletedJob:
        data[0],
    });
  } catch (error) {
    console.error(
      "DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "DELETE failed",
      },
      { status: 500 }
    );
  }
}

// PUT update job

export async function PUT(
  req: Request
) {
  try {
    const body =
      await req.json();

    if (
      !body.userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Missing employer email",
        },
        { status: 403 }
      );
    }

    const ownership =
      await verifyJobOwnership(
        Number(body.id),
        body.userEmail
      );

    if (
      !ownership.authorized
    ) {
      return NextResponse.json(
        {
          error:
            ownership.message,
        },
        { status: 403 }
      );
    }

    const { data, error } =
      await supabase
        .from("jobs")
        .update({
          title:
            body.title,

          company:
            body.company,

          location:
            body.location,

          description:
            body.description,

          jobType:
            body.jobType,

          category:
            body.category,

          salaryMin:
            body.salaryMin
              ? Number(
                  body.salaryMin
                )
              : null,

          salaryMax:
            body.salaryMax
              ? Number(
                  body.salaryMax
                )
              : null,

          salaryType:
            body.salaryType,

          currency:
            body.currency,

          screeningQuestions:
            body.screeningQuestions,
        })
        .eq(
          "id",
          Number(body.id)
        )
        .select()
        .single();

    if (error) {
      console.error(
        "PUT ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Job updated successfully",

      updatedJob:
        data,
    });
  } catch (error) {
    console.error(
      "PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "PUT failed",
      },
      { status: 500 }
    );
  }
}