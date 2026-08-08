"use client";

type CareerPreferencesProps = {
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
};

const employmentTypes = [
  "Full Time",
  "Part Time",
  "Per Diem",
  "Contract",
  "Temporary",
];

const workLocations = [
  "Remote",
  "Hybrid",
  "On-site",
];

const salaryTypes = [
  "Annual",
  "Hourly",
];

const availabilityOptions = [
  "Immediately",
  "2 Weeks",
  "30 Days",
  "60+ Days",
];

export default function CareerPreferences({
  profile,
  setProfile,
}: CareerPreferencesProps) {
  const workTypes = Array.isArray(profile.work_types)
    ? profile.work_types
    : [];

  const updateProfile = (
    field: string,
    value: any
  ) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEmploymentType = (
    type: string
  ) => {
    setProfile((prev: any) => {
      const current = Array.isArray(
        prev.work_types
      )
        ? prev.work_types
        : [];

      const updated = current.includes(type)
        ? current.filter(
            (item: string) =>
              item !== type
          )
        : [...current, type];

      return {
        ...prev,
        work_types: updated,
      };
    });
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
        Career Preferences
      </h2>

      {/* Employment Type */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "14px",
          }}
        >
          Employment Type
        </label>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {employmentTypes.map(
            (type) => {
              const selected =
                workTypes.includes(type);

              return (
                <label
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding:
                      "10px 16px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: selected
                      ? "#eff6ff"
                      : "white",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleEmploymentType(
                        type
                      )
                    }
                  />

                  {type}
                </label>
              );
            }
          )}
        </div>
      </div>

      {/* Work Location */}

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
          Preferred Work Location
        </label>

        <select
          value={
            profile.work_location ||
            ""
          }
          onChange={(e) =>
            updateProfile(
              "work_location",
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Select Work Location
          </option>

          {workLocations.map(
            (location) => (
              <option
                key={location}
                value={location}
              >
                {location}
              </option>
            )
          )}
        </select>
      </div>

      {/* Expected Salary */}

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
            Expected Salary
          </label>

          <input
            type="number"
            value={
              profile.expected_salary ??
              ""
            }
            onChange={(e) =>
              updateProfile(
                "expected_salary",
                e.target.value === ""
                  ? null
                  : Number(
                      e.target.value
                    )
              )
            }
            placeholder="e.g. 100000"
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
            Salary Type
          </label>

          <select
            value={
              profile.salary_type ||
              ""
            }
            onChange={(e) =>
              updateProfile(
                "salary_type",
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select Salary Type
            </option>

            {salaryTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Availability */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
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
            Availability
          </label>

          <select
            value={
              profile.availability_status ||
              ""
            }
            onChange={(e) =>
              updateProfile(
                "availability_status",
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select Availability
            </option>

            {availabilityOptions.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Notice Period
          </label>

          <input
            type="text"
            value={
              profile.notice_period ||
              ""
            }
            onChange={(e) =>
              updateProfile(
                "notice_period",
                e.target.value
              )
            }
            placeholder="e.g. 2 Weeks"
            style={inputStyle}
          />
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
  boxSizing:
    "border-box" as const,
};