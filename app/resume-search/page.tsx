"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

export default function ResumeSearchPage() {
  const [loading, setLoading] =
    useState(true);

  const [authorized, setAuthorized] =
    useState(false);

  const [
    recruiterEmail,
    setRecruiterEmail,
  ] = useState("");

  const [
    candidates,
    setCandidates,
  ] = useState<any[]>([]);

  const [
    filteredCandidates,
    setFilteredCandidates,
  ] = useState<any[]>([]);

  const [keyword, setKeyword] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [radius, setRadius] =
    useState("25");

  const [
    remoteOnly,
    setRemoteOnly,
  ] = useState(false);

  const [
    experienceFilter,
    setExperienceFilter,
  ] = useState("");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/login";

        return;
      }

      const res =
        await fetch(
          `/api/profile?userId=${user.id}`
        );

      const profile =
        await res.json();

      if (
        !profile.resumeSearchEnabled
      ) {
        alert(
          "Resume search is only available for premium recruiters."
        );

        window.location.href =
          "/";

        return;
      }

      if (
        !user.email
      ) {
        alert(
          "Recruiter email verification failed."
        );

        window.location.href =
          "/";

        return;
      }

      setRecruiterEmail(
        user.email
      );

      setAuthorized(
        true
      );

      await loadCandidates();

      setLoading(false);
    };

  const loadCandidates =
    async () => {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session?.access_token
        ) {
          alert(
            "Your recruiter session has expired. Please login again."
          );

          window.location.href =
            "/login";

          return;
        }

        const res =
          await fetch(
            "/api/resume-search",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
              cache:
                "no-store",
            }
          );

        const result =
          await res.json();

        if (!res.ok) {
          console.error(
            "RESUME SEARCH API ERROR:",
            result
          );

          alert(
            result?.error ||
              "Unable to load recruiter candidate database."
          );

          if (
            res.status === 401 ||
            res.status === 403
          ) {
            window.location.href =
              "/";
          }

          return;
        }

        const data =
          Array.isArray(
            result?.candidates
          )
            ? result.candidates
            : [];

        setCandidates(data);

        setFilteredCandidates(
          data
        );
      } catch (error) {
        console.error(
          "RESUME SEARCH LOAD ERROR:",
          error
        );

        alert(
          "Failed to load candidate profiles."
        );
      }
    };

  const handleSearch =
    () => {
      let filtered = [
        ...candidates,
      ];

      const cleanKeyword =
        keyword
          .trim()
          .toLowerCase();

      const cleanLocation =
        location
          .trim()
          .toLowerCase();

      const cleanExperience =
        experienceFilter
          .trim()
          .toLowerCase();

      filtered = filtered.map(
        (candidate) => {
          let score = 0;

          if (
            cleanKeyword
          ) {
            const fullname =
              candidate.fullname?.toLowerCase() ||
              "";

            const title =
              candidate.title?.toLowerCase() ||
              "";

            const skills =
              candidate.skills?.toLowerCase() ||
              "";

            const summary =
              candidate.summary?.toLowerCase() ||
              "";

            const keywordWords =
              cleanKeyword.split(
                " "
              );

            let matched =
              false;

            keywordWords.forEach(
              (
                word: string
              ) => {
                if (
                  fullname.includes(
                    word
                  )
                ) {
                  score += 10;
                  matched = true;
                }

                if (
                  title.includes(
                    word
                  )
                ) {
                  score += 25;
                  matched = true;
                }

                if (
                  skills.includes(
                    word
                  )
                ) {
                  score += 40;
                  matched = true;
                }

                if (
                  summary.includes(
                    word
                  )
                ) {
                  score += 8;
                  matched = true;
                }

                const candidateEmail =
                  candidate.useremail?.toLowerCase() ||
                  "";

                if (
                  candidateEmail.includes(
                    word
                  )
                ) {
                  score += 5;
                  matched = true;
                }
              }
            );

            if (
              !matched
            ) {
              score = -1;
            }
          }

          if (
            cleanLocation &&
            score !== -1
          ) {
            const candidateLocation =
              candidate.location?.toLowerCase() ||
              "";

            const candidateZip =
              candidate.zipcode?.toLowerCase() ||
              "";

            const locationMatch =
              candidateLocation.includes(
                cleanLocation
              ) ||
              candidateZip.includes(
                cleanLocation
              );

            if (
              !locationMatch
            ) {
              score = -1;
            } else {
              score += 15;
            }
          }

          if (
            cleanExperience &&
            score !== -1
          ) {
            const experience =
              candidate.experience?.toLowerCase() ||
              "";

            if (
              !experience.includes(
                cleanExperience
              )
            ) {
              score = -1;
            } else {
              score += 10;
            }
          }

          if (
            remoteOnly &&
            score !== -1
          ) {
            if (
              candidate.remote !==
              true
            ) {
              score = -1;
            } else {
              score += 5;
            }
          }

          let completionScore = 0;

          const completionFields = [
            candidate.fullname,
            candidate.title,
            candidate.skills,
            candidate.experience,
            candidate.education,
            candidate.location,
            candidate.summary,
            candidate.resumeurl,
          ];

          completionFields.forEach(
            (field) => {
              if (
                field &&
                String(field)
                  .trim()
                  .length > 0
              ) {
                completionScore += 1;
              }
            }
          );

          const profileCompletion =
            Math.round(
              (completionScore /
                completionFields.length) *
                100
            );

          score += Math.floor(
            profileCompletion / 10
          );

          if (
            candidate.resumeurl
          ) {
            score += 15;
          }

          return {
            ...candidate,
            searchScore:
              score,
            profileCompletion,
          };
        }
      );

      filtered =
        filtered.filter(
          (candidate) =>
            candidate.searchScore !==
            -1
        );

      filtered.sort(
        (a, b) =>
          b.searchScore -
          a.searchScore
      );

      setFilteredCandidates(
        filtered
      );
    };

  const saveCandidate =
    async (
      candidate: any
    ) => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "Please login first."
        );

        return;
      }

      const {
        data: existing,
      } =
        await supabase
          .from(
            "shortlisted_candidates"
          )
          .select("id")
          .eq(
            "recruiterEmail",
            user.email
          )
          .eq(
            "candidateId",
            candidate.id
          );

      if (
        existing &&
        existing.length > 0
      ) {
        alert(
          "Candidate already shortlisted."
        );

        return;
      }

      const { error } =
        await supabase
          .from(
            "shortlisted_candidates"
          )
          .insert([
            {
              recruiterEmail:
                user.email,

              candidateId:
                candidate.id,

              candidateEmail:
                candidate.useremail,

              candidateName:
                candidate.fullname,

              candidateTitle:
                candidate.title,

              candidateLocation:
                candidate.location,

              resumeUrl:
                candidate.resumeurl,
            },
          ]);

      if (error) {
        console.error(
          error
        );

        alert(
          "Failed to save candidate."
        );

        return;
      }

      alert(
        "Candidate shortlisted successfully!"
      );
    };

  const openResume = async (
    candidate: any
  ) => {
    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        alert(
          "Your recruiter session has expired. Please login again."
        );

        window.location.href =
          "/login";

        return;
      }

      if (!candidate?.id) {
        alert(
          "Candidate information is missing."
        );

        return;
      }

      // Open the tab immediately so the browser does not
      // block it while the secure API request is running.
      const newWindow =
        window.open(
          "about:blank",
          "_blank"
        );

      if (!newWindow) {
        alert(
          "Please allow pop-ups for SearchEezy to open resumes."
        );

        return;
      }

      newWindow.document.write(
        "<p style='font-family:Arial;padding:30px'>Opening secure resume...</p>"
      );

      const res =
        await fetch(
          `/api/resume-access?candidateId=${encodeURIComponent(
            String(candidate.id)
          )}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

      const result =
        await res.json();

      if (!res.ok) {
        newWindow.close();

        alert(
          result?.error ||
            "You are not authorized to view this resume."
        );

        return;
      }

      if (!result?.url) {
        newWindow.close();

        alert(
          "Secure resume URL was not generated."
        );

        return;
      }

      // The API returns a short-lived signed URL.
      newWindow.location.href =
        result.url;
    } catch (error) {
      console.error(
        "SECURE RESUME ACCESS ERROR:",
        error
      );

      alert(
        "Unable to open the resume. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding:
            "50px",
        }}
      >
        Loading recruiter database...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div
      style={{
        background:
          "#f5f7fb",

        minHeight:
          "100vh",

        padding:
          "40px",

        fontFamily:
          "Arial",
      }}
    >
      <div
        style={{
          maxWidth:
            "1500px",

          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            marginBottom:
              "30px",

            flexWrap:
              "wrap",

            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,

                color:
                  "#111827",

                fontSize:
                  "34px",
              }}
            >
              Resume Search
            </h1>

            <p
              style={{
                color:
                  "#6b7280",

                marginTop:
                  "8px",
              }}
            >
              Premium recruiter candidate database.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <a href="/shortlisted-candidates">
              <button
                style={{
                  background:
                    "#16a34a",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "14px 20px",

                  borderRadius:
                    "12px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "bold",
                }}
              >
                Shortlisted Candidates
              </button>
            </a>

            <a href="/">
              <button
                style={{
                  background:
                    "#1c4ed8",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "14px 20px",

                  borderRadius:
                    "12px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "bold",
                }}
              >
                ← Back to Home
              </button>
            </a>
          </div>
        </div>

        <div
          style={{
            background:
              "white",

            padding:
              "25px",

            borderRadius:
              "20px",

            marginBottom:
              "30px",

            boxShadow:
              "0 4px 18px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",

              gap: "15px",

              alignItems:
                "center",
            }}
          >
            <input
              placeholder="Search skills, title, candidate name..."
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target
                    .value
                )
              }
              style={{
                padding:
                  "15px",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "12px",

                fontSize:
                  "15px",
              }}
            />

            <input
              placeholder="City or ZIP Code"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target
                    .value
                )
              }
              style={{
                padding:
                  "15px",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "12px",

                fontSize:
                  "15px",
              }}
            />

            <select
              value={radius}
              onChange={(e) =>
                setRadius(
                  e.target
                    .value
                )
              }
              style={{
                padding:
                  "15px",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "12px",

                fontSize:
                  "15px",
              }}
            >
              <option value="10">
                10 Miles
              </option>

              <option value="25">
                25 Miles
              </option>

              <option value="50">
                50 Miles
              </option>

              <option value="100">
                100 Miles
              </option>

              <option value="200">
                200 Miles
              </option>

              <option value="300">
                300 Miles
              </option>

              <option value="400">
                400 Miles
              </option>

              <option value="500">
                500 Miles
              </option>

              <option value="nationwide">
                Entire Country
              </option>
            </select>

            <input
              placeholder="Experience"
              value={
                experienceFilter
              }
              onChange={(e) =>
                setExperienceFilter(
                  e.target
                    .value
                )
              }
              style={{
                padding:
                  "15px",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "12px",

                fontSize:
                  "15px",
              }}
            />

            <button
              onClick={
                handleSearch
              }
              style={{
                background:
                  "#1c4ed8",

                color:
                  "white",

                border:
                  "none",

                padding:
                  "15px 24px",

                borderRadius:
                  "12px",

                cursor:
                  "pointer",

                fontWeight:
                  "bold",

                fontSize:
                  "15px",
              }}
            >
              Search
            </button>
          </div>

          <div
            style={{
              marginTop:
                "20px",

              display:
                "flex",

              gap: "20px",

              alignItems:
                "center",

              flexWrap:
                "wrap",
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

                color:
                  "#374151",
              }}
            >
              <input
                type="checkbox"
                checked={
                  remoteOnly
                }
                onChange={(e) =>
                  setRemoteOnly(
                    e.target
                      .checked
                  )
                }
              />
              Remote Only
            </label>

            <div
              style={{
                color:
                  "#6b7280",

                fontSize:
                  "14px",
              }}
            >
              Radius:{" "}
              {radius} miles
            </div>
          </div>
        </div>

        <div
          style={{
            background:
              "#fef3c7",

            border:
              "1px solid #fcd34d",

            color:
              "#92400e",

            padding:
              "16px 20px",

            borderRadius:
              "14px",

            marginBottom:
              "22px",

            fontWeight:
              "bold",
          }}
        >
          Recruiter Access Protected • Candidate data and resumes are restricted to authorized premium recruiters only.
        </div>

        <div
          style={{
            marginBottom:
              "22px",

            fontWeight:
              "bold",

            color:
              "#6b7280",

            fontSize:
              "16px",
          }}
        >
          {
            filteredCandidates.length
          }{" "}
          candidate profiles found
        </div>

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",

            gap: "22px",
          }}
        >
          {filteredCandidates.map(
            (
              candidate
            ) => (
              <div
                key={
                  candidate.id
                }
                style={{
                  background:
                    "white",

                  borderRadius:
                    "22px",

                  padding:
                    "28px",

                  boxShadow:
                    "0 6px 20px rgba(0,0,0,0.05)",

                  border:
                    "1px solid #eef2f7",
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

                    marginBottom:
                      "18px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin:
                          "0 0 8px 0",

                        color:
                          "#111827",
                      }}
                    >
                      {
                        candidate.fullname
                      }
                    </h2>

                    <div
                      style={{
                        color:
                          "#6b7280",

                        fontSize:
                          "14px",
                      }}
                    >
                      📧{" "}
                      {
                        candidate.useremail
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "10px",
                      alignItems:
                        "flex-end",
                    }}
                  >
                    <div
                      style={{
                        background:
                          candidate.profileCompletion >= 80
                            ? "#dcfce7"
                            : "#eff6ff",
                        color:
                          candidate.profileCompletion >= 80
                            ? "#166534"
                            : "#1d4ed8",
                        padding:
                          "6px 12px",
                        borderRadius:
                          "999px",
                        fontWeight:
                          "bold",
                        fontSize:
                          "12px",
                      }}
                    >
                      {candidate.profileCompletion || 0}% Complete
                    </div>

                  {candidate.remote && (
                    <div
                      style={{
                        background:
                          "#dcfce7",

                        color:
                          "#166534",

                        padding:
                          "6px 12px",

                        borderRadius:
                          "999px",

                        fontWeight:
                          "bold",

                        fontSize:
                          "12px",
                      }}
                    >
                      Remote
                    </div>
                  )}
                  </div>
                </div>

                {candidate.title && (
                  <div
                    style={{
                      marginBottom:
                        "10px",

                      color:
                        "#374151",
                    }}
                  >
                    💼{" "}
                    {
                      candidate.title
                    }
                  </div>
                )}

                {candidate.location && (
                  <div
                    style={{
                      marginBottom:
                        "10px",

                      color:
                        "#374151",
                    }}
                  >
                    📍{" "}
                    {
                      candidate.location
                    }

                    {candidate.zipcode &&
                      ` • ${candidate.zipcode}`}
                  </div>
                )}

                {candidate.experience && (
                  <div
                    style={{
                      marginBottom:
                        "10px",

                      color:
                        "#374151",
                    }}
                  >
                    🧠{" "}
                    {
                      candidate.experience
                    }
                  </div>
                )}

                {candidate.education && (
                  <div
                    style={{
                      marginBottom:
                        "16px",

                      color:
                        "#374151",
                    }}
                  >
                    🎓{" "}
                    {
                      candidate.education
                    }
                  </div>
                )}

                {candidate.skills && (
                  <div
                    style={{
                      marginBottom:
                        "18px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "inline-block",

                        background:
                          "#eff6ff",

                        color:
                          "#1d4ed8",

                        padding:
                          "8px 14px",

                        borderRadius:
                          "999px",

                        fontWeight:
                          "bold",

                        fontSize:
                          "13px",
                      }}
                    >
                      {
                        candidate.skills
                      }
                    </div>
                  </div>
                )}

                {candidate.summary && (
                  <div
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    <h4
                      style={{
                        marginBottom:
                          "10px",

                        color:
                          "#111827",
                      }}
                    >
                      Candidate Summary
                    </h4>

                    <div
                      style={{
                        background:
                          "#f9fafb",

                        padding:
                          "16px",

                        borderRadius:
                          "12px",

                        maxHeight:
                          "130px",

                        overflow:
                          "auto",

                        fontSize:
                          "14px",

                        color:
                          "#374151",

                        lineHeight:
                          "1.6",
                      }}
                    >
                      {
                        candidate.summary
                      }
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "12px",
                    marginTop: "22px",
                  }}
                >
                  <button
                    onClick={() =>
                      saveCandidate(
                        candidate
                      )
                    }
                    style={{
                      background:
                        "#f59e0b",

                      color:
                        "white",

                      border:
                        "none",

                      padding:
                        "14px 18px",

                      borderRadius:
                        "12px",

                      cursor:
                        "pointer",

                      fontWeight:
                        "bold",

                      width:
                        "100%",

                      fontSize:
                        "15px",
                    }}
                  >
                    Save Candidate
                  </button>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "12px",
                    }}
                  >
                    <a
                      href={`/candidate/${candidate.id}`}
                      style={{
                        flex: 1,
                      }}
                    >
                      <button
                        style={{
                          background:
                            "#1d4ed8",

                          color:
                            "white",

                          border:
                            "none",

                          padding:
                            "14px 18px",

                          borderRadius:
                            "12px",

                          cursor:
                            "pointer",

                          fontWeight:
                            "bold",

                          width:
                            "100%",

                          fontSize:
                            "15px",
                        }}
                      >
                        View Profile
                      </button>
                    </a>

                    {candidate.resumeurl &&
                    authorized && (
                      <button
                        onClick={() =>
                          openResume(
                            candidate
                          )
                        }
                        style={{
                          flex: 1,

                          background:
                            "#16a34a",

                          color:
                            "white",

                          border:
                            "none",

                          padding:
                            "14px 18px",

                          borderRadius:
                            "12px",

                          cursor:
                            "pointer",

                          fontWeight:
                            "bold",

                          width:
                            "100%",

                          fontSize:
                            "15px",
                        }}
                      >
                        View Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
