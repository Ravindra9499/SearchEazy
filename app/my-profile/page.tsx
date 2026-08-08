"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import ResumeSection from "./components/ResumeSection";
import PersonalInfo from "./components/PersonalInfo";
import ProfileCompletion from "./components/ProfileCompletion";
import CareerPreferences from "./components/CareerPreferences";

export default function MyProfilePage() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [user, setUser] =
    useState<any>(null);

  const [
    profileCompletion,
    setProfileCompletion,
  ] = useState(0);

  const [profile, setProfile] = useState({
  // Existing
  fullname: "",
  title: "",
  skills: "",
  experience: "",
  education: "",
  location: "",
  zipcode: "",
  summary: "",
  remote: false,
  resumeurl: "",

  // Personal
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  city: "",
  state: "",

  // Professional
  profile_headline: "",
  current_company: "",
  profession: "",

  // Career
  availability_status: "future_opportunities",
  work_types: [] as string[],
  work_location: "On-site",
  expected_salary: "",
  salary_type: "",
  notice_period: "",

  // Privacy
  profile_visibility: "premium_employers",
  show_email: true,
  show_phone: false,
  allow_resume_download: true,
  searchable: true,
});

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    calculateProfileCompletion();
  }, [profile]);

  const calculateProfileCompletion =
    () => {
      const fields = [
        profile.first_name,
        profile.last_name,
        profile.email,
        profile.phone,
        profile.city,
        profile.state,
        profile.zipcode,
        profile.title,
        profile.skills,
        profile.experience,
        profile.education,
        profile.summary,
        profile.resumeurl,
      ];

      let completed = 0;

      fields.forEach((field) => {
        if (
          field &&
          String(field)
            .trim()
            .length > 0
        ) {
          completed++;
        }
      });

      const percentage =
        Math.round(
          (completed /
            fields.length) *
            100
        );

      setProfileCompletion(
        percentage
      );
    };

  const loadProfile =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/applicant-login";

        return;
      }

      setUser(user);

      const {
        data,
      } =
        await supabase
          .from(
            "candidate_profiles"
          )
          .select("*")
          .eq(
            "useremail",
            user.email
          )
          .single();

      if (data) {
        setProfile({
          fullname:
            data.fullname || "",

          title:
            data.title || "",

          skills:
            data.skills || "",

          experience:
            data.experience || "",

          education:
            data.education || "",

          location:
            data.location || "",

          zipcode:
            data.zipcode || "",

          summary:
            data.summary || "",

          remote:
            data.remote || false,

          resumeurl:
            data.resumeurl || "",
            // Personal
first_name:
  data.first_name ||
  (data.fullname || "").split(" ")[0] ||
  "",
last_name:
  data.last_name ||
  (data.fullname || "").split(" ").slice(1).join(" ") ||
  "",
phone: data.phone || "",
email: user.email || data.useremail || "",
city:
  data.city ||
  (data.location || "").split(",")[0]?.trim() ||
  "",
state:
  data.state ||
  (data.location || "").split(",").slice(1).join(",").trim() ||
  "",

// Professional
profile_headline: data.profile_headline || "",
current_company: data.current_company || "",
profession: data.profession || "",

// Career
availability_status:
  data.availability_status || "future_opportunities",

work_types:
  data.work_types || [],

work_location:
  data.work_location || "On-site",

expected_salary:
  data.expected_salary || "",

salary_type:
  data.salary_type || "",

notice_period:
  data.notice_period || "",

// Privacy
profile_visibility:
  data.profile_visibility || "premium_employers",

show_email:
  data.show_email ?? true,

show_phone:
  data.show_phone ?? false,

allow_resume_download:
  data.allow_resume_download ?? true,

searchable:
  data.searchable ?? true,
        });
      }

      setLoading(false);
    };

  const handleResumeUpload =
    async (
      e: any
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );

      try {
        const res =
          await fetch(
            "/api/upload-resume",
            {
              method:
                "POST",

              body: formData,
            }
          );

        const data =
          await res.json();

        if (
          data.url
        ) {
          setProfile(
            (
              prev
            ) => ({
              ...prev,

              resumeurl:
                data.url,
            })
          );

          alert(
            "Resume uploaded successfully!"
          );
        } else {
          alert(
            "Upload failed."
          );
        }
      } catch (
        error
      ) {
        console.error(
          error
        );

        alert(
          "Upload failed."
        );
      }

      setUploading(false);
    };

  const saveProfile =
    async () => {
      if (!user) return;

      setSaving(true);

      const payload = {
        useremail:
          user.email,

        fullname:
          [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ") ||
          profile.fullname,

        title:
          profile.title,

        skills:
          profile.skills,

        experience:
          profile.experience,

        education:
          profile.education,

        location:
          [profile.city, profile.state]
            .filter(Boolean)
            .join(", ") ||
          profile.location,

        zipcode:
          profile.zipcode,

        summary:
          profile.summary,

        remote:
          profile.remote,

        resumeurl:
          profile.resumeurl,
      // Personal
first_name: profile.first_name,
last_name: profile.last_name,
phone: profile.phone,
city: profile.city,
state: profile.state,

// Professional
profile_headline: profile.profile_headline,
current_company: profile.current_company,
profession: profile.profession,

// Career
availability_status: profile.availability_status,
work_types: profile.work_types,
work_location: profile.work_location,
expected_salary:
  profile.expected_salary === ""
    ? null
    : Number(profile.expected_salary),
salary_type: profile.salary_type,
notice_period: profile.notice_period,

// Privacy
profile_visibility: profile.profile_visibility,
show_email: profile.show_email,
show_phone: profile.show_phone,
allow_resume_download: profile.allow_resume_download,
searchable: profile.searchable,

// Analytics
profile_updated_at: new Date().toISOString(),
        };

      const {
        data: existing,
      } =
        await supabase
          .from(
            "candidate_profiles"
          )
          .select("id")
          .eq(
            "useremail",
            user.email
          )
          .single();

      let error;

      if (existing) {
        const result =
          await supabase
            .from(
              "candidate_profiles"
            )
            .update(
              payload
            )
            .eq(
              "useremail",
              user.email
            );

        error =
          result.error;
      } else {
        const result =
          await supabase
            .from(
              "candidate_profiles"
            )
            .insert([
              payload,
            ]);

        error =
          result.error;
      }

      setSaving(false);

      if (error) {
        console.error(
          error
        );

        alert(
          "Failed to save profile."
        );

        return;
      }

      alert(
        "Profile updated successfully!"
      );
    };

  if (loading) {
    return (
      <div
        style={{
          padding:
            "40px",
        }}
      >
        Loading profile...
      </div>
    );
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
            "1000px",

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

                fontSize:
                  "38px",

                color:
                  "#111827",
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                color:
                  "#6b7280",

                marginTop:
                  "10px",
              }}
            >
              Manage your professional recruiter profile.
            </p>
          </div>

          <a href="/">
            <button
              style={{
                background:
                  "#1d4ed8",

                color:
                  "white",

                border:
                  "none",

                padding:
                  "14px 20px",

                borderRadius:
                  "12px",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",
              }}
            >
              ← Back Home
            </button>
          </a>
        </div>

        <ProfileCompletion
          profileCompletion={
            profileCompletion
          }
        />

        <PersonalInfo
  profile={profile}
  setProfile={setProfile}
/>

<CareerPreferences
  profile={profile}
  setProfile={setProfile}
/>

        <div
          style={{
            background:
              "white",

            padding:
              "32px",

            borderRadius:
              "24px",

            boxShadow:
              "0 6px 18px rgba(0,0,0,0.05)",
            marginTop:
              "24px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "24px",
              color: "#111827",
            }}
          >
            Professional Information
          </h2>
          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap: "20px",
            }}
          >
            <input
              placeholder="Professional Title"
              value={
                profile.title
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  title:
                    e.target
                      .value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Skills"
              value={
                profile.skills
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills:
                    e.target
                      .value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Experience"
              value={
                profile.experience
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  experience:
                    e.target
                      .value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Education"
              value={
                profile.education
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  education:
                    e.target
                      .value,
                })
              }
              style={inputStyle}
            />

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: "12px",

                fontWeight:
                  "bold",
              }}
            >
              <input
                type="checkbox"
                checked={
                  profile.remote
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    remote:
                      e.target
                        .checked,
                  })
                }
              />

              Open to Remote Work
            </div>
          </div>

          <textarea
            placeholder="Professional Summary"
            value={
              profile.summary
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                summary:
                  e.target
                    .value,
              })
            }
            style={{
              ...inputStyle,

              marginTop:
                "20px",

              minHeight:
                "180px",

              resize:
                "vertical",
            }}
          />

          <div
            style={{
              marginTop:
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
                  "10px",
              }}
            >
              Upload Resume
            </label>

            <input
              type="file"
              onChange={
                handleResumeUpload
              }
            />

            {uploading && (
              <div
                style={{
                  marginTop:
                    "12px",

                  color:
                    "#1d4ed8",
                }}
              >
                Uploading resume...
              </div>
            )}

            {profile.resumeurl && (
              <div
                style={{
                  marginTop:
                    "14px",
                }}
              >
                <a
                  href={
                    profile.resumeurl
                  }
                  target="_blank"
                >
                  <button
                    style={{
                      background:
                        "#16a34a",

                      color:
                        "white",

                      border:
                        "none",

                      padding:
                        "12px 18px",

                      borderRadius:
                        "10px",

                      cursor:
                        "pointer",

                      fontWeight:
                        "bold",
                    }}
                  >
                    View Current Resume
                  </button>
                </a>
              </div>
            )}
          </div>

          <button
            onClick={
              saveProfile
            }
            disabled={saving}
            style={{
              marginTop:
                "30px",

              width:
                "100%",

              background:
                "#1d4ed8",

              color:
                "white",

              border:
                "none",

              padding:
                "18px",

              borderRadius:
                "14px",

              fontWeight:
                "bold",

              cursor:
                "pointer",

              fontSize:
                "16px",
            }}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "15px",
  border:
    "1px solid #d1d5db",
  borderRadius: "12px",
  fontSize: "15px",
  width: "100%",
};
