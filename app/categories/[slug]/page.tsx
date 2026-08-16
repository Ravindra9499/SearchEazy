export const dynamic =
  "force-dynamic";

import type { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryContent: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    matchKeywords: string[];
    seoContent: string;
    popularSearches: {
      label: string;
      href: string;
    }[];
  }
> = {
  healthcare: {
    title:
      "Healthcare Jobs",

    description:
      "Explore healthcare careers including nursing, allied health, therapy, radiology, imaging, and healthcare staffing jobs on SearchEezy.",

    keywords: [
      "healthcare jobs",
      "nursing jobs",
      "allied health jobs",
      "therapist jobs",
      "radiology jobs",
    ],

    matchKeywords: [
      "healthcare",
      "therapist",
      "physical therapist",
      "nurse",
      "rn",
      "lpn",
      "radiology",
      "x-ray",
      "echo",
      "vascular",
      "pharmacist",
      "clinician",
      "technologist",
      "medical",
    ],

    seoContent:
      "SearchEezy helps healthcare professionals discover opportunities across nursing, allied health, radiology, imaging, therapy, travel healthcare, rehabilitation, and healthcare staffing organizations. Browse healthcare employers actively hiring for hospitals, outpatient clinics, rehabilitation centers, staffing agencies, and remote healthcare positions.",

    popularSearches: [
      {
        label:
          "Remote Healthcare Jobs",
        href:
          "/categories/remote",
      },

      {
        label:
          "Travel Healthcare Careers",
        href:
          "/categories/healthcare",
      },

      {
        label:
          "Therapist Jobs",
        href:
          "/categories/healthcare",
      },
    ],
  },

  "software-engineering": {
    title:
      "Software Engineering Jobs",

    description:
      "Find frontend, backend, full stack, cloud, DevOps, and remote software engineering jobs.",

    keywords: [
      "software engineer jobs",
      "developer jobs",
      "frontend jobs",
      "backend jobs",
    ],

    matchKeywords: [
      "software",
      "developer",
      "engineer",
      "frontend",
      "backend",
      "react",
      "next.js",
      "javascript",
      "typescript",
      "devops",
      "cloud",
    ],

    seoContent:
      "Explore software engineering opportunities including frontend, backend, full stack, DevOps, cloud computing, React, Next.js, JavaScript, TypeScript, and remote engineering careers. SearchEezy connects technology employers with experienced engineering talent across startups, SaaS companies, staffing firms, and enterprise organizations.",

    popularSearches: [
      {
        label:
          "Remote Software Jobs",
        href:
          "/categories/remote",
      },

      {
        label:
          "Frontend Developer Jobs",
        href:
          "/categories/software-engineering",
      },

      {
        label:
          "Cloud & DevOps Jobs",
        href:
          "/categories/software-engineering",
      },
    ],
  },

  construction: {
    title:
      "Construction Jobs",

    description:
      "Search construction management and skilled trade careers.",

    keywords: [
      "construction jobs",
      "field engineer jobs",
    ],

    matchKeywords: [
      "construction",
      "civil",
      "site engineer",
      "project manager",
      "builder",
      "contractor",
    ],

    seoContent:
      "Find construction management, skilled trades, civil engineering, field engineering, site supervision, and contractor opportunities across commercial, residential, and industrial projects.",

    popularSearches: [
      {
        label:
          "Project Manager Jobs",
        href:
          "/categories/construction",
      },

      {
        label:
          "Civil Engineering Careers",
        href:
          "/categories/construction",
      },

      {
        label:
          "Field Engineer Jobs",
        href:
          "/categories/construction",
      },
    ],
  },

  manufacturing: {
    title:
      "Manufacturing Jobs",

    description:
      "Explore manufacturing engineering and industrial careers.",

    keywords: [
      "manufacturing jobs",
      "industrial jobs",
    ],

    matchKeywords: [
      "manufacturing",
      "production",
      "factory",
      "industrial",
      "operations",
      "warehouse",
    ],

    seoContent:
      "Search manufacturing and industrial careers including production, warehouse operations, process engineering, factory management, logistics, industrial operations, and supply chain opportunities.",

    popularSearches: [
      {
        label:
          "Industrial Operations Jobs",
        href:
          "/categories/manufacturing",
      },

      {
        label:
          "Warehouse Careers",
        href:
          "/categories/manufacturing",
      },

      {
        label:
          "Production Engineering Jobs",
        href:
          "/categories/manufacturing",
      },
    ],
  },

  remote: {
    title:
      "Remote Jobs",

    description:
      "Find remote and work from home opportunities.",

    keywords: [
      "remote jobs",
      "work from home jobs",
    ],

    matchKeywords: [
      "remote",
      "work from home",
      "hybrid",
      "virtual",
    ],

    seoContent:
      "Explore remote careers across healthcare, technology, staffing, engineering, administration, recruiting, and professional services. SearchEezy helps employers connect with remote talent across multiple industries and locations.",

    popularSearches: [
      {
        label:
          "Remote Software Jobs",
        href:
          "/categories/software-engineering",
      },

      {
        label:
          "Remote Healthcare Jobs",
        href:
          "/categories/healthcare",
      },

      {
        label:
          "Work From Home Careers",
        href:
          "/categories/remote",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const category =
    categoryContent[
      slug
    ];

  if (!category) {
    return {
      title:
        "SearchEezy Jobs",
    };
  }

  return {
    title:
      `${category.title} | SearchEezy`,

    description:
      category.description,

    keywords:
      category.keywords,

    alternates: {
      canonical:
        `/categories/${slug}`,
    },

    openGraph: {
      title:
        `${category.title} | SearchEezy`,

      description:
        category.description,

      url:
        `https://www.searcheezy.com/categories/${slug}`,

      type:
        "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: Props) {
  const {
    slug,
  } = await params;

  const category =
    categoryContent[
      slug
    ];

  if (!category) {
    return (
      <div
        style={{
          padding:
            "60px",
          textAlign:
            "center",
        }}
      >
        Category not found
      </div>
    );
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs`,
    {
      cache:
        "no-store",
    }
  );

  const jobs =
    await res.json();

    const filteredJobs =
    jobs.filter(
      (job: any) => {
        if (slug === "remote") {
          return (
            job.jobType ===
              "Remote" ||
            job.jobType ===
              "Hybrid"
          );
        }

        const categoryMap: Record<
          string,
          string
        > = {
          healthcare:
            "Healthcare",

          "software-engineering":
            "Software Engineering",

          construction:
            "Construction",

          manufacturing:
            "Manufacturing",
        };

        return (
          job.category ===
          categoryMap[slug]
        );
      }
    );

  return (
    <div
      style={{
        background:
          "#f5f7fb",
        minHeight:
          "100vh",
        padding:
          "50px 20px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "0 auto",
        }}
      >
        <a href="/">
          <button
            style={{
              background:
                "white",
              border:
                "1px solid #d1d5db",
              padding:
                "10px 16px",
              borderRadius:
                "10px",
              cursor:
                "pointer",
              marginBottom:
                "25px",
              fontWeight:
                "bold",
            }}
          >
            ← Back to Home
          </button>
        </a>

        <div
          style={{
            background:
              "linear-gradient(135deg, #111827, #1e3a8a)",
            borderRadius:
              "24px",
            padding:
              "50px 35px",
            color:
              "white",
            marginBottom:
              "35px",
          }}
        >
          <h1
            style={{
              fontSize:
                "42px",
              marginBottom:
                "20px",
            }}
          >
            {category.title}
          </h1>

          <p
            style={{
              fontSize:
                "18px",
              lineHeight:
                "1.8",
              color:
                "#dbeafe",
              maxWidth:
                "900px",
            }}
          >
            {category.description}
          </p>

          <div
            style={{
              marginTop:
                "24px",
              display:
                "inline-block",
              background:
                "rgba(255,255,255,0.15)",
              padding:
                "12px 18px",
              borderRadius:
                "14px",
              fontWeight:
                "bold",
              fontSize:
                "16px",
            }}
          >
            {filteredJobs.length} Jobs Available
          </div>
        </div>

        {/* SEO CONTENT */}

        <div
          style={{
            background:
              "white",
            borderRadius:
              "20px",
            padding:
              "30px",
            marginBottom:
              "35px",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginBottom:
                "18px",
              color:
                "#111827",
            }}
          >
            Explore {category.title}
          </h2>

          <p
            style={{
              color:
                "#4b5563",
              lineHeight:
                "1.9",
              fontSize:
                "16px",
            }}
          >
            {
              category.seoContent
            }
          </p>
        </div>

        {/* POPULAR SEARCHES */}

        <div
          style={{
            background:
              "white",
            borderRadius:
              "20px",
            padding:
              "30px",
            marginBottom:
              "35px",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginBottom:
                "20px",
              color:
                "#111827",
            }}
          >
            Popular Searches
          </h2>

          <div
            style={{
              display:
                "flex",
              gap: "14px",
              flexWrap:
                "wrap",
            }}
          >
            {category.popularSearches.map(
              (
                item
              ) => (
                <a
                  key={
                    item.label
                  }
                  href={
                    item.href
                  }
                  style={{
                    textDecoration:
                      "none",
                    background:
                      "#eff6ff",
                    color:
                      "#1d4ed8",
                    padding:
                      "12px 18px",
                    borderRadius:
                      "999px",
                    fontWeight:
                      "bold",
                    fontSize:
                      "14px",
                  }}
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>

        {filteredJobs.length ===
        0 ? (
          <div
            style={{
              background:
                "white",
              padding:
                "40px",
              borderRadius:
                "20px",
              textAlign:
                "center",
            }}
          >
            No jobs found in this category yet.
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap:
                "22px",
            }}
          >
            {filteredJobs.map(
              (job: any) => (
                <a
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  style={{
                    textDecoration:
                      "none",
                    color:
                      "inherit",
                    display:
                      "block",
                  }}
                >
                  <div
                    style={{
                      background:
                        "white",
                      borderRadius:
                        "20px",
                      padding:
                        "24px",
                      boxShadow:
                        "0 4px 18px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h2
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      {job.title}
                    </h2>

                    <p
                      style={{
                        color:
                          "#2563eb",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {job.company}
                    </p>

                    <p
                      style={{
                        color:
                          "#6b7280",
                      }}
                    >
                      📍 {job.location}
                    </p>
                  </div>
                </a>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}