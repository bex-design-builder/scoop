"use client";

import React, { useState, useEffect } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const SAMPLE_MESSAGES: Message[] = [
  { id: 1, role: "user", content: "What garage door styles do you recommend for a modern home?" },
  {
    id: 2,
    role: "assistant",
    content:
      "For a modern home, I'd suggest a few directions depending on your aesthetic:\n\n**Sectional panel doors** with a flush or ribbed profile are the most popular choice — clean lines, low maintenance, and available in powder-coated colours or timber-look finishes.\n\n**Full-view aluminium doors** with glass panels make a bold statement and flood your garage with natural light. They work especially well when the garage is visible from the street.\n\n**Tilt-a-door** styles in a smooth finish are a more budget-friendly option that still looks contemporary.\n\nWould you like me to go into detail on any of these, or talk through insulation and security options?",
  },
  { id: 3, role: "user", content: "Tell me more about full-view aluminium doors." },
  {
    id: 4,
    role: "assistant",
    content:
      "Full-view aluminium doors are a premium option that suits modern and architectural homes really well. Here's a quick breakdown:\n\n- **Frame:** Extruded aluminium — strong, rust-proof, and lightweight\n- **Panels:** Tempered glass (clear, frosted, or tinted) or aluminium infill sections\n- **Colours:** Powder-coated in virtually any RAL colour — black frames are very on-trend right now\n- **Insulation:** Can be double-glazed for better thermal and acoustic performance\n\nThe main trade-off is **cost** — they're typically 30–50% more expensive than a comparable sectional door — and **privacy**, since clear glass is very transparent at night when your garage is lit.\n\nI can arrange for Chris to come out and measure up if you'd like a quote. What's your location?",
  },
];

const APPS = [
  {
    group: "Apps",
    items: [
      { name: "Fleet insights", desc: "Fleet-wide maintenance hotspots, cost drivers, and anomaly detection" },
      { name: "Work orders", desc: "AI-first work order research and diagnosis" },
      { name: "Find parts", desc: "Search by part number, equipment model, or symptom" },
      { name: "Monitor assets", desc: "Run health checkups and review sensor, DTC, and triage data" },
    ],
  },
  {
    group: "Data Sources",
    items: [
      { name: "Explore Slack", desc: "Search and browse the service-techs knowledge archive" },
      { name: "Manuals search", desc: "Search service manuals for procedures, specs, and troubleshooting" },
    ],
  },
];

const DEV_TOOLS = [
  { name: "Explore events", desc: "Inspect and evaluate Scoop agent conversations" },
  { name: "Usage dashboard", desc: "Scoop usage analytics, agent behavior, and feedback metrics" },
  { name: "Changelog", desc: "Release notes and recent changes" },
];

const PAST_CHATS = [
  { id: "c1", title: "Garage door recommendations", date: "Today" },
  { id: "c2", title: "Spring replacement quote", date: "Yesterday" },
  { id: "c3", title: "Tilt-a-door vs sectional", date: "Mon" },
  { id: "c4", title: "Motor upgrade options", date: "Last week" },
  { id: "c5", title: "Service booking — Warkworth", date: "Last week" },
];

// ── Icons ────────────────────────────────────────────────────────────
// All icons use Material Symbols Rounded at a unified 18px optical size.

const ICON_SIZE = 18;

function Icon({ name, size = ICON_SIZE, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  return (
    <span className="ms" style={{ fontSize: size, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", ...style }}>
      {name}
    </span>
  );
}

const ScrapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#D97706" />
    <path d="M6 20h4l1.5-8h1L14 20h4l-2-12H10L8 16H6v4Z" fill="white" opacity="0.9" />
    <rect x="5" y="19" width="18" height="3" rx="1.5" fill="white" opacity="0.7" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="5" r="2.5" fill="white" />
          <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0D9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "#fff", fontSize: 12, fontWeight: 600 }}>
      R
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function formatContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("- "))
      return <li key={i} style={{ marginLeft: 18, display: "list-item", listStyleType: "disc" }}>{renderInline(line.slice(2))}</li>;
    if (line === "") return <br key={i} />;
    return <p key={i}>{renderInline(line)}</p>;
  });
}

// ── Page ─────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState("");
  const [messages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  const [view, setView] = useState<"home" | "chat">("chat");
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [dataSourcesOpen, setDataSourcesOpen] = useState(false);
  const [chatsSearchOpen, setChatsSearchOpen] = useState(false);
  const [chatsQuery, setChatsQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close sidebar on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSidebarOpen(false); setChatMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSend() {
    setView("chat");
    setThinking(true);
    setTimeout(() => setThinking(false), 3000);
  }

  function handleStop() { setThinking(false); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (isMobile) return; // always line break on mobile
      if (e.shiftKey) return; // shift+enter = line break on desktop
      e.preventDefault();
      handleSend();
    }
  }

  const bg        = dark ? "#1a1a1a" : "#f5f5f3";
  const surface   = dark ? "#242424" : "#ffffff";
  const sidebarBg = dark ? "#1a1a1a" : "#f5f5f3";
  const border    = dark ? "#333"    : "#e5e5e3";
  const textPrimary = dark ? "#f0f0ef" : "#1a1a1a";
  const textMuted   = dark ? "#888"   : "#7a7a78";
  const inputBg     = dark ? "#2a2a2a" : "#fafaf9";
  const hoverBg     = dark ? "#2e2e2e" : "#f0f0ef";

  // ── Radius scale — change BASE to restyle all elements at once ──
  const BASE = 8;
  const r = {
    sm:  BASE - 2,       // 6  — icon buttons, close button
    md:  BASE,           // 8  — menu items, action buttons
    lg:  BASE + 4,       // 12 — cards, dropdowns, prompt tiles
    xl:  BASE + 6,       // 14 — input box, sidebar panel top
    pill: BASE - 1,      // 7  — segmented toggle outer
    seg: BASE - 3,       // 5  — segmented toggle inner pill
  };

  function openSidebar() {
    setSidebarOpen(true);
  }

  return (
    <div className="scoop-app" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", background: bg, minHeight: "100vh", display: "flex", flexDirection: "column", color: textPrimary, transition: "background 0.2s, color 0.2s" }}>

      {/* ── Backdrop (sidebar + apps) ─────────────────────────── */}
      {(sidebarOpen || chatMenuOpen) && (
        <div
          onClick={() => { setSidebarOpen(false); setChatMenuOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 20, background: sidebarOpen ? "rgba(0,0,0,0.25)" : "transparent", backdropFilter: sidebarOpen ? "blur(1px)" : "none" }}
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 272,
          zIndex: 30,
          background: sidebarBg,
          borderRight: `1px solid ${border}`,
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.10)" : "none",
        }}
      >
        {/* Sidebar header */}
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 16, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <button
            onClick={() => { setSidebarOpen(false); setView("home"); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: r.pill }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary, letterSpacing: "-0.01em" }}>Scoop</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 6, borderRadius: r.sm, display: "flex", alignItems: "center" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "8px 8px 0", flexShrink: 0 }}>
          {/* New chat */}
          <button
            onClick={() => { setSidebarOpen(false); setView("home"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", minHeight: 40, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", color: textPrimary, fontSize: 14, fontWeight: 400, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: dark ? "#3a3a3a" : "#e2e2e0", color: textPrimary, flexShrink: 0 }}><Icon name="add" /></span>
            New chat
          </button>
          {/* Chats */}
          <button
            onClick={() => { setChatsSearchOpen(o => !o); setChatsQuery(""); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", minHeight: 40, borderRadius: r.md, border: "none", background: chatsSearchOpen ? hoverBg : "none", cursor: "pointer", color: textPrimary, fontSize: 14, fontWeight: 400, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = chatsSearchOpen ? hoverBg : "none")}
          >
            <Icon name="chat_bubble" style={{ color: textMuted, flexShrink: 0 }} />
            Chats
          </button>
          {/* Chat search pane */}
          {chatsSearchOpen && (
            <div style={{ padding: "6px 4px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: inputBg, border: `1px solid ${border}`, borderRadius: r.md, padding: "6px 10px", marginBottom: 4 }}>
                <Icon name="search" style={{ color: textMuted, flexShrink: 0 }} />
                <input
                  autoFocus
                  value={chatsQuery}
                  onChange={e => setChatsQuery(e.target.value)}
                  placeholder="Search chats…"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: textPrimary, fontFamily: "inherit" }}
                />
              </div>
              {PAST_CHATS.filter(c => c.title.toLowerCase().includes(chatsQuery.toLowerCase())).map(chat => (
                <button
                  key={chat.id}
                  onClick={() => { setSidebarOpen(false); setChatsSearchOpen(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: r.md, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ fontSize: 13, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</span>
                  <span style={{ fontSize: 11, color: textMuted, flexShrink: 0, marginLeft: 8 }}>{chat.date}</span>
                </button>
              ))}
              {PAST_CHATS.filter(c => c.title.toLowerCase().includes(chatsQuery.toLowerCase())).length === 0 && (
                <p style={{ fontSize: 13, color: textMuted, padding: "6px 10px" }}>No chats found</p>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>

          {/* Recents */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 12, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: textMuted }}>Recents</span>
            </div>
            {PAST_CHATS.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px", minHeight: 36, borderRadius: r.md, border: "none", background: chat.id === "c1" ? hoverBg : "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = chat.id === "c1" ? hoverBg : "none")}
              >
                {chat.title}
              </button>
            ))}
          </div>

          {/* Apps — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setAppsOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Apps</span>
              <Icon name="expand_more" style={{ transform: appsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {appsOpen && APPS[0].items.map(app => (
              <button key={app.name} onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >{app.name}</button>
            ))}
          </div>

          {/* Data Sources — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setDataSourcesOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Data Sources</span>
              <Icon name="expand_more" style={{ transform: dataSourcesOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {dataSourcesOpen && APPS[1].items.map(app => (
              <button key={app.name} onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >{app.name}</button>
            ))}
          </div>

          {/* Dev Tools — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setDevToolsOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Dev Tools</span>
              <Icon name="expand_more" style={{ transform: devToolsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {devToolsOpen && DEV_TOOLS.map(tool => (
              <button
                key={tool.name}
                onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {tool.name}
              </button>
            ))}
          </div>

          {/* Settings — collapsible, same pattern as Dev Tools */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Settings</span>
              <Icon name="expand_more" style={{ transform: settingsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {settingsOpen && (
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px" }}>
                  <span style={{ fontSize: 13, color: textPrimary }}>Appearance</span>
                  <div style={{ display: "flex", background: dark ? "#333" : "#e8e8e6", borderRadius: r.pill, padding: 2, gap: 2 }}>
                    {(["Light", "Dark"] as const).map(opt => (
                      <button key={opt} onClick={() => setDark(opt === "Dark")}
                        style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: r.seg, border: "none", cursor: "pointer", background: (opt === "Dark") === dark ? (dark ? "#555" : "#fff") : "transparent", color: (opt === "Dark") === dark ? textPrimary : textMuted, boxShadow: (opt === "Dark") === dark ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px" }}>
                  <span style={{ fontSize: 13, color: textPrimary }}>Language</span>
                  <div style={{ display: "flex", background: dark ? "#333" : "#e8e8e6", borderRadius: r.pill, padding: 2, gap: 2 }}>
                    {(["EN", "ES"] as const).map(opt => (
                      <button key={opt} onClick={() => setLang(opt.toLowerCase() as "en" | "es")}
                        style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: r.seg, border: "none", cursor: "pointer", background: lang === opt.toLowerCase() ? (dark ? "#555" : "#fff") : "transparent", color: lang === opt.toLowerCase() ? textPrimary : textMuted, boxShadow: lang === opt.toLowerCase() ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Account pinned to bottom ──────────────────────────── */}
        <div style={{ padding: 8, borderTop: `1px solid ${border}` }}>
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: r.md, border: "none", background: "none", cursor: "pointer", color: textPrimary, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0D9488", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>R</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rebecca Story</p>
              <p style={{ fontSize: 11, color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>rebecca.story@equipmentshare.com</p>
            </div>
            <Icon name="expand_more" style={{ color: textMuted, flexShrink: 0 }} />
          </button>
        </div>
      </aside>

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header
        style={{ background: bg, borderBottom: `1px solid ${border}`, height: 52, display: "flex", alignItems: "center", paddingInline: 16, gap: 12, position: "sticky", top: 0, zIndex: 10, transition: "background 0.2s, border-color 0.2s" }}
      >
        {/* Hamburger — sidebar only, no label */}
        <button
          onClick={() => openSidebar()}
          style={{ color: textMuted, display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: r.sm }}
          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
        >
          <Icon name="menu" />
        </button>

        {view === "home" ? (
          <button
            onClick={() => setView("home")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: r.pill }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <ScrapIcon />
            <span style={{ fontSize: 16, fontWeight: 600, color: textPrimary, letterSpacing: "-0.01em" }}>Scoop</span>
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setChatMenuOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: chatMenuOpen ? hoverBg : "none", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: r.pill, color: textPrimary, fontSize: 14, fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = chatMenuOpen ? hoverBg : "none")}
            >
              Garage door recommendations
              <Icon name="expand_more" style={{ color: textMuted, flexShrink: 0 }} />
            </button>
            {chatMenuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: surface, border: `1px solid ${border}`, borderRadius: r.md, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 40, minWidth: 160, padding: "4px 0", overflow: "hidden" }}>
                <button
                  onClick={() => setChatMenuOpen(false)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", background: "none", cursor: "pointer", color: textPrimary, fontSize: 14, fontWeight: 400, textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Icon name="edit" />
                  Rename
                </button>
                <button
                  onClick={() => { setChatMenuOpen(false); setView("home"); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", background: "none", cursor: "pointer", color: "#c0392b", fontSize: 14, fontWeight: 400, textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Icon name="delete" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />
      </header>

      {/* ── Home screen ──────────────────────────────────────────── */}
      {view === "home" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: 680, width: "100%", margin: "0 auto", padding: "0 16px 80px" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <ScrapIcon />
            <h2 style={{ fontSize: 24, fontWeight: 600, color: textPrimary, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 8 }}>How can I help you today?</h2>
            <p style={{ fontSize: 15, color: textMuted }}>Ask about equipment, work orders, parts, or anything else.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginBottom: 32 }}>
            {[
              { title: "Diagnose a fault code", desc: "Paste a DTC and get a plain-English explanation with next steps" },
              { title: "Find a part", desc: "Search by part number, equipment model, or symptom description" },
              { title: "Summarise a work order", desc: "Drop in a work order ID and get a quick summary of findings" },
              { title: "Check asset health", desc: "Run a health check on an asset and review recent sensor data" },
            ].map(s => (
              <button
                key={s.title}
                onClick={() => setView("chat")}
                style={{ textAlign: "left", padding: "14px 16px", borderRadius: r.lg, border: `1px solid ${border}`, background: surface, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = dark ? "#555" : "#ccc")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{s.title}</p>
                <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.45 }}>{s.desc}</p>
              </button>
            ))}
          </div>
          {/* Input on home screen */}
          <div style={{ width: "100%", background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "14px 14px 6px" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 8px" }}>
              <button style={{ width: 30, height: 30, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="add" /></button>
              <div style={{ flex: 1 }} />
              <button style={{ width: 30, height: 30, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="mic" /></button>
              <button
                onClick={() => thinking ? handleStop() : handleSend()}
                style={{ width: 30, height: 30, borderRadius: r.md, background: thinking ? (dark ? "#555" : "#e5e5e3") : "#D97706", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: thinking ? textMuted : "#fff", transition: "background 0.15s" }}
              ><Icon name={thinking ? "stop" : "arrow_upward"} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat body ────────────────────────────────────────────── */}
      {view === "chat" && <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 28, paddingBottom: 32 }}>
          {messages.map(msg => (
            msg.role === "user" ? (
              // ── User bubble ────────────────────────────────────
              <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: dark ? "#2e2e2e" : "#ececea", borderRadius: "18px 18px 4px 18px", padding: "11px 16px", fontSize: 15, lineHeight: 1.55, color: textPrimary, maxWidth: "80%" }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              // ── Assistant response ──────────────────────────────
              <div key={msg.id} style={{ paddingTop: 8, fontSize: 15, lineHeight: 1.7, color: textPrimary }}>
                {formatContent(msg.content)}
              </div>
            )
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div style={{ paddingTop: 12, fontSize: 14, color: textMuted, fontStyle: "italic", animation: "pulse 1.6s ease-in-out infinite" }}>
              Thinking…
            </div>
          )}
        </div>

        {/* ── Input area ───────────────────────────────────────── */}
        <div style={{ position: "sticky", bottom: 0, background: bg, paddingBottom: 24, paddingTop: 8 }}>
          <div style={{ background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "14px 14px 6px" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 8px" }}>
              <button style={{ width: 30, height: 30, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="add" /></button>
              <div style={{ flex: 1 }} />
              <button style={{ width: 30, height: 30, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="mic" /></button>
              <button
                onClick={() => thinking ? handleStop() : handleSend()}
                style={{ width: 30, height: 30, borderRadius: r.md, background: thinking ? (dark ? "#555" : "#e5e5e3") : input.trim() ? "#D97706" : dark ? "#333" : "#e5e5e3", border: "none", cursor: (thinking || input.trim()) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: (thinking || input.trim()) ? (thinking ? textMuted : "#fff") : textMuted, transition: "background 0.15s" }}
              ><Icon name={thinking ? "stop" : "arrow_upward"} /></button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: textMuted, textAlign: "center", marginTop: 10 }}>Scoop can make mistakes. Check important information.</p>
        </div>
      </div>}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        li { display: list-item; }
        .scoop-app h1, .scoop-app h2, .scoop-app h3,
        .scoop-app h4, .scoop-app h5, .scoop-app h6 { font-family: inherit; letter-spacing: inherit; }
        .ms {
          font-family: 'Material Symbols Rounded';
          font-weight: normal;
          font-style: normal;
          font-size: 18px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
          font-feature-settings: 'liga';
          user-select: none;
        }
      ` }} />
    </div>
  );
}
