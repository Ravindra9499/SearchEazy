"use client";

import "./page.css";

import {
  useEffect,
  useState,
} from "react";

import Head from "next/head";

import { useParams } from "next/navigation";

import { supabase } from "../../lib/supabase";

export default function JobDetailsPage() {
  const params =
    useParams();

  const jobId =
    params.id;

  const [job, setJob] =
    useState<any>(null);

  const [user, setUser] =
    useState<any>(null);

  const [role, setRole] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    currentTitle,
    setCurrentTitle,
  ] = useState("");

  const [skills, setSkills] =
    useState("");

  const [
    experience,
    setExperience,
  ] = useState("");

  const [location, setLocation] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [
    education,
    setEducation,
  ] = useState("");

  const [remote, setRemote] =
    useState(false);

  const [
    coverLetter,
    setCoverLetter,
  ] = useState("");

  const [
    resumeFile,
    setResumeFile,
  ] = useState<File | null>(
    null
  );

  const [
    screeningAnswers,
    setScreeningAnswers,
  ] = useState<{
    [key: string]: string;
  }>({});

  const [loading, setLoading] =
    useState(true);

  const [
    relatedJobs,
    setRelatedJobs,
  ] = useState<any[]>([]);

  const [
    companyJobs,
    setCompanyJobs,
  ] = useState<any[]>([]);

  useEffect(() => {
    fetchJob();

    getUser();
  }, []);

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
            `/api/profile?userId=${user.id}`
          );

        const profile =
          await res.json();

        setRole(
          profile.role
        );
      }
    };

  const fetchJob =
    async () => {
      try {
        const res =
          await fetch(
            `/api/jobs/${jobId}`
          );

        const data =
          await res.json();

        setJob(data);

        fetchRelatedJobs(
          data
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const fetchRelatedJobs =
    async (
      currentJob: any
    ) => {
      try {
        const res =
          await fetch(
            "/api/jobs"
          );

        const allJobs =
          await res.json();

        const normalize =
          (
            value: any
          ) =>
            String(
              value || ""
            )
              .trim()
              .toLowerCase();

        const similarJobs =
          allJobs
            .filter(
              (
                item: any
              ) =>
                String(
                  item.id
                ) !==
                  String(
                    currentJob.id
                  ) &&
                (
                  normalize(
                    item.jobType
                  ) ===
                    normalize(
                      currentJob.jobType
                    ) ||
                  normalize(
                    item.location
                  ) ===
                    normalize(
                      currentJob.location
                    ) ||
                  normalize(
                    item.title
                  ).includes(
                    normalize(
                      currentJob.title
                    )
                  )
                )
            )
            .slice(0, 4);

        const sameCompanyJobs =
          allJobs
            .filter(
              (
                item: any
              ) =>
                String(
                  item.id
                ) !==
                  String(
                    currentJob.id
                  ) &&
                normalize(
                  item.company
                ) ===
                  normalize(
                    currentJob.company
                  )
            )
            .slice(0, 4);

        setRelatedJobs(
          similarJobs
        );

        setCompanyJobs(
          sameCompanyJobs
        );
      } catch (error) {
        console.error(
          "RELATED JOBS ERROR:",
          error
        );
      }
    };

  const handleAnswerChange =
    (
      question: string,
      value: string
    ) => {
      setScreeningAnswers(
        (prev) => ({
          ...prev,

          [question]:
            value,
        })
      );
    };

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        let resumeLink = "";

        if (resumeFile) {
          const formData =
            new FormData();

          formData.append(
            "file",
            resumeFile
          );

          const uploadRes =
            await fetch(
              "/api/upload-resume",
              {
                method:
                  "POST",

                body:
                  formData,
              }
            );

          const uploadData =
            await uploadRes.json();

          resumeLink =
            uploadData.fileUrl;
        }

        const res =
          await fetch(
            "/api/applications",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  name,

                  email,

                  currentTitle,

                  skills,

                  experience,

                  location,

                  zipCode,

                  education,

                  remote,

                  coverLetter,

                  resumeLink,

                  screeningAnswers:
                    JSON.stringify(
                      screeningAnswers
                    ),

                  jobId,
                }
              ),
            }
          );

        const result =
          await res.json();

        if (res.ok) {
          alert(
            "Application submitted successfully!"
          );

          setName("");
          setEmail("");
          setCurrentTitle("");
          setSkills("");
          setExperience("");
          setLocation("");
          setZipCode("");
          setEducation("");
          setRemote(false);
          setCoverLetter("");
          setResumeFile(
            null
          );

          setScreeningAnswers(
            {}
          );
        } else {
          alert(
            result.error ||
              "Failed to submit application"
          );
        }
      } catch (error) {
        console.error(error);

        alert(
          "Something went wrong"
        );
      }
    };

  const jobPostingSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "JobPosting",

    title:
      job?.title ||
      "Job Opening",

    description:
      job?.description
        ?.replace(
          /<[^>]*>/g,
          ""
        ) ||
      "Job opportunity available on SearchEezy.",

    datePosted:
      job?.created_at ||
      new Date().toISOString(),

    hiringOrganization:
      {
        "@type":
          "Organization",

        name:
          job?.company ||
          "SearchEezy Employer",

        sameAs:
          "https://www.searcheezy.com",
      },

    employmentType:
      (
        job?.jobType ||
        "FULL_TIME"
      )
        .replace(
          "-",
          "_"
        )
        .toUpperCase(),

    jobLocation: {
      "@type":
        "Place",

      address: {
        "@type":
          "PostalAddress",

        addressLocality:
          job?.location ||
          "India",

        addressCountry:
          {
            "@type":
              "Country",

            name:
              "IN",
          },
      },
    },

    baseSalary:
      job?.salaryMin &&
      job?.salaryMax
        ? {
            "@type":
              "MonetaryAmount",

            currency:
              job?.currency ||
              "INR",

            value: {
              "@type":
                "QuantitativeValue",

              minValue:
                job?.salaryMin,

              maxValue:
                job?.salaryMax,

              unitText:
                job?.salaryType ||
                "YEAR",
            },
          }
        : undefined,

    validThrough:
      new Date(
        new Date().setDate(
          new Date().getDate() +
            30
        )
      )
        .toISOString()
        .split("T")[0],

    applicantLocationRequirements:
      {
        "@type":
          "Country",

        name:
          "India",
      },
  };

  if (loading) {
    return (
      <div
        style={{
          padding:
            "40px",

          textAlign:
            "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div
        style={{
          padding:
            "40px",

          textAlign:
            "center",
        }}
      >
        Job not found
      </div>
    );
  }

  const canApply =
    role ===
    "applicant";

  const seoTitle =
    `${job.title} at ${job.company} | SearchEezy Jobs`;

  const seoDescription =
    `${job.title} job opening at ${job.company} in ${job.location}. Apply now on SearchEezy.`;

  const canonicalUrl =
    `https://www.searcheezy.com/jobs/${job.id}`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta
          property="og:title"
          content={seoTitle}
        />

        <meta
          property="og:description"
          content={seoDescription}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={seoTitle}
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />
      </Head>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jobPostingSchema
            ),
        }}
      />

      <div
        style={{
          background:
            "#f5f7fb",

          minHeight:
            "100vh",

          padding:
            "40px 20px",

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
          {/* TOP BAR */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              marginBottom:
                "25px",

              flexWrap:
                "wrap",

              gap: "10px",
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

                  fontWeight:
                    "bold",
                }}
              >
                ← Back to Jobs
              </button>
            </a>

            <div
              style={{
                color:
                  "#6b7280",

                fontSize:
                  "14px",
              }}
            >
              SearchEezy Jobs
            </div>
          </div>

          {/* HERO CARD */}

          <div
            style={{
              background:
                "linear-gradient(to right, #1c4ed8, #2563eb)",

              borderRadius:
                "24px",

              padding:
                "30px",

              color:
                "white",

              marginBottom:
                "30px",

              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "flex-start",

                flexWrap:
                  "wrap",

                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    width:
                      "70px",

                    height:
                      "70px",

                    borderRadius:
                      "18px",

                    background:
                      "rgba(255,255,255,0.2)",

                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    fontSize:
                      "28px",

                    fontWeight:
                      "bold",

                    marginBottom:
                      "20px",
                  }}
                >
                  {job.company?.charAt(
                    0
                  )}
                </div>

                <h1
                  style={{
                    fontSize:
                      "36px",

                    marginBottom:
                      "12px",

                    fontWeight:
                      "bold",
                  }}
                >
                  {job.title}
                </h1>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "25px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "24px",
                      opacity: 0.95,
                      margin: 0,
                    }}
                  >
                    {job.company}
                  </h2>

                  {job.isverified && (
                    <div
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔ Verified Employer
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    flexWrap:
                      "wrap",

                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background:
                        "rgba(255,255,255,0.15)",

                      padding:
                        "10px 14px",

                      borderRadius:
                        "999px",
                    }}
                  >
                    📍 {job.location}
                  </div>

                  {job.category && (
  <div
    style={{
      background:
        "rgba(255,255,255,0.15)",
      padding:
        "10px 14px",
      borderRadius:
        "999px",
    }}
  >
    📂 {job.category}
  </div>
)}

                  {job.jobType && (
                    <div
                      style={{
                        background:
                          "rgba(255,255,255,0.15)",

                        padding:
                          "10px 14px",

                        borderRadius:
                          "999px",
                      }}
                    >
                      💼 {job.jobType}
                    </div>
                  )}

                  {job.salaryMin &&
                    job.salaryMax && (
                      <div
                        style={{
                          background:
                            "rgba(255,255,255,0.15)",

                          padding:
                            "10px 14px",

                          borderRadius:
                            "999px",
                        }}
                      >
                        💰{" "}
                        {getCurrencySymbol(
                          job.currency
                        )}
                        {Number(
                          job.salaryMin
                        ).toLocaleString(
                          "en-US"
                        )}
                        {" - "}
                        {getCurrencySymbol(
                          job.currency
                        )}
                        {Number(
                          job.salaryMax
                        ).toLocaleString(
                          "en-US"
                        )}
                        {" "}
                        {
                          job.salaryType
                        }
                      </div>
                    )}
                </div>
              </div>

              <div
                style={{
                  background:
                    "rgba(255,255,255,0.12)",

                  padding:
                    "14px 18px",

                  borderRadius:
                    "16px",

                  fontWeight:
                    "bold",
                }}
              >
                Active Job
              </div>
            </div>
          </div>

          {/* MAIN GRID */}

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",

              gap: "28px",
            }}
          >
            {/* LEFT */}

            <div>
              <div
                style={{
                  background:
                    "white",

                  borderRadius:
                    "22px",

                  padding:
                    "35px",

                  boxShadow:
                    "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <h2
                  style={{
                    marginBottom:
                      "25px",

                    fontSize:
                      "28px",

                    color:
                      "#111827",
                  }}
                >
                  Job Description
                </h2>

                <div
                  className="job-description"
                  style={{
                    lineHeight:
                      "1.9",

                    fontSize:
                      "17px",

                    color:
                      "#374151",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      job.description,
                  }}
                />
              </div>
            </div>

            {/* RIGHT */}

            <div>
              {canApply && (
                <div
                  style={{
                    background:
                      "white",

                    borderRadius:
                      "22px",

                    padding:
                      "30px",

                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.05)",

                    position:
                      "sticky",

                    top: "100px",
                  }}
                >
                  <h2
                    style={{
                      marginBottom:
                        "22px",

                      fontSize:
                        "26px",
                    }}
                  >
                    Apply Now
                  </h2>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                  >
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target
                            .value
                        )
                      }
                      required
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",

                        fontSize:
                          "15px",
                      }}
                    />

                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target
                            .value
                        )
                      }
                      required
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",

                        fontSize:
                          "15px",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Current Job Title"
                      value={
                        currentTitle
                      }
                      onChange={(e) =>
                        setCurrentTitle(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <textarea
                      placeholder="Skills (React, JavaScript, SQL, etc)"
                      value={skills}
                      onChange={(e) =>
                        setSkills(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        minHeight:
                          "100px",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Years of Experience"
                      value={
                        experience
                      }
                      onChange={(e) =>
                        setExperience(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Location / City"
                      value={
                        location
                      }
                      onChange={(e) =>
                        setLocation(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={
                        zipCode
                      }
                      onChange={(e) =>
                        setZipCode(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <textarea
                      placeholder="Education"
                      value={
                        education
                      }
                      onChange={(e) =>
                        setEducation(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        minHeight:
                          "100px",

                        padding:
                          "14px",

                        marginBottom:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",
                      }}
                    />

                    <div
                      style={{
                        marginBottom:
                          "20px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: "10px",

                          fontWeight:
                            "bold",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            remote
                          }
                          onChange={(
                            e
                          ) =>
                            setRemote(
                              e
                                .target
                                .checked
                            )
                          }
                        />
                        Open to Remote Work
                      </label>
                    </div>

                    {job.screeningQuestions &&
                      job.screeningQuestions
                        .split("\n")
                        .filter(
                          (
                            q: string
                          ) =>
                            q.trim() !==
                            ""
                        )
                        .map(
                          (
                            question: string,
                            index: number
                          ) => (
                            <div
                              key={
                                index
                              }
                              style={{
                                marginBottom:
                                  "18px",
                              }}
                            >
                              <p
                                style={{
                                  fontWeight:
                                    "bold",

                                  marginBottom:
                                    "8px",
                                }}
                              >
                                {
                                  question
                                }
                              </p>

                              <textarea
                                value={
                                  screeningAnswers[
                                    question
                                  ] ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleAnswerChange(
                                    question,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                required
                                style={{
                                  width:
                                    "100%",

                                  minHeight:
                                    "110px",

                                  padding:
                                    "12px",

                                  borderRadius:
                                    "12px",

                                  border:
                                    "1px solid #d1d5db",
                                }}
                              />
                            </div>
                          )
                        )}

                    <div
                      style={{
                        marginBottom:
                          "18px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",

                          marginBottom:
                            "8px",

                          fontWeight:
                            "bold",
                        }}
                      >
                        Upload Resume
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setResumeFile(
                            e.target
                              .files?.[0] ||
                              null
                          )
                        }
                        required
                        style={{
                          width:
                            "100%",

                          padding:
                            "12px",

                          border:
                            "1px solid #d1d5db",

                          borderRadius:
                            "12px",

                          background:
                            "white",
                        }}
                      />
                    </div>

                    <textarea
                      placeholder="Cover Letter"
                      value={
                        coverLetter
                      }
                      onChange={(e) =>
                        setCoverLetter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        minHeight:
                          "150px",

                        padding:
                          "14px",

                        marginBottom:
                          "20px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #d1d5db",

                        fontSize:
                          "15px",
                      }}
                    />

                    <button
                      type="submit"
                      style={{
                        width:
                          "100%",

                        background:
                          "#1c4ed8",

                        color:
                          "white",

                        border:
                          "none",

                        padding:
                          "16px",

                        borderRadius:
                          "14px",

                        cursor:
                          "pointer",

                        fontWeight:
                          "bold",

                        fontSize:
                          "16px",
                      }}
                    >
                      Submit Application
                    </button>
                  </form>
                </div>
              )}
            </div>
      </div>

      {(relatedJobs.length > 0 ||
        companyJobs.length > 0) && (
        <div
          style={{
            marginTop: "50px",
          }}
        >
          {relatedJobs.length > 0 && (
            <div
              style={{
                marginBottom: "40px",
              }}
            >
              <h2
                style={{
                  fontSize: "30px",
                  marginBottom: "22px",
                  color: "#111827",
                }}
              >
                Related Jobs
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                {relatedJobs.map(
                  (relatedJob) => (
                    <a
                      key={relatedJob.id}
                      href={`/jobs/${relatedJob.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          borderRadius: "20px",
                          padding: "24px",
                          boxShadow:
                            "0 4px 18px rgba(0,0,0,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            marginBottom: "12px",
                            color: "#111827",
                          }}
                        >
                          {relatedJob.title}
                        </h3>

                        <p
                          style={{
                            color: "#2563eb",
                            fontWeight: "bold",
                            marginBottom: "10px",
                          }}
                        >
                          {relatedJob.company}
                        </p>

                        <p
                          style={{
                            color: "#6b7280",
                          }}
                        >
                          📍 {relatedJob.location}
                        </p>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
          )}

          {companyJobs.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: "30px",
                  marginBottom: "22px",
                  color: "#111827",
                }}
              >
                More Jobs From {job.company}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                {companyJobs.map(
                  (companyJob) => (
                    <a
                      key={companyJob.id}
                      href={`/jobs/${companyJob.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          borderRadius: "20px",
                          padding: "24px",
                          boxShadow:
                            "0 4px 18px rgba(0,0,0,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            marginBottom: "12px",
                            color: "#111827",
                          }}
                        >
                          {companyJob.title}
                        </h3>

                        <p
                          style={{
                            color: "#6b7280",
                          }}
                        >
                          📍 {companyJob.location}
                        </p>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</>

);
}
