import Link from "next/link";
import {
  ArrowIcon,
  BarsIcon,
  BoltIcon,
  BriefcaseIcon,
  CheckIcon,
  ClipboardIcon,
  CompassIcon,
  GearIcon,
  HomeIcon,
  PeopleIcon,
  PlayIcon,
  SearchIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";

const FEATURES = [
  { title: "Personalised Matching", text: "Get roles that truly fit your skills, interests and goals.", Icon: TargetIcon, bg: "#fde2ea", fg: "#e11d48" },
  { title: "Skill Insights", text: "Know exactly what to learn next, based on verified results.", Icon: BarsIcon, bg: "#d1fae5", fg: "#059669" },
  { title: "Be Job-Ready", text: "Take assessments and build the skills employers look for.", Icon: BoltIcon, bg: "#fef3c7", fg: "#d97706" },
  { title: "Built for Students", text: "A growing community of students and early-career builders.", Icon: PeopleIcon, bg: "#dbeafe", fg: "#2563eb" },
];

const STEPS = [
  { title: "Take a Quick Assessment", text: "Discover your strengths, skills and interests.", Icon: ClipboardIcon, bg: "#ede9fe", fg: "#6d28d9" },
  { title: "Explore Matches", text: "Browse tailored career opportunities that fit your profile.", Icon: CompassIcon, bg: "#fae8ff", fg: "#a21caf" },
  { title: "Grow & Get Hired", text: "Build skills, prepare for interviews and kickstart your career.", Icon: TrophyIcon, bg: "#d1fae5", fg: "#059669" },
];

const WHY_POINTS = [
  "Role matches with a score you can explain",
  "Skill checks you pass, not self-ratings",
  "Gap analysis with courses for each missing skill",
  "Profiles that show verified skills only",
];

const VALUES = [
  { title: "Proof over claims", text: "Skill levels come from checks you pass, so a profile means something to the people reading it." },
  { title: "Explained scores", text: "Every match shows which skills counted and where you fall short, with no hidden ranking." },
  { title: "A clear next step", text: "Each gap points to a course or check, so the next action is always obvious." },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <span style={{ color: "#f59e0b" }}>✦</span> Smarter Careers. Brighter Future.
            </span>
            <h1>
              Find Your <span className="gradient-text">Perfect Career</span> Match with Traject
            </h1>
            <p className="lead">
              Discover roles, build in-demand skills, and see exactly what to learn next, based on
              checks you pass.
            </p>
            <div className="hero-cta">
              <Link href="/signup" className="btn btn-primary btn-large">
                Start Your Journey <ArrowIcon size={18} />
              </Link>
              <Link href="/skills" className="btn btn-ghost">
                Explore skill checks <PlayIcon size={20} color="#5b3df5" />
              </Link>
            </div>
            <div className="social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span style={{ background: "#f59e0b" }}>A</span>
                <span style={{ background: "#ec4899" }}>R</span>
                <span style={{ background: "#3b82f6" }}>M</span>
                <span style={{ background: "#10b981" }}>I</span>
              </div>
              <span>Students and jobseekers finding their next role</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="blob blob-a" />
            <div className="blob blob-b" />
            <div className="orbit" />
            <span className="spark" style={{ top: "6%", right: "16%" }} />
            <span className="spark" style={{ top: "22%", right: "6%", width: 10, height: 10 }} />
            <div className="phone">
              <div className="phone-screen">
                <span className="phone-notch" />
                <div className="phone-greeting">Hi, Ananya</div>
                <div className="phone-sub">Your top match this week</div>
                <div className="phone-ring">
                  <div className="phone-ring-inner">
                    <strong>92%</strong>
                    <span>match</span>
                  </div>
                </div>
                <div className="phone-role">Software Development Engineer</div>
                <div className="phone-meta">Tech · Full-time · Remote friendly</div>
                <span className="btn btn-primary phone-btn">Explore Role →</span>
                <div className="phone-caption">Sample profile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 24 }}>
        <div className="features">
          {FEATURES.map(({ title, text, Icon, bg, fg }) => (
            <div className="feature" key={title}>
              <div className="feature-icon" style={{ background: bg }}>
                <Icon size={26} color={fg} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingTop: 40 }}>
        <div className="how">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>
              Your Career Journey, <br />
              Made Simple
            </h2>
            <p>From exploring options to landing interviews, Traject is with you at every step.</p>
            <div style={{ marginTop: 26 }}>
              <Link href="/signup" className="btn btn-primary">
                Get Started <ArrowIcon size={18} />
              </Link>
            </div>
          </div>

          <div className="steps">
            {STEPS.map(({ title, text, Icon, bg, fg }, index) => (
              <div className="step" key={title}>
                <div className="step-num">{index + 1}</div>
                <div className="step-icon" style={{ background: bg }}>
                  <Icon size={28} color={fg} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="preview-wrap">
          <div className="preview" aria-label="Example dashboard">
            <aside className="preview-side">
              <div className="dots">
                <span style={{ background: "#ef4444" }} />
                <span style={{ background: "#f59e0b" }} />
                <span style={{ background: "#10b981" }} />
              </div>
              <div className="logo" style={{ marginBottom: 18, fontSize: 16 }}>
                <Logo size={22} /> Traject
              </div>
              <div className="item active">
                <HomeIcon size={16} color="#5b3df5" /> Home
              </div>
              <div className="item">
                <SearchIcon size={16} /> Explore
              </div>
              <div className="item">
                <ClipboardIcon size={16} /> Assessments
              </div>
              <div className="item">
                <UserIcon size={16} /> Profile
              </div>
              <div className="item">
                <GearIcon size={16} /> Settings
              </div>
            </aside>
            <div className="preview-main">
              <h4>Hey there!</h4>
              <div className="sub">Here&apos;s your personalised career snapshot</div>
              <div className="feature-banner">
                <div className="tag">Top Career Match</div>
                <div className="title">Software Development Engineer</div>
                <span className="pill">92% match</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong style={{ color: "var(--ink)", fontSize: 14 }}>Recommended for you</strong>
                <span style={{ color: "var(--primary)", fontSize: 12 }}>See all →</span>
              </div>
              <div className="role-cards">
                <div className="role-card">
                  <div className="mini-icon" style={{ background: "#dbeafe" }}>
                    <BarsIcon size={16} color="#2563eb" />
                  </div>
                  <div className="name">Data Scientist</div>
                  <div className="match">92% match</div>
                </div>
                <div className="role-card">
                  <div className="mini-icon" style={{ background: "#ede9fe" }}>
                    <BriefcaseIcon size={16} color="#6d28d9" />
                  </div>
                  <div className="name">Product Manager</div>
                  <div className="match">88% match</div>
                </div>
                <div className="role-card">
                  <div className="mini-icon" style={{ background: "#fae8ff" }}>
                    <CompassIcon size={16} color="#a21caf" />
                  </div>
                  <div className="name">SDE, Backend</div>
                  <div className="match">87% match</div>
                </div>
              </div>
            </div>
          </div>

          <div className="why">
            <span className="eyebrow">Why Traject?</span>
            <h2>
              More Than Just <br />
              Job Matches
            </h2>
            <p>Get a complete career toolkit to help you learn, prepare and grow.</p>
            <ul className="checklist">
              {WHY_POINTS.map((point) => (
                <li key={point}>
                  <span className="check">
                    <CheckIcon size={14} color="#fff" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="center-head">
          <span className="eyebrow">What you get</span>
          <h2>
            Built on <span className="gradient-text">Proof</span>, Not Promises
          </h2>
        </div>
        <div className="testimonials">
          {VALUES.map((value) => (
            <div className="card testimonial" key={value.title}>
              <blockquote>{value.text}</blockquote>
              <div className="person">
                <div className="avatar" style={{ background: "var(--gradient)" }}>
                  <CheckIcon size={20} color="#fff" />
                </div>
                <div>
                  <div className="name">{value.title}</div>
                  <div className="role">Traject principle</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-band">
          <div>
            <h2>Ready to find your perfect career match?</h2>
            <p>Join Traject today and take the first step towards your dream career.</p>
          </div>
          <Link href="/signup" className="btn btn-large">
            Get Started Free <ArrowIcon size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
