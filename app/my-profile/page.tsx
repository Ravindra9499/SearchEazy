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
import ProfessionalInfo from "./components/ProfessionalInfo";
import PrivacySettings from "./components/PrivacySettings";

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [
    profileCompletion,
    setProfileCompletion,
  ] = useState(0);

  const [profile, setProfile] = useState({
    // Existing / legacy fields kept for compatibility
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

  const calculateProfileCompletion = () => {
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.email,
      profile.phone,
      profile.city,
      profile.state,
      profile.zipcode,
      profile.profile_headline,
      profile.current_company,
      profile.profession,
      profile.title,
      profile.skills,
      profile.experience,
      profile.education,
      profile.summary,
      profile.resumeurl,
      profile.work_types.length > 0
        ? profile.work_types.join(", ")
        : "",
      profile.work_location,
      profile.availability_status,
    ];

    let completed = 0;

    fields.forEach((field) => {
      if (
        field &&
        String(field).trim().length > 0
      ) {
        completed++;
      }
    });

    const percentage = Math.round(
      (completed / fields.length) * 100
    );

    setProfileCompletion(percentage);
  };

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/applicant-login";
        return;
      }

      setUser(user);

      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .select("*")
          .eq("useremail", user.email)
          .single();

      if (error && error.code !== "PGRST116") {
        console.error(
          "Failed to load candidate profile:",
          error
        );
      }

      if (data) {
        const fullname =
          data.fullname || "";

        const location =
          data.location || "";

        const fallbackFirstName =
          fullname
            .trim()
            .split(" ")[0] || "";

        const fallbackLastName =
          fullname
            .trim()
            .split(" ")
            .slice(1)
            .join(" ");

        const fallbackCity =
          location
            .split(",")[0]
            ?.trim() || "";

        const fallbackState =
          location
            .split(",")
            .slice(1)
            .join(",")
            .trim();

        setProfile({
          // Existing / legacy
          fullname,
          title: data.title || "",
          skills: data.skills || "",
          experience:
            data.experience || "",
          education:
            data.education || "",
          location,
          zipcode: data.zipcode || "",
          summary: data.summary || "",
          remote: data.remote || false,
          resumeurl:
            data.resumeurl || "",

          // Personal
          first_name:
            data.first_name ||
            fallbackFirstName,
          last_name:
            data.last_name ||
            fallbackLastName,
          phone: data.phone || "",
          email:
            user.email ||
            data.useremail ||
            "",
          city:
            data.city || fallbackCity,
          state:
            data.state || fallbackState,

          // Professional
          profile_headline:
            data.profile_headline || "",
          current_company:
            data.current_company || "",
          profession:
            data.profession || "",

          // Career
          availability_status:
            data.availability_status ||
            "future_opportunities",
          work_types:
            Array.isArray(data.work_types)
              ? data.work_types
              : [],
          work_location:
            data.work_location ||
            "On-site",
          expected_salary:
            data.expected_salary ?? "",
          salary_type:
            data.salary_type || "",
          notice_period:
            data.notice_period || "",

          // Privacy
          profile_visibility:
            data.profile_visibility ||
            "premium_employers",
          show_email:
            data.show_email ?? true,
          show_phone:
            data.show_phone ?? false,
          allow_resume_download:
            data.allow_resume_download ??
            true,
          searchable:
            data.searchable ?? true,
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (
    e: any
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const formData = new FormData();

    formData.append(
      "resume",
      file
    );

    try {
      const res = await fetch(
        "/api/upload-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.url) {
        setProfile((prev) => ({
          ...prev,
          resumeurl: data.url,
        }));

        alert(
          "Resume uploaded successfully!"
        );
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const fullname =
      [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      profile.fullname;

    const location =
      [
        profile.city,
        profile.state,
      ]
        .filter(Boolean)
        .join(", ")
        .trim() ||
      profile.location;

    const payload = {
      useremail: user.email,

      // Legacy fields retained for compatibility
      fullname,
      title: profile.title,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      location,
      zipcode: profile.zipcode,
      summary: profile.summary,

      // Keep legacy remote synchronized
      remote:
        profile.work_location ===
        "Remote",

      resumeurl:
        profile.resumeurl,

      // Personal
      first_name:
        profile.first_name,
      last_name:
        profile.last_name,
      phone: profile.phone,
      city: profile.city,
      state: profile.state,

      // Professional
      profile_headline:
        profile.profile_headline,
      current_company:
        profile.current_company,
      profession:
        profile.profession,

      // Career
      availability_status:
        profile.availability_status,
      work_types:
        profile.work_types,
      work_location:
        profile.work_location,
      expected_salary:
        profile.expected_salary === ""
          ? null
          : Number(
              profile.expected_salary
            ),
      salary_type:
        profile.salary_type,
      notice_period:
        profile.notice_period,

      // Privacy
      profile_visibility:
        profile.profile_visibility,
      show_email:
        profile.show_email,
      show_phone:
        profile.show_phone,
      allow_resume_download:
        profile.allow_resume_download,
      searchable:
        profile.searchable,

      profile_updated_at:
        new Date().toISOString(),
    };

    try {
      const {
        data: existing,
        error: lookupError,
      } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("useremail", user.email)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "Profile lookup error:",
          lookupError
        );

        alert(
          "Failed to save profile."
        );
        return;
      }

      let error;

      if (existing) {
        const result =
          await supabase
            .from("candidate_profiles")
            .update(payload)
            .eq(
              "useremail",
              user.email
            );

        error = result.error;
      } else {
        const result =
          await supabase
            .from("candidate_profiles")
            .insert([payload]);

        error = result.error;
      }

      if (error) {
        console.error(
          "Profile save error:",
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
    } catch (error) {
      console.error(
        "Profile save crash:",
        error
      );

      alert(
        "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f5f7fb",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                color: "#111827",
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "10px",
              }}
            >
              Manage your professional
              recruiter profile.
            </p>
          </div>

          <a href="/">
            <button
              type="button"
              style={{
                background: "#1d4ed8",
                color: "white",
                border: "none",
                padding:
                  "14px 20px",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ← Back Home
            </button>
          </a>
        </div>

        {/* Profile Completion */}

        <ProfileCompletion
          profileCompletion={
            profileCompletion
          }
        />

        {/* Personal Information */}

        <PersonalInfo
          profile={profile}
          setProfile={setProfile}
        />

        {/* Career Preferences */}

        <CareerPreferences
          profile={profile}
          setProfile={setProfile}
        />

        {/* Professional Information */}

        <ProfessionalInfo
  profile={profile}
  setProfile={setProfile}
/>

<PrivacySettings
  profile={profile}
  setProfile={setProfile}
/>

 {/* Resume */}

    <div
      style={{
        background: "white",
        padding: "32px",
        borderRadius: "24px",
        marginTop: "24px",
        marginBottom: "24px",
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      <ResumeSection
        uploading={uploading}
        resumeurl={profile.resumeurl}
        handleResumeUpload={handleResumeUpload}
      />
    </div>

    {/* Save Profile */}

    <button
      type="button"
      onClick={
        saveProfile
      }
      disabled={saving}
      style={{
        marginTop: "6px",
        marginBottom: "30px",
        width: "100%",
        background: "#1d4ed8",
        color: "white",
        border: "none",
        padding: "18px",
        borderRadius: "14px",
        fontWeight: "bold",
        cursor: saving
          ? "not-allowed"
          : "pointer",
        fontSize: "16px",
        opacity: saving
          ? 0.7
          : 1,
      }}
    >
      {saving
        ? "Saving..."
        : "Save Profile"}
    </button>
  </div>
</div>
  );
}