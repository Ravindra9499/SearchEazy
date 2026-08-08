"use client";

export default function PersonalInfo({
  profile,
  setProfile,
}: {
  profile: any;
  setProfile: (value: any) => void;
}) {
  const update = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputStyle = {
    padding: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontWeight: "bold" as const,
    display: "block" as const,
    marginBottom: "10px",
    color: "#111827",
  };

  return (
    <div
      style={{
        background: "white",
        padding: "32px",
        borderRadius: "24px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        marginTop: "24px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "28px",
          color: "#111827",
        }}
      >
        Personal Information
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        <div>
          <label style={labelStyle}>First Name</label>
          <input
            value={profile.first_name || ""}
            onChange={(e) => update("first_name", e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Last Name</label>
          <input
            value={profile.last_name || ""}
            onChange={(e) => update("last_name", e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={profile.email || ""}
            readOnly
            style={{
              ...inputStyle,
              background: "#f3f4f6",
              color: "#4b5563",
              cursor: "not-allowed",
            }}
            aria-readonly="true"
          />
        </div>

        <div>
          <label style={labelStyle}>Phone Number</label>
          <input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>City</label>
          <input
            value={profile.city || ""}
            onChange={(e) => update("city", e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>State</label>
          <input
            value={profile.state || ""}
            onChange={(e) => update("state", e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>ZIP Code</label>
          <input
            value={profile.zipcode || ""}
            onChange={(e) => update("zipcode", e.target.value)}
            style={inputStyle}
            required
          />
        </div>
      </div>
    </div>
  );
}
