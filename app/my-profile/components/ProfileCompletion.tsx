type ProfileCompletionProps = {
  profileCompletion: number;
};

export default function ProfileCompletion({
  profileCompletion,
}: ProfileCompletionProps) {
  return (
    <div
      style={{
        background: "white",
        padding: "28px",
        borderRadius: "24px",
        marginBottom: "24px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#111827",
          }}
        >
          Profile Completion
        </h2>

        <div
          style={{
            fontWeight: "bold",
            fontSize: "22px",
            color: "#1d4ed8",
          }}
        >
          {profileCompletion}%
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "14px",
          background: "#e5e7eb",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${profileCompletion}%`,
            height: "100%",
            background:
              profileCompletion >= 80
                ? "#16a34a"
                : "#1d4ed8",
            transition: "0.3s",
          }}
        />
      </div>
    </div>
  );
}