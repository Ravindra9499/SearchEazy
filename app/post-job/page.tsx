"use client";

import {
  useState,
  useEffect,
} from "react";

import dynamic from "next/dynamic";

import "react-quill-new/dist/quill.snow.css";

import { supabase } from "../lib/supabase";

const ReactQuill = dynamic(
  () => import("react-quill-new"),
  { ssr: false }
);

export default function PostJobPage() {
  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<any>(null);

  const [title, setTitle] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [jobType, setJobType] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [
    salaryMin,
    setSalaryMin,
  ] = useState("");

  const [
    salaryMax,
    setSalaryMax,
  ] = useState("");

  const [
    salaryType,
    setSalaryType,
  ] = useState("");

  const [currency, setCurrency] =
    useState("USD");

  const [
    screeningQuestions,
    setScreeningQuestions,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser =
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

      setUser(user);

      // FETCH PROFILE

      const {
        data: profileData,
      } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      setProfile(profileData);
    };

  const handleSubmit =
    async (e: any) => {
      e.preventDefault();

      if (
        !title ||
        !company ||
        !location ||
        !description ||
        !jobType ||
        !category ||
        !salaryMin ||
        !salaryMax ||
        !salaryType ||
        !currency
      ) {
        alert(
          "Please fill all required fields"
        );

        return;
      }

      // FREE PLAN LIMIT

      if (
        profile?.subscriptionPlan ===
          "free" &&
        profile?.freePostsRemaining <=
          0
      ) {
        alert(
          "Free posting limit reached. Upgrade to premium to continue posting jobs."
        );

        return;
      }

      setLoading(true);

      const res =
        await fetch(
          "/api/jobs",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                title,

                company,

                location,

                description,

                jobType,

                category,

                salaryMin,

                salaryMax,

                salaryType,

                currency,

                screeningQuestions,

                userEmail:
                  user.email,
              }
            ),
          }
        );

      // REDUCE FREE POSTS

      if (res.ok) {
        if (
          profile?.subscriptionPlan ===
          "free"
        ) {
          const remaining =
            Math.max(
              0,
              profile.freePostsRemaining -
                1
            );

          await supabase
            .from("profiles")
            .update({
              freePostsRemaining:
                remaining,
            })
            .eq(
              "id",
              user.id
            );
        }
      }

      setLoading(false);

      if (res.ok) {
        alert(
          "Job posted successfully"
        );

        window.location.href =
          "/my-jobs";
      } else {
        alert(
          "Failed to post job"
        );
      }
    };

  return (
    <div
      style={{
        background:
          "#f3f2f1",

        minHeight:
          "100vh",

        padding:
          "40px",
      }}
    >
      <div
        style={{
          maxWidth:
            "950px",

          margin:
            "0 auto",

          background:
            "white",

          padding:
            "35px",

          borderRadius:
            "14px",

          border:
            "1px solid #ddd",
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
              "20px",
          }}
        >
          <h1
            style={{
              color:
                "#1c4ed8",

              margin: 0,
            }}
          >
            Post a Job
          </h1>

          <a href="/">
            <button
              style={{
                background:
                  "#eee",

                border:
                  "none",

                padding:
                  "10px 15px",

                borderRadius:
                  "6px",

                cursor:
                  "pointer",
              }}
            >
              ← Back
            </button>
          </a>
        </div>

        <div
          style={{
            background:
              "#eff6ff",

            border:
              "1px solid #bfdbfe",

            padding:
              "14px",

            borderRadius:
              "10px",

            marginBottom:
              "25px",
          }}
        >
          <p
            style={{
              margin: 0,

              color:
                "#1e3a8a",

              fontWeight:
                "bold",
            }}
          >
            Subscription Plan:
            {" "}
            {profile?.subscriptionPlan ||
              "free"}
          </p>

          <p
            style={{
              marginTop:
                "8px",

              marginBottom: 0,

              color:
                "#1e40af",
            }}
          >
            Free Job Posts Remaining:
            {" "}
            {
              profile?.freePostsRemaining ??
              0
            }
          </p>
        </div>

        <p
          style={{
            marginBottom:
              "30px",

            color:
              "gray",
          }}
        >
          Logged in as:
          {" "}
          {user?.email}
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >
          {/* JOB TITLE */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Job Title
            </label>

            <input
              placeholder="e.g. Senior React Developer"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",

                fontSize:
                  "16px",
              }}
            />
          </div>

          {/* COMPANY */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Company Name
            </label>

            <input
              placeholder="e.g. Google"
              value={company}
              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",

                fontSize:
                  "16px",
              }}
            />
          </div>

          {/* LOCATION */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Location
            </label>

            <input
              placeholder="e.g. Hyderabad, India"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",

                fontSize:
                  "16px",
              }}
            />
          </div>

          {/* JOB TYPE */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Job Type
            </label>

            <select
              value={jobType}
              onChange={(e) =>
                setJobType(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",

                fontSize:
                  "16px",
              }}
            >
              <option value="">
                Select Job Type
              </option>

              <option value="Full-time">
                Full-time
              </option>

              <option value="Part-time">
                Part-time
              </option>

              <option value="Contract">
                Contract
              </option>

              <option value="Internship">
                Internship
              </option>

              <option value="Remote">
                Remote
              </option>

              <option value="Hybrid">
                Hybrid
              </option>
            </select>
          </div>

          {/* CATEGORY */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Job Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",

                fontSize:
                  "16px",
              }}
            >
<option value="">
  Select Category
</option>

<option value="Software Engineering">
  Software Engineering
</option>

<option value="Information Technology">
  Information Technology
</option>

<option value="Healthcare">
  Healthcare
</option>

<option value="Finance & Accounting">
  Finance & Accounting
</option>

<option value="Marketing">
  Marketing
</option>

<option value="Sales">
  Sales
</option>

<option value="Human Resources">
  Human Resources
</option>

<option value="Customer Support">
  Customer Support
</option>

<option value="Administrative & Office">
  Administrative & Office
</option>

<option value="Design & Creative">
  Design & Creative
</option>

<option value="Engineering">
  Engineering
</option>

<option value="Manufacturing">
  Manufacturing
</option>

<option value="Electrical & Electronics">
  Electrical & Electronics
</option>

<option value="Construction">
  Construction
</option>

<option value="Skilled Trades">
  Skilled Trades
</option>

<option value="Logistics & Supply Chain">
  Logistics & Supply Chain
</option>

<option value="Operations">
  Operations
</option>

<option value="Education">
  Education
</option>

<option value="Hospitality & Tourism">
  Hospitality & Tourism
</option>

<option value="Legal">
  Legal
</option>

<option value="Real Estate">
  Real Estate
</option>

<option value="Science & Research">
  Science & Research
</option>

<option value="Other">
  Other
</option>
            </select>
          </div>

          {/* SALARY */}

          <div
            style={{
              marginBottom:
                "25px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "12px",
              }}
            >
              Salary / Compensation
            </label>

            <div
              style={{
                display:
                  "flex",

                gap: "10px",

                flexWrap:
                  "wrap",
              }}
            >
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,

                  padding:
                    "14px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "8px",
                }}
              >
                <option value="USD">
                  USD ($)
                </option>

                <option value="INR">
                  INR (₹)
                </option>

                <option value="EUR">
                  EUR (€)
                </option>

                <option value="GBP">
                  GBP (£)
                </option>
              </select>

              <input
                type="number"
                placeholder="Minimum"
                value={salaryMin}
                onChange={(e) =>
                  setSalaryMin(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,

                  padding:
                    "14px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "8px",
                }}
              />

              <input
                type="number"
                placeholder="Maximum"
                value={salaryMax}
                onChange={(e) =>
                  setSalaryMax(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,

                  padding:
                    "14px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "8px",
                }}
              />

              <select
                value={salaryType}
                onChange={(e) =>
                  setSalaryType(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,

                  padding:
                    "14px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "8px",
                }}
              >
                <option value="">
                  Salary Type
                </option>

                <option value="yearly">
                  Yearly
                </option>

                <option value="hourly">
                  Hourly
                </option>
              </select>
            </div>
          </div>

          {/* SCREENING QUESTIONS */}

          <div
            style={{
              marginBottom:
                "25px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "8px",
              }}
            >
              Screening Questions
            </label>

            <textarea
              placeholder={`Example:
How many years of React experience do you have?
Do you have Node.js experience?
Are you willing to relocate?`}
              value={
                screeningQuestions
              }
              onChange={(e) =>
                setScreeningQuestions(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                minHeight:
                  "120px",

                padding:
                  "14px",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "8px",
              }}
            />
          </div>

          {/* DESCRIPTION */}

          <div
            style={{
              marginBottom:
                "70px",
            }}
          >
            <label
              style={{
                fontWeight:
                  "bold",

                display:
                  "block",

                marginBottom:
                  "10px",
              }}
            >
              Job Description
            </label>

            <ReactQuill
              theme="snow"
              value={description}
              onChange={
                setDescription
              }
              placeholder="Write detailed job description..."
              style={{
                height:
                  "350px",
              }}
            />
          </div>

          <button
            disabled={loading}
            style={{
              width:
                "100%",

              padding:
                "16px",

              background:
                "#1c4ed8",

              color:
                "white",

              border:
                "none",

              borderRadius:
                "8px",

              fontWeight:
                "bold",

              fontSize:
                "16px",

              cursor:
                "pointer",
            }}
          >
            {loading
              ? "Posting..."
              : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}