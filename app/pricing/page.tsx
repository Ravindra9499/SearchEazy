export default function PricingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        <a href="/">
          <button
            style={{
              background: "#1c4ed8",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            ← Back to Home
          </button>
        </a>

        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              color: "#111827",
              marginBottom: "20px",
            }}
          >
            SearchEezy Pricing
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#6b7280",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.8",
            }}
          >
            Flexible hiring plans for direct employers,
            healthcare organizations, staffing agencies,
            and recruiting firms.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            marginBottom: "70px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "40px",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ color: "#111827" }}>
              Free Employer
            </h2>

            <h1
              style={{
                color: "#16a34a",
                fontSize: "56px",
                margin: "20px 0",
              }}
            >
              $0
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "30px",
              }}
            >
              Perfect for small employers hiring occasionally.
            </p>

            <ul
              style={{
                lineHeight: "2.2",
                color: "#374151",
                paddingLeft: "20px",
              }}
            >
              <li>✓ 4 Job Posts</li>
              <li>✓ Company Profile</li>
              <li>✓ Applicant Tracking</li>
              <li>✓ ATS Applications</li>
              <li>✓ Email Applications</li>
              <li>✓ Basic Support</li>
            </ul>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg,#1d4ed8,#2563eb)",
              borderRadius: "24px",
              padding: "40px",
              color: "white",
              boxShadow:
                "0 12px 35px rgba(37,99,235,0.35)",
              transform: "scale(1.03)",
            }}
          >
            <div
              style={{
                background: "#fbbf24",
                color: "#111827",
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              MOST POPULAR
            </div>

            <h2>Premium Employer</h2>

            <h1
              style={{
                fontSize: "56px",
                margin: "20px 0",
              }}
            >
              $99
              <span style={{ fontSize: "18px" }}>
                /month
              </span>
            </h1>

            <ul
              style={{
                lineHeight: "2.2",
                paddingLeft: "20px",
              }}
            >
              <li>✓ Unlimited Job Posts</li>
              <li>✓ Resume Search Access</li>
              <li>✓ Featured Jobs</li>
              <li>✓ Verified Employer Badge</li>
              <li>✓ Candidate Shortlisting</li>
              <li>✓ Priority Support</li>
            </ul>

            <a href="mailto:sales@searcheezy.com">
              <button
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  background: "white",
                  color: "#1d4ed8",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Upgrade Now
              </button>
            </a>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "40px",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h2>Staffing Agency</h2>

            <h1
              style={{
                color: "#7c3aed",
                fontSize: "56px",
                margin: "20px 0",
              }}
            >
              $199
              <span style={{ fontSize: "18px" }}>
                /month
              </span>
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "30px",
              }}
            >
              Designed for recruiting firms and staffing agencies.
            </p>

            <ul
              style={{
                lineHeight: "2.2",
                color: "#374151",
                paddingLeft: "20px",
              }}
            >
              <li>✓ Everything in Premium</li>
              <li>✓ Agency Verification</li>
              <li>✓ Unlimited Recruiting</li>
              <li>✓ Priority Placement</li>
              <li>✓ Featured Jobs</li>
              <li>✓ Resume Search Access</li>
            </ul>

            <a href="mailto:sales@searcheezy.com">
              <button
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#7c3aed",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Contact Sales
              </button>
            </a>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Why Employers Choose SearchEezy
          </h2>

          <p
            style={{
              color: "#6b7280",
              lineHeight: "2",
            }}
          >
            ✓ ATS Included • ✓ Resume Search • ✓ Employer Verification • ✓ Featured Jobs • ✓ Priority Support
          </p>
        </div>
      </div>
    </div>
  );
}
