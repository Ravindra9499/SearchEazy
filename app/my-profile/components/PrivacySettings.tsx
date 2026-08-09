"use client";

import type {
  Dispatch,
  SetStateAction,
} from "react";

type PrivacySettingsProps = {
  profile: any;
  setProfile: Dispatch<
    SetStateAction<any>
  >;
};

export default function PrivacySettings({
  profile,
  setProfile,
}: PrivacySettingsProps) {
  const updateProfile = (
    field: string,
    value: any
  ) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      style={{
        background: "white",
        padding: "32px",
        borderRadius: "24px",
        marginBottom: "24px",
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "28px",
          color: "#111827",
        }}
      >
        Privacy Settings
      </h2>

      {/* Profile Visibility */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Profile Visibility
        </label>

        <select
          value={
            profile.profile_visibility ||
            "public"
          }
          onChange={(e) =>
            updateProfile(
              "profile_visibility",
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="public">
            Public
          </option>

          <option value="recruiters">
            Recruiters Only
          </option>

          <option value="private">
            Private
          </option>
        </select>
      </div>

      {/* Searchable Profile */}

      <label
        style={checkboxLabelStyle}
      >
        <input
          type="checkbox"
          checked={
            profile.searchable !== false
          }
          onChange={(e) =>
            updateProfile(
              "searchable",
              e.target.checked
            )
          }
        />

        <span>
          Allow recruiters to find my
          profile in resume search
        </span>
      </label>

      {/* Show Email */}

      <label
        style={checkboxLabelStyle}
      >
        <input
          type="checkbox"
          checked={
            profile.show_email === true
          }
          onChange={(e) =>
            updateProfile(
              "show_email",
              e.target.checked
            )
          }
        />

        <span>
          Show my email address to
          recruiters
        </span>
      </label>

      {/* Show Phone */}

      <label
        style={checkboxLabelStyle}
      >
        <input
          type="checkbox"
          checked={
            profile.show_phone === true
          }
          onChange={(e) =>
            updateProfile(
              "show_phone",
              e.target.checked
            )
          }
        />

        <span>
          Show my phone number to
          recruiters
        </span>
      </label>

      {/* Resume Download */}

      <label
        style={checkboxLabelStyle}
      >
        <input
          type="checkbox"
          checked={
            profile.allow_resume_download ===
            true
          }
          onChange={(e) =>
            updateProfile(
              "allow_resume_download",
              e.target.checked
            )
          }
        />

        <span>
          Allow recruiters to download
          my resume
        </span>
      </label>
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
  boxSizing:
    "border-box" as const,
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px",
  fontWeight: "bold",
  cursor: "pointer",
};