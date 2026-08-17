"use client";

import JobCard from "./home/JobCard";
import Navbar from "./home/Navbar";
import SearchFilters from "./home/SearchFilters";
import FeaturedJobs from "./home/FeaturedJobs";
import JobsGrid from "./home/JobsGrid";
import CategoryFilters from "./home/CategoryFilters";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

export default function HomeClient({
  jobs,
}: {
  jobs: any[];
}) {
  const [user, setUser] =
    useState<any>(null);

  const [role, setRole] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [
    resumeSearchEnabled,
    setResumeSearchEnabled,
  ] = useState(false);

  const [displayJobs, setDisplayJobs] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [authReady, setAuthReady] =
    useState(false);

  const [savedJobs, setSavedJobs] =
    useState<number[]>([]);

  const [
    searchTitle,
    setSearchTitle,
  ] = useState("");

  const [
    searchLocation,
    setSearchLocation,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  useEffect(() => {
    let mounted = true;

    const getUser =
      async () => {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        setUser(user);

        if (user?.id) {
          const res =
            await fetch(
              `/api/profile?email=${user.email}`
            );

          const profile =
            await res.json();

          if (
            profile?.role
          ) {
            setRole(
              profile.role
            );
          }

          setIsAdmin(
            profile.isAdmin ===
              true
          );

          setResumeSearchEnabled(
            profile.resumeSearchEnabled ===
              true
          );

          if (
            profile.role ===
            "applicant"
          ) {
            const {
              data: savedData,
            } =
              await supabase
                .from(
                  "saved_jobs"
                )
                .select(
                  "jobId"
                )
                .eq(
                  "userEmail",
                  user.email
                );

            if (
              savedData
            ) {
              setSavedJobs(
                savedData.map(
                  (
                    item
                  ) =>
                    Number(
                      item.jobId
                    )
                )
              );
            }
          }

          if (
            profile.role ===
            "employer"
          ) {
            const jobsRes =
              await fetch(
                `/api/jobs?userEmail=${user.email}`,
                {
                  cache:
                    "no-store",
                }
              );

            const employerJobs =
              await jobsRes.json();

            setDisplayJobs(
              employerJobs
            );
          } else {
            setDisplayJobs(jobs);
          }
        } else {
          setDisplayJobs(jobs);
        }

        if (mounted) {
          setLoading(false);
          setAuthReady(true);
        }
      };

    getUser();

    return () => {
      mounted = false;
    };
  }, [jobs]);

  const toggleSaveJob =
    async (
      jobId: number,
      e: any
    ) => {
      e.stopPropagation();

      if (!user) {
        alert(
          "Please login as applicant"
        );

        return;
      }

      const alreadySaved =
        savedJobs.includes(
          jobId
        );

      if (
        alreadySaved
      ) {
        await supabase
          .from(
            "saved_jobs"
          )
          .delete()
          .eq(
            "userEmail",
            user.email
          )
          .eq(
            "jobId",
            String(jobId)
          );

        setSavedJobs(
          savedJobs.filter(
            (id) =>
              id !==
              jobId
          )
        );
      } else {
        await supabase
          .from(
            "saved_jobs"
          )
          .insert([
            {
              userEmail:
                user.email,
              jobId:
                String(jobId),
            },
          ]);

        setSavedJobs([
          ...savedJobs,
          jobId,
        ]);
      }
    };

  const getCurrencySymbol =
    (
      currency: string
    ) => {
      switch (
        currency
      ) {
        case "USD":
          return "$";

        case "INR":
          return "₹";

        case "EUR":
          return "€";

        case "GBP":
          return "£";

        default:
          return "$";
      }
    };

  const categories =
    useMemo(
      () => [
        "All",

        ...Array.from(
          new Set(
            displayJobs
              .map(
                (job) =>
                  job.category
              )
              .filter(Boolean)
          )
        ),
      ],
      [displayJobs]
    );

  const filteredJobs =
    useMemo(
      () =>
        displayJobs.filter(
          (job) => {
            const searchValue =
              searchTitle.toLowerCase();

           const matchesSearch =
  job.title
    ?.toLowerCase()
    .includes(
      searchValue
    ) ||
  job.company
    ?.toLowerCase()
    .includes(
      searchValue
    ) ||
  job.description
    ?.toLowerCase()
    .includes(
      searchValue
    ) ||
  job.category
    ?.toLowerCase()
    .includes(
      searchValue
    ) ||
  job.jobType
    ?.toLowerCase()
    .includes(
      searchValue
    );

            const matchesLocation =
              job.location
                ?.toLowerCase()
                .includes(
                  searchLocation.toLowerCase()
                );

            const matchesCategory =
              selectedCategory ===
                "All" ||
              job.category ===
                selectedCategory;

            return (
              matchesSearch &&
              matchesLocation &&
              matchesCategory
            );
          }
        ),
      [
        displayJobs,
        searchTitle,
        searchLocation,
        selectedCategory,
      ]
    );

  const featuredJobs =
    useMemo(
      () =>
        filteredJobs.filter(
          (job) =>
            job.featured
        ),
      [filteredJobs]
    );

  const regularJobs =
    useMemo(
      () =>
        filteredJobs.filter(
          (job) =>
            !job.featured
        ),
      [filteredJobs]
    );

  if (!authReady) {
    return (
      <div
        style={{
          background:
            "#f5f7fb",
          minHeight:
            "100vh",
        }}
      />
    );
  }

  return (
    <div
      style={{
        background:
          "#f5f7fb",
        minHeight:
          "100vh",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <Navbar
        user={user}
        role={role}
        isAdmin={isAdmin}
        resumeSearchEnabled={
          resumeSearchEnabled
        }
      />

      <SearchFilters
        searchTitle={
          searchTitle
        }
        setSearchTitle={
          setSearchTitle
        }
        searchLocation={
          searchLocation
        }
        setSearchLocation={
          setSearchLocation
        }
        filteredJobs={
          filteredJobs
        }
      />

      {/* SEO CONTENT SECTIONS */}

      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "0 auto",
          padding:
            "10px 20px 20px",
        }}
      >
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
              "30px",
          }}
        >
          <h1
            style={{
              fontSize:
                "42px",
              marginBottom:
                "20px",
              lineHeight:
                "1.2",
            }}
          >
            Find Healthcare, Technology & Remote Jobs with SearchEezy
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
            SearchEezy connects employers with top talent across healthcare staffing,
            software engineering, allied health, remote technology, travel healthcare,
            and professional recruitment industries.
          </p>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom:
              "35px",
          }}
        >
          <div
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding:
                "24px",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                color:
                  "#111827",
                marginBottom:
                  "14px",
              }}
            >
              Healthcare Jobs
            </h2>

            <p
              style={{
                color:
                  "#6b7280",
                lineHeight:
                  "1.7",
              }}
            >
              Explore nursing, allied health, radiology,
              therapist, pharmacist, and healthcare staffing opportunities.
            </p>
          </div>

          <div
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding:
                "24px",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                color:
                  "#111827",
                marginBottom:
                  "14px",
              }}
            >
              Software Engineering Jobs
            </h2>

            <p
              style={{
                color:
                  "#6b7280",
                lineHeight:
                  "1.7",
              }}
            >
              Discover frontend, backend, full stack,
              cloud, DevOps, and remote software engineering careers.
            </p>
          </div>

          <div
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding:
                "24px",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                color:
                  "#111827",
                marginBottom:
                  "14px",
              }}
            >
              Remote & Staffing Careers
            </h2>

            <p
              style={{
                color:
                  "#6b7280",
                lineHeight:
                  "1.7",
              }}
            >
              Search remote opportunities, staffing assignments,
              contract positions, and nationwide recruitment openings.
            </p>
          </div>
        </div>
      </div>

      {/* SEO LINK HUBS */}

      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "0 auto",
          padding:
            "0 20px 40px",
        }}
      >
        {/* LOCATIONS */}

        <div
          style={{
            background:
              "white",
            borderRadius:
              "22px",
            padding:
              "30px",
            marginBottom:
              "28px",
            boxShadow:
              "0 2px 14px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginBottom:
                "18px",
              color:
                "#111827",
              fontSize:
                "28px",
            }}
          >
            Browse Jobs By Location
          </h2>

          <div
            style={{
              display:
                "flex",
              flexWrap:
                "wrap",
              gap: "14px",
            }}
          >
            {[
  "texas",
  "california",
  "florida",
  "remote",
  "dallas",
  "houston",
  "austin",
].map(
              (location) => (
                <a
                  key={location}
                  href={`/locations/${location}`}
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
                    textTransform:
                      "capitalize",
                  }}
                >
                  {location} Jobs
                </a>
              )
            )}
          </div>
        </div>

        {/* CATEGORIES */}

        <div
          style={{
            background:
              "white",
            borderRadius:
              "22px",
            padding:
              "30px",
            boxShadow:
              "0 2px 14px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginBottom:
                "18px",
              color:
                "#111827",
              fontSize:
                "28px",
            }}
          >
            Popular Job Categories
          </h2>

          <div
            style={{
              display:
                "flex",
              flexWrap:
                "wrap",
              gap: "14px",
            }}
          >
            {[
              {
                label:
                  "Healthcare Jobs",
                href:
                  "/categories/healthcare",
              },

              {
                label:
                  "Software Engineering",
                href:
                  "/categories/software-engineering",
              },

              {
                label:
                  "Remote Jobs",
                href:
                  "/categories/remote",
              },

              {
                label:
                  "Construction Jobs",
                href:
                  "/categories/construction",
              },

              {
                label:
                  "Manufacturing Jobs",
                href:
                  "/categories/manufacturing",
              },
            ].map(
              (item) => (
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
                      "#ecfeff",
                    color:
                      "#0f766e",
                    padding:
                      "12px 18px",
                    borderRadius:
                      "999px",
                    fontWeight:
                      "bold",
                  }}
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "0 auto",
          padding:
            "0 20px 30px",
        }}
      >
        <CategoryFilters
          categories={
            categories
          }
          selectedCategory={
            selectedCategory
          }
          setSelectedCategory={
            setSelectedCategory
          }
        />
      </div>

      {/* JOBS */}

      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "0 auto",
          padding:
            "0 20px 50px",
        }}
      >
        <JobsGrid
          loading={loading}
          filteredJobs={
            filteredJobs
          }
          featuredJobs={
            featuredJobs
          }
          regularJobs={
            regularJobs
          }
          role={role}
          savedJobs={
            savedJobs
          }
          toggleSaveJob={
            toggleSaveJob
          }
          getCurrencySymbol={
            getCurrencySymbol
          }
        />
      </div>
    </div>
  );
}