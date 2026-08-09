type ResumeSectionProps = {
  uploading: boolean;
  resumeurl: string;
  handleResumeUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function ResumeSection({
  uploading,
  resumeurl,
  handleResumeUpload,
}: ResumeSectionProps) {
  return (
    <div
      style={{
        marginTop: "25px",
      }}
    >
      <label
        style={{
          fontWeight: "bold",
          display: "block",
          marginBottom: "10px",
        }}
      >
        Upload Resume
      </label>

      <input
        type="file"
        onChange={handleResumeUpload}
      />

      {uploading && (
        <div
          style={{
            marginTop: "12px",
            color: "#1d4ed8",
          }}
        >
          Uploading resume...
        </div>
      )}

      {resumeurl && (
        <div
          style={{
            marginTop: "14px",
          }}
        >
          <a
            href={resumeurl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Current Resume
            </button>
          </a>
        </div>
      )}
    </div>
  );
}