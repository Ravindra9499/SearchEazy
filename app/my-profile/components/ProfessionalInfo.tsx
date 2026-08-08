"use client";

type ProfessionalInfoProps = {
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProfessionalInfo({
  profile,
  setProfile,
}: ProfessionalInfoProps) {
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
        Professional Information
      </h2>

      {/* Professional Headline */}

      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Professional Headline
        </label>

        <input
          type="text"
          value={
            profile.profile_headline ||
            ""
          }
          onChange={(e) =>
            updateProfile(
              "profile_headline",
              e.target.value
            )
          }
          placeholder="e.g. Senior Software Engineer"
          style={inputStyle}
        />
      </div>

      {/* Current Company + Profession */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Current Company
          </label>

          <input
            type="text"
            value={
              profile.current_company ||
              ""
            }
            onChange={(e) =>
              updateProfile(
                "current_company",
                e.target.value
              )
            }
            placeholder="e.g. ABC Technologies"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Profession
          </label>

          <input
            type="text"
            value={
              profile.profession ||
              ""
            }
            onChange={(e) =>
              updateProfile(
                "profession",
                e.target.value
              )
            }
            placeholder="e.g. Software Engineering"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Professional Title + Experience */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Professional Title
          </label>

          <input
            type="text"
            value={
              profile.title || ""
            }
            onChange={(e) =>
              updateProfile(
                "title",
                e.target.value
              )
            }
            placeholder="e.g. Software Engineer"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Years of Experience
          </label>

          <input
            type="number"
            min="0"
            value={
              profile.experience || ""
            }
            onChange={(e) =>
              updateProfile(
                "experience",
                e.target.value
              )
            }
            placeholder="e.g. 10"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Skills + Education */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Skills
          </label>

          <input
            type="text"
            value={
              profile.skills || ""
            }
            onChange={(e) =>
              updateProfile(
                "skills",
                e.target.value
              )
            }
            placeholder="e.g. React, JavaScript, SQL"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Education
          </label>

          <input
            type="text"
            value={
              profile.education || ""
            }
            onChange={(e) =>
              updateProfile(
                "education",
                e.target.value
              )
            }
            placeholder="e.g. Master's in Computer Science"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Professional Summary */}

      <div>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Professional Summary
        </label>

        <textarea
          value={
            profile.summary || ""
          }
          onChange={(e) =>
            updateProfile(
              "summary",
              e.target.value
            )
          }
          placeholder="Write a brief professional summary..."
          style={{
            ...inputStyle,
            minHeight: "180px",
            resize: "vertical",
          }}
        />
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
  boxSizing:
    "border-box" as const,
};