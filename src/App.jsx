
import { useState, useCallback, createContext, useContext } from "react";

// ============================================================
// SOLID PRINCIPLES — HOW THEY'RE APPLIED
//
// S — Single Responsibility
//     Every component and hook does exactly one thing.
//     NavBar only renders navigation. StatCard only shows one metric.
//     useRoleSelection only manages role state.
//     useTheme only manages dark/light state.
//     ThemeToggle only renders the toggle button.
//
// O — Open / Closed
//     Add a new role by inserting one object into ROLE_REGISTRY.
//     Add a new section by inserting one entry into SECTION_MAP.
//     No existing code needs to change.
//
// L — Liskov Substitution
//     Every role object shares the same shape (id, label, accentHex,
//     stats[], tools[], projects[]). Any role is interchangeable.
//
// I — Interface Segregation
//     Components only receive the props they actually use.
//     ProjectCard receives {project, accent}. Nothing else.
//     RoleTab receives {roleId, label, accentHex, isActive, onToggle}.
//     ThemeToggle receives {isDark, onToggle} — nothing more.
//
// D — Dependency Inversion
//     Section views depend on the role config abstraction, not on
//     concrete role identifiers. SectionRenderer resolves at runtime.
//     All components read colors from the ThemeContext abstraction,
//     not from hard-coded values.
// ============================================================


// ── THEME TOKENS ─────────────────────────────────────────────────────────────
// Two complete palettes. Components read from ThemeContext, never directly
// from these objects — satisfying the D principle.
const LIGHT_TOKENS = {
  ink:          "#18181b",
  inkMid:       "#52525b",
  inkFaint:     "#a1a1aa",
  paper:        "#fafaf9",
  surface:      "#f4f4f0",
  border:       "#e4e4e0",
  borderStrong: "#cdcdc8",
  navBg:        "rgba(250,250,249,0.92)",
};

const DARK_TOKENS = {
  ink:          "#f0f0ee",
  inkMid:       "#a8a8a4",
  inkFaint:     "#6b6b68",
  paper:        "#141412",
  surface:      "#1e1e1b",
  border:       "#2c2c28",
  borderStrong: "#3e3e3a",
  navBg:        "rgba(20,20,18,0.92)",
};

// ── THEME CONTEXT (D principle: components depend on this abstraction) ────────
const ThemeContext = createContext({ isDark: false, colors: LIGHT_TOKENS, toggle: () => {} });
const useThemeCtx = () => useContext(ThemeContext);

// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Non-color tokens remain static.
const T = {
  font: {
    serif:  "'Playfair Display', Georgia, serif",
    sans:   "'DM Sans', system-ui, sans-serif",
    mono:   "'DM Mono', 'Courier New', monospace",
  },
  // color is intentionally omitted here — read via useThemeCtx() instead
  space: { xs:4, sm:8, md:16, lg:28, xl:48, xxl:80 },
  r: { sm:"4px", md:"8px", lg:"14px" },
  ease: "all 0.18s ease",
};

const px = (n) => `${n}px`;

// ── CUSTOM HOOK: useTheme (S principle — manages only theme state) ────────────
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const toggle = useCallback(() => setIsDark(d => !d), []);
  const colors = isDark ? DARK_TOKENS : LIGHT_TOKENS;
  return { isDark, toggle, colors };
}



// ── ROLE REGISTRY ────────────────────────────────────────────────────────────
// O principle: extend by adding entries, never by modifying UI code.
// L principle: every entry conforms to the same interface.
const ROLE_REGISTRY = {
  "data-analyst": {
    id: "data-analyst",
    label: "Data Analyst",
    shortLabel: "Analyst",
    accentHex: "#2563eb",
    descriptor: "Turning numbers into narratives",
    stats: [
      { label: "Dashboards Built",    value: "87"    },
      { label: "Datasets Processed",  value: "2.4M+" },
      { label: "Accuracy Lift",       value: "34%"   },
      { label: "Weekly Hours Saved",  value: "40"    },
    ],
    tools: ["Python","SQL","Tableau","Power BI","dbt","Snowflake","Airflow","BigQuery"],
    projects: [
      {
        title: "Revenue Attribution Engine",
        year:  "2024",
        description:
          "Multi-touch attribution model in BigQuery that surfaced which channels drove $12 M in revenue, increasing marketing ROI clarity by 41%.",
        stack:   ["Python","BigQuery","Tableau","dbt"],
        metrics: [["Revenue Tracked","$12 M"],["Model Accuracy","94.2%"],["Query Speed","↓ 68%"]],
      },
      {
        title: "Customer Churn Dashboard",
        year:  "2023",
        description:
          "Interactive cohort analysis in Tableau reducing churn identification from days to under five minutes for a 150-person analyst team.",
        stack:   ["SQL","Tableau","Python"],
        metrics: [["Churn Reduced","18%"],["Decision Time","↓ 95%"],["Active Users","150+"]],
      },
    ],
  },

  "data-scientist": {
    id: "data-scientist",
    label: "Data Scientist",
    shortLabel: "Scientist",
    accentHex: "#059669",
    descriptor: "Modeling the world with mathematics",
    stats: [
      { label: "Models Deployed",  value: "23"   },
      { label: "Experiments Run",  value: "340+" },
      { label: "Average F1 Score", value: "0.91" },
      { label: "Papers Studied",   value: "500+" },
    ],
    tools: ["PyTorch","Scikit-learn","HuggingFace","MLflow","Spark","SQL","Docker","Optuna"],
    projects: [
      {
        title: "Real-Time Fraud Detection",
        year:  "2024",
        description:
          "Ensemble of XGBoost and LightGBM scoring 500 K transactions per day with 99.1% precision, saving $4 M annually in prevented fraud losses.",
        stack:   ["Python","XGBoost","LightGBM","Kafka","FastAPI"],
        metrics: [["Precision","99.1%"],["Recall","97.4%"],["Latency","< 50 ms"]],
      },
      {
        title: "NLP Sentiment Classifier",
        year:  "2023",
        description:
          "Fine-tuned BERT on 200 K product reviews for five-class sentiment classification, deployed as a FastAPI microservice handling 1 K req/s.",
        stack:   ["PyTorch","HuggingFace","FastAPI","Docker"],
        metrics: [["Accuracy","93.7%"],["Throughput","1 K req/s"],["P99 Latency","< 80 ms"]],
      },
    ],
  },

  "ml-engineer": {
    id: "ml-engineer",
    label: "ML Engineer",
    shortLabel: "MLE",
    accentHex: "#d97706",
    descriptor: "Engineering intelligence at scale",
    stats: [
      { label: "Models in Production", value: "31"    },
      { label: "Inferences / Second",  value: "50 K+" },
      { label: "Infra Cost Reduction", value: "67%"   },
      { label: "Uptime SLA",           value: "99.9%" },
    ],
    tools: ["vLLM","Triton","Kubernetes","MLflow","Ray","Kafka","TensorRT","CUDA"],
    projects: [
      {
        title: "LLM Inference Platform",
        year:  "2024",
        description:
          "vLLM-based serving cluster with dynamic batching and KV-cache optimisation, sustaining 50 K req/s at P99 120 ms across eight GPU nodes.",
        stack:   ["vLLM","Triton","Kubernetes","Prometheus","CUDA"],
        metrics: [["Throughput","50 K req/s"],["P99 Latency","120 ms"],["GPU Util","94%"]],
      },
      {
        title: "Model Compression Pipeline",
        year:  "2023",
        description:
          "Automated quantisation and knowledge-distillation pipeline shrinking five production models 8× with less than 2% accuracy loss.",
        stack:   ["PyTorch","ONNX","TensorRT","Ray","Optuna"],
        metrics: [["Size Reduction","8×"],["Accuracy Loss","< 2%"],["Speed Gain","5.3×"]],
      },
    ],
  },

  "fullstack": {
    id: "fullstack",
    label: "Full Stack Dev",
    shortLabel: "Fullstack",
    accentHex: "#7c3aed",
    descriptor: "From pixel to database and back",
    stats: [
      { label: "Apps Shipped",     value: "42"   },
      { label: "API Endpoints",    value: "800+" },
      { label: "GitHub Stars",     value: "3.2 K" },
      { label: "Lighthouse Score", value: "98"   },
    ],
    tools: ["React","Next.js","Node.js","TypeScript","PostgreSQL","Redis","Docker","GraphQL"],
    projects: [
      {
        title: "SaaS Analytics Platform",
        year:  "2024",
        description:
          "Multi-tenant Next.js application with real-time dashboards, Stripe billing, and RBAC serving 50 K monthly active users at 99.95% uptime.",
        stack:   ["Next.js","PostgreSQL","Redis","Stripe","Vercel"],
        metrics: [["MAU","50 K"],["Uptime","99.95%"],["P95 Load","< 800 ms"]],
      },
      {
        title: "Collaborative Rich-Text Editor",
        year:  "2023",
        description:
          "CRDT-based document editor with WebSocket sync supporting 1 K concurrent users with zero merge conflicts and sub-50 ms round-trip latency.",
        stack:   ["React","Node.js","WebSockets","MongoDB"],
        metrics: [["Concurrent Users","1 K+"],["Sync Lag","< 50 ms"],["Conflicts","0%"]],
      },
    ],
  },

  "software-engineer": {
    id: "software-engineer",
    label: "Software Engineer",
    shortLabel: "SWE",
    accentHex: "#dc2626",
    descriptor: "Architecting systems that last",
    stats: [
      { label: "PRs Merged",       value: "1.2 K+" },
      { label: "LeetCode Solved",  value: "650+"   },
      { label: "Systems Designed", value: "30+"    },
      { label: "Code Reviews",     value: "2 K+"   },
    ],
    tools: ["Go","Java","Python","gRPC","Kafka","PostgreSQL","Redis","Terraform"],
    projects: [
      {
        title: "Distributed Cache Layer",
        year:  "2024",
        description:
          "Consistent-hashing distributed cache in Go with Raft-based replication achieving 2 M ops/s throughput and five-nines availability.",
        stack:   ["Go","gRPC","Raft","etcd","Prometheus"],
        metrics: [["Throughput","2 M ops/s"],["P99 Latency","< 5 ms"],["Availability","99.999%"]],
      },
      {
        title: "Event Sourcing Framework",
        year:  "2023",
        description:
          "Lightweight CQRS + Event Sourcing library for Java with full replay, snapshots, and projections — 420 GitHub stars and used across three teams.",
        stack:   ["Java","Kafka","PostgreSQL","Spring Boot"],
        metrics: [["Events / sec","100 K"],["Replay Time","< 30 s"],["Stars","420 ⭐"]],
      },
    ],
  },
};

const WORK_HISTORY = [
  { period:"2024 – Present", title:"Senior Data & AI Engineer", company:"Nexus AI",        summary:"Leading an ML platform team of six. Shipped the LLM inference platform handling 50 K req/s." },
  { period:"2022 – 2024",    title:"Data Scientist",            company:"FinEdge Corp",     summary:"Built fraud detection saving $4 M annually. Established the A/B testing framework from scratch." },
  { period:"2020 – 2022",    title:"Full Stack Developer",      company:"DevCraft Studios",  summary:"Delivered 12 production web applications. Mentored four junior engineers." },
  { period:"2018 – 2020",    title:"Software Engineer",         company:"CoreSystems Ltd",   summary:"Contributed to a distributed storage engine; sustained 2 M ops/s in production." },
];

const CERTIFICATIONS = [
  ["AWS Solutions Architect",     "Professional · 2024"],
  ["Google Cloud ML Engineer",    "Professional · 2023"],
  ["Databricks Analytics Eng.",   "Associate · 2023"],
  ["TensorFlow Developer",        "Google · 2022"],
  ["Certified Kubernetes Admin",  "CNCF · 2022"],
  ["dbt Analytics Engineer",      "dbt Labs · 2023"],
];

const EDUCATION = [
  { degree:"M.S. Computer Science", school:"Stanford University", year:"2018", note:"Machine Learning & Systems" },
  { degree:"B.S. Mathematics",      school:"UC Berkeley",         year:"2016", note:"Applied Mathematics & Statistics" },
];


// ── CUSTOM HOOKS ─────────────────────────────────────────────────────────────

// S principle: manages only role selection state.
function useRoleSelection(defaultId) {
  const [activeIds, setActiveIds] = useState([defaultId]);

  const toggle = useCallback((id) => {
    setActiveIds([id]);
  }, []);

  const primary      = ROLE_REGISTRY[activeIds[0]];
  const allProjects  = activeIds.flatMap(id => ROLE_REGISTRY[id].projects);
  const allTools     = [...new Set(activeIds.flatMap(id => ROLE_REGISTRY[id].tools))];

  return { activeIds, toggle, primary, allProjects, allTools };
}

// S principle: manages only current nav section.
function useNav(defaultSection) {
  const [current, setCurrent] = useState(defaultSection);
  return { current, navigate: setCurrent };
}


// ── PRIMITIVE / ATOMIC COMPONENTS ────────────────────────────────────────────
// I principle: each component has a minimal, focused prop surface.

function Label({ children, color }) {
  const { colors } = useThemeCtx();
  return (
    <span style={{
      fontFamily: T.font.mono,
      fontSize: "11px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: color || colors.inkFaint,
    }}>
      {children}
    </span>
  );
}

function Rule({ mt, mb }) {
  const { colors } = useThemeCtx();
  return (
    <hr style={{
      border: "none",
      borderTop: `1px solid ${colors.border}`,
      marginTop:    mt !== undefined ? px(mt) : 0,
      marginBottom: mb !== undefined ? px(mb) : 0,
    }} />
  );
}

function Chip({ children }) {
  const { colors } = useThemeCtx();
  return (
    <span style={{
      fontFamily: T.font.mono,
      fontSize: "12px",
      color: colors.inkMid,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: T.r.sm,
      padding: "2px 9px",
      display: "inline-block",
    }}>
      {children}
    </span>
  );
}

function Metric({ label, value, accent }) {
  const { colors } = useThemeCtx();
  return (
    <div>
      <div style={{ fontFamily: T.font.mono, fontSize: "11px", color: colors.inkFaint, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: T.font.mono, fontSize: "17px", fontWeight: 500, color: accent }}>
        {value}
      </div>
    </div>
  );
}

function PrimaryButton({ children, accent, href }) {
  return (
    <a href={href || "#"} style={{
      display: "inline-block",
      fontFamily: T.font.sans,
      fontSize: "14px",
      fontWeight: 600,
      color: "#fff",
      background: accent,
      padding: "10px 22px",
      borderRadius: T.r.md,
      textDecoration: "none",
      transition: T.ease,
      cursor: "pointer",
    }}>
      {children}
    </a>
  );
}

function GhostButton({ children, href }) {
  const { colors } = useThemeCtx();
  return (
    <a href={href || "#"} style={{
      display: "inline-block",
      fontFamily: T.font.sans,
      fontSize: "14px",
      fontWeight: 600,
      color: colors.ink,
      background: "none",
      border: `1px solid ${colors.borderStrong}`,
      padding: "10px 22px",
      borderRadius: T.r.md,
      textDecoration: "none",
      transition: T.ease,
      cursor: "pointer",
    }}>
      {children}
    </a>
  );
}

function TextInput({ label, type, rows, placeholder }) {
  const { colors } = useThemeCtx();
  const shared = {
    fontFamily: T.font.sans,
    fontSize: "14px",
    color: colors.ink,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: T.r.md,
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    resize: rows ? "vertical" : "none",
  };
  return (
    <div>
      <Label style={{ display: "block", marginBottom: 6 }}>{label}</Label>
      {rows
        ? <textarea rows={rows} style={shared} placeholder={placeholder} />
        : <input type={type || "text"} style={shared} placeholder={placeholder} />
      }
    </div>
  );
}


// ── COMPOSED COMPONENTS ───────────────────────────────────────────────────────

// I principle: RoleTab only needs: roleId, label, accentHex, isActive, onToggle.
function RoleTab({ roleId, label, accentHex, isActive, onToggle }) {
  const { colors } = useThemeCtx();
  return (
    <button
      onClick={() => onToggle(roleId)}
      aria-pressed={isActive}
      style={{
        fontFamily: T.font.sans,
        fontSize: "14px",
        fontWeight: isActive ? 600 : 400,
        color: isActive ? accentHex : colors.inkMid,
        background: "none",
        border: "none",
        borderBottom: `2px solid ${isActive ? accentHex : "transparent"}`,
        padding: "10px 0",
        cursor: "pointer",
        transition: T.ease,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// S principle: renders one stat only.
function StatCard({ label, value, accent }) {
  return (
    <div style={{ padding: `${px(T.space.md)} 0` }}>
      <div style={{
        fontFamily: T.font.serif,
        fontSize: "38px",
        fontWeight: 700,
        color: accent,
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <Label>{label}</Label>
    </div>
  );
}

// ── ThemeToggle (S + I principles: one job, minimal props) ───────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: T.font.mono,
        fontSize: "12px",
        color: isDark ? "#f0f0ee" : "#52525b",
        background: isDark ? "#2c2c28" : "#f4f4f0",
        border: `1px solid ${isDark ? "#3e3e3a" : "#cdcdc8"}`,
        borderRadius: "20px",
        padding: "5px 12px 5px 8px",
        cursor: "pointer",
        transition: "all 0.22s ease",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {/* Pill track */}
      <span style={{
        position: "relative",
        display: "inline-flex",
        width: "28px",
        height: "16px",
        background: isDark ? "#4a4a46" : "#d1d0ca",
        borderRadius: "10px",
        transition: "background 0.22s ease",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute",
          top: "2px",
          left: isDark ? "14px" : "2px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: isDark ? "#f0f0ee" : "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          transition: "left 0.22s ease",
        }} />
      </span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

// S principle: renders one project card only.
function ProjectCard({ project, accent }) {
  const { colors } = useThemeCtx();
  return (
    <article style={{
      padding: `${px(T.space.lg)} 0`,
      borderTop: `1px solid ${colors.border}`,
      transition: "border-color 0.22s ease",
    }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap: px(T.space.md), alignItems:"start" }}>
        <div>
          {/* Title + year */}
          <div style={{ display:"flex", alignItems:"baseline", gap: px(T.space.sm), flexWrap:"wrap", marginBottom: 10 }}>
            <h3 style={{
              fontFamily: T.font.serif,
              fontSize: "20px",
              fontWeight: 600,
              color: colors.ink,
              margin: 0,
              letterSpacing: "-0.02em",
              transition: "color 0.22s ease",
            }}>
              {project.title}
            </h3>
            <Label color={colors.inkFaint}>{project.year}</Label>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: T.font.sans,
            fontSize: "15px",
            lineHeight: 1.7,
            color: colors.inkMid,
            margin: `0 0 ${px(T.space.md)}`,
            maxWidth: "600px",
            transition: "color 0.22s ease",
          }}>
            {project.description}
          </p>

          {/* Metrics */}
          <div style={{ display:"flex", gap: px(T.space.xl), flexWrap:"wrap", marginBottom: px(T.space.md) }}>
            {project.metrics.map(([k,v]) => (
              <Metric key={k} label={k} value={v} accent={accent} />
            ))}
          </div>

          {/* Stack chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap: 6 }}>
            {project.stack.map(s => <Chip key={s}>{s}</Chip>)}
          </div>
        </div>

        {/* Links */}
        <div style={{ display:"flex", flexDirection:"column", gap: 8, alignItems:"flex-end" }}>
          {[["GitHub","#"],["Live Demo","#"]].map(([lbl, href]) => (
            <a key={lbl} href={href} style={{
              fontFamily: T.font.mono,
              fontSize: "12px",
              color: accent,
              textDecoration: "none",
              borderBottom: `1px solid ${accent}55`,
              paddingBottom: 1,
              whiteSpace: "nowrap",
            }}>
              {lbl} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

// S principle: renders one experience row only.
function ExperienceRow({ item, accent }) {
  const { colors } = useThemeCtx();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "140px 1fr",
      gap: px(T.space.lg),
      padding: `${px(T.space.md)} 0`,
      borderTop: `1px solid ${colors.border}`,
      transition: "border-color 0.22s ease",
    }}>
      <Label>{item.period}</Label>
      <div>
        <div style={{ display:"flex", gap: px(T.space.sm), alignItems:"baseline", flexWrap:"wrap", marginBottom: 5 }}>
          <span style={{ fontFamily:T.font.sans, fontWeight:600, fontSize:"15px", color:colors.ink, transition:"color 0.22s ease" }}>
            {item.title}
          </span>
          <span style={{ fontFamily:T.font.sans, fontSize:"14px", color:colors.inkFaint, transition:"color 0.22s ease" }}>
            — {item.company}
          </span>
        </div>
        <p style={{ fontFamily:T.font.sans, fontSize:"14px", lineHeight:1.65, color:colors.inkMid, margin:0, transition:"color 0.22s ease" }}>
          {item.summary}
        </p>
      </div>
    </div>
  );
}

// S principle: navigation only.
function NavBar({ sections, current, onNavigate, accent, isDark, onThemeToggle }) {
  const { colors } = useThemeCtx();
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: colors.navBg,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${colors.border}`,
      transition: "background 0.22s ease, border-color 0.22s ease",
    }}>
      <div style={{
        maxWidth: "880px",
        margin: "0 auto",
        padding: `0 ${px(T.space.xl)}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "56px",
        gap: px(T.space.md),
      }}>
        <span style={{
          fontFamily: T.font.serif,
          fontSize: "19px",
          fontWeight: 700,
          color: colors.ink,
          letterSpacing: "-0.02em",
          flexShrink: 0,
          transition: "color 0.22s ease",
        }}>
          Alex Morgan
        </span>

        <nav style={{ display:"flex", gap: px(T.space.lg), alignItems:"center" }}>
          {sections.map(s => (
            <button key={s} onClick={() => onNavigate(s)} style={{
              fontFamily: T.font.sans,
              fontSize: "14px",
              fontWeight: current === s ? 600 : 400,
              color: current === s ? accent : colors.inkMid,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              textTransform: "capitalize",
              transition: T.ease,
            }}>
              {s}
            </button>
          ))}
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
        </nav>
      </div>
    </header>
  );
}

// S principle: role switching UI only.
function RoleSwitcher({ roles, activeIds, onToggle }) {
  const { colors } = useThemeCtx();
  return (
    <div style={{ borderBottom:`1px solid ${colors.border}`, display:"flex", gap: px(T.space.lg), flexWrap:"wrap", transition:"border-color 0.22s ease" }}>
      {roles.map(r => (
        <RoleTab
          key={r.id}
          roleId={r.id}
          label={r.label}
          accentHex={r.accentHex}
          isActive={activeIds.includes(r.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}


// ── SECTION VIEWS ─────────────────────────────────────────────────────────────
// O principle: each section is a self-contained component.
// To add a new section, add a component here + one entry to SECTION_MAP.

function OverviewSection({ role, stats, tools, projects }) {
  const { accentHex } = role;
  const { colors } = useThemeCtx();
  return (
    <div style={{ animation:"fadeIn 0.22s ease" }}>

      {/* Hero */}
      <section style={{ padding:`${px(T.space.xxl)} 0 ${px(T.space.xl)}` }}>
        <Label color={accentHex}>{role.descriptor}</Label>

        <h1 style={{
          fontFamily: T.font.serif,
          fontSize: "clamp(44px, 6.5vw, 76px)",
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          color: colors.ink,
          transition: "color 0.22s ease",
          margin: `${px(T.space.sm)} 0 ${px(T.space.md)}`,
        }}>
          Senior<br />
          <span style={{ color: accentHex }}>Technologist.</span>
        </h1>

        <p style={{
          fontFamily: T.font.sans,
          fontSize: "17px",
          lineHeight: 1.75,
          color: colors.inkMid,
          transition: "color 0.22s ease",
          maxWidth: "500px",
          margin: `0 0 ${px(T.space.lg)}`,
        }}>
          Six years building data systems, ML infrastructure, and full-stack applications — from a single SQL query to a 50 K req/s inference platform.
        </p>

        <div style={{ display:"flex", gap: px(T.space.md) }}>
          <PrimaryButton accent={accentHex}>Download Resume</PrimaryButton>
          <GhostButton>View GitHub</GhostButton>
        </div>
      </section>

      <Rule />

      {/* Stats */}
      <section style={{ padding:`${px(T.space.xl)} 0` }}>
        <Label>Key Metrics</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: px(T.space.lg), marginTop: px(T.space.md) }}>
          {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} accent={accentHex} />)}
        </div>
      </section>

      <Rule />

      {/* Tools */}
      <section style={{ padding:`${px(T.space.xl)} 0` }}>
        <Label>Tools & Technologies</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap: 7, marginTop: px(T.space.md) }}>
          {tools.map(t => <Chip key={t}>{t}</Chip>)}
        </div>
      </section>

      <Rule />

      {/* About */}
      <section style={{ padding:`${px(T.space.xl)} 0` }}>
        <Label>About</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: px(T.space.xl), marginTop: px(T.space.md) }}>
          <p style={{ fontFamily:T.font.sans, fontSize:"15px", lineHeight:1.75, color:colors.inkMid, margin:0, transition:"color 0.22s ease" }}>
            I'm a multi-disciplinary technologist with deep expertise across the data and software engineering spectrum — building ML systems at scale, architecting full-stack products, and turning raw data into strategic decisions. I thrive at the intersection of <em style={{ color: accentHex }}>science</em>, <em style={{ color: accentHex }}>engineering</em>, and <em style={{ color: accentHex }}>product thinking</em>.
          </p>
          <div>
            {[
              ["Location",    "San Francisco, CA"],
              ["Availability","Open to roles"],
              ["Preferred",   "Remote / Hybrid"],
              ["Education",   "M.S. Computer Science"],
              ["Languages",   "English, Spanish"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:`${px(T.space.sm)} 0`, borderBottom:`1px solid ${colors.border}`, fontSize:"14px" }}>
                <Label>{k}</Label>
                <span style={{ fontFamily:T.font.sans, color:colors.inkMid, transition:"color 0.22s ease" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Rule />

      {/* Selected projects (first 2) */}
      <section style={{ padding:`${px(T.space.xl)} 0 0` }}>
        <Label>Selected Work</Label>
        {projects.slice(0, 2).map((p,i) => <ProjectCard key={i} project={p} accent={accentHex} />)}
      </section>
    </div>
  );
}

function ProjectsSection({ role, projects }) {
  const { accentHex } = role;
  const { colors } = useThemeCtx();
  return (
    <div style={{ animation:"fadeIn 0.22s ease" }}>
      <section style={{ padding:`${px(T.space.xl)} 0 0` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom: px(T.space.lg) }}>
          <h2 style={{ fontFamily:T.font.serif, fontSize:"30px", fontWeight:700, color:colors.ink, transition:"color 0.22s ease", letterSpacing:"-0.03em", margin:0 }}>
            All Projects
          </h2>
          <Label>{projects.length} total</Label>
        </div>
        {projects.map((p,i) => <ProjectCard key={i} project={p} accent={accentHex} />)}
      </section>
    </div>
  );
}

function ExperienceSection({ role }) {
  const { accentHex } = role;
  const { colors } = useThemeCtx();
  return (
    <div style={{ animation:"fadeIn 0.22s ease" }}>

      <section style={{ padding:`${px(T.space.xl)} 0` }}>
        <Label>Work History</Label>
        {WORK_HISTORY.map((e,i) => <ExperienceRow key={i} item={e} accent={accentHex} />)}
      </section>

      <Rule mt={0} mb={T.space.xl} />

      <section style={{ paddingBottom: px(T.space.xl) }}>
        <Label>Education</Label>
        {EDUCATION.map((e,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"140px 1fr", gap: px(T.space.lg), padding:`${px(T.space.md)} 0`, borderTop:`1px solid ${colors.border}`, transition:"border-color 0.22s ease" }}>
            <Label>{e.year}</Label>
            <div>
              <div style={{ fontFamily:T.font.sans, fontWeight:600, fontSize:"15px", color:colors.ink, transition:"color 0.22s ease", marginBottom:4 }}>{e.degree}</div>
              <div style={{ fontFamily:T.font.sans, fontSize:"14px", color:colors.inkFaint, transition:"color 0.22s ease" }}>{e.school} — {e.note}</div>
            </div>
          </div>
        ))}
      </section>

      <Rule mb={T.space.xl} />

      <section style={{ paddingBottom: px(T.space.xl) }}>
        <Label>Certifications</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: px(T.space.md), marginTop: px(T.space.md) }}>
          {CERTIFICATIONS.map(([name, sub]) => (
            <div key={name} style={{
              padding: px(T.space.md),
              border: `1px solid ${colors.border}`,
              borderRadius: T.r.md,
              background: colors.surface,
              transition: "background 0.22s ease, border-color 0.22s ease",
            }}>
              <div style={{ fontFamily:T.font.sans, fontSize:"13px", fontWeight:600, color:colors.ink, marginBottom:5, transition:"color 0.22s ease" }}>{name}</div>
              <Label>{sub}</Label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactSection({ role }) {
  const { accentHex } = role;
  const { colors } = useThemeCtx();
  return (
    <div style={{ animation:"fadeIn 0.22s ease" }}>
      <section style={{ padding:`${px(T.space.xl)} 0` }}>
        <h2 style={{
          fontFamily: T.font.serif,
          fontSize: "clamp(30px, 5vw, 52px)",
          fontWeight: 700,
          color: colors.ink,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          transition: "color 0.22s ease",
          margin: `0 0 ${px(T.space.sm)}`,
        }}>
          Let's work together.
        </h2>
        <p style={{ fontFamily:T.font.sans, fontSize:"16px", lineHeight:1.7, color:colors.inkMid, maxWidth:"440px", margin:`0 0 ${px(T.space.xl)}`, transition:"color 0.22s ease" }}>
          Open to senior IC roles, staff engineering positions, and technical leadership in AI/ML, data, and full-stack engineering.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: px(T.space.xxl) }}>
          {/* Links */}
          <div>
            <Label>Reach Me</Label>
            {[
              ["Email",      "alex@morgan.dev"],
              ["LinkedIn",   "linkedin.com/in/alexmorgan"],
              ["GitHub",     "github.com/alexmorgan"],
              ["Twitter / X","@alexmorgan_dev"],
            ].map(([platform, handle]) => (
              <div key={platform} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:`${px(T.space.sm)} 0`,
                borderTop:`1px solid ${colors.border}`,
              }}>
                <Label>{platform}</Label>
                <a href="#" style={{ fontFamily:T.font.sans, fontSize:"14px", color:accentHex, textDecoration:"none", borderBottom:`1px solid ${accentHex}50` }}>
                  {handle}
                </a>
              </div>
            ))}

            <div style={{
              marginTop: px(T.space.lg),
              display:"inline-flex",
              alignItems:"center",
              gap: 8,
              padding:"8px 14px",
              background:`${accentHex}12`,
              border:`1px solid ${accentHex}30`,
              borderRadius: T.r.md,
            }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:accentHex }} />
              <Label color={accentHex}>Available for new roles</Label>
            </div>
          </div>

          {/* Form */}
          <div style={{ display:"flex", flexDirection:"column", gap: px(T.space.md) }}>
            <Label>Send a Message</Label>
            <TextInput label="Name"    placeholder="Your name" />
            <TextInput label="Email"   type="email" placeholder="you@example.com" />
            <TextInput label="Message" rows={5} placeholder="Tell me about the role or project" />
            <div>
              <PrimaryButton accent={accentHex}>Send Message</PrimaryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// ── SECTION MAP ───────────────────────────────────────────────────────────────
// O + D principles: UI depends on this abstraction. Add sections here without
// touching NavBar, the root component, or any other existing component.
const SECTION_MAP = {
  overview:   OverviewSection,
  projects:   ProjectsSection,
  experience: ExperienceSection,
  contact:    ContactSection,
};

// S principle: resolves section component, renders nothing else.
function SectionRenderer({ sectionId, sharedProps }) {
  const Component = SECTION_MAP[sectionId];
  return Component ? <Component {...sharedProps} /> : null;
}


// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const { activeIds, toggle, primary, allProjects, allTools } = useRoleSelection("data-scientist");
  const { current, navigate } = useNav("overview");
  const { isDark, toggle: toggleTheme, colors } = useTheme();

  const roles    = Object.values(ROLE_REGISTRY);
  const accent   = primary.accentHex;
  const sections = Object.keys(SECTION_MAP);

  // D principle: section views receive a role abstraction, not concrete IDs.
  const sharedProps = {
    role:     primary,
    stats:    primary.stats,
    tools:    allTools,
    projects: allProjects,
    accent,
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggle: toggleTheme }}>
      <div style={{
        minHeight: "100vh",
        background: colors.paper,
        color: colors.ink,
        transition: "background 0.22s ease, color 0.22s ease",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
          a:hover { opacity: 0.7; }
          input, textarea { transition: border-color 0.18s ease, background 0.22s ease, color 0.22s ease; }
          input:focus, textarea:focus { border-color: ${accent} !important; outline: none !important; }
          button { transition: opacity 0.16s ease; }
          button:hover { opacity: 0.75; }
        `}</style>

        {/* Navigation — receives isDark + onThemeToggle for the toggle button */}
        <NavBar
          sections={sections}
          current={current}
          onNavigate={navigate}
          accent={accent}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />

        <main style={{ maxWidth:"880px", margin:"0 auto", padding:`0 ${px(T.space.xl)}` }}>
          {/* Role tabs */}
          <div style={{ paddingTop: px(T.space.md) }}>
            <RoleSwitcher roles={roles} activeIds={activeIds} onToggle={toggle} />
          </div>

          {/* Active section */}
          <SectionRenderer sectionId={current} sharedProps={sharedProps} />
        </main>

        {/* Footer */}
        <footer style={{
          borderTop:`1px solid ${colors.border}`,
          marginTop: px(T.space.xxl),
          padding:`${px(T.space.lg)} ${px(T.space.xl)}`,
          transition: "border-color 0.22s ease",
        }}>
          <div style={{ maxWidth:"880px", margin:"0 auto", display:"flex", justifyContent:"space-between" }}>
            <Label>© 2025 Alex Morgan</Label>
            <Label>{activeIds.map(id => ROLE_REGISTRY[id].shortLabel).join(" · ")} · San Francisco, CA</Label>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}


