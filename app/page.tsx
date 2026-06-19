"use client";

import React, { useState, useEffect } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const SAMPLE_MESSAGES: Message[] = [
  { id: 1, role: "user", content: "What's causing fault code P0128 on asset #ECX-4471?" },
  {
    id: 2,
    role: "assistant",
    content:
      "P0128 is a **coolant temperature below thermostat regulating temperature** fault. On asset #ECX-4471 (2019 Cat 320 Excavator), this usually points to one of three things:\n\n**Most likely — thermostat stuck open.** The coolant never reaches operating temp, so the ECM throws P0128. Replacement is straightforward and the part is in stock at your Wichita branch (Part #1W-2451).\n\n**Less likely — coolant temp sensor drift.** The sensor can read low without a true thermostat failure. Worth checking resistance values before replacing the thermostat.\n\n**Rare — low coolant level.** Check the reservoir first as a quick win.\n\nThis asset has had two prior P0128 events (March and August last year), both resolved with thermostat replacement. I'd prioritise that.",
  },
  { id: 3, role: "user", content: "Is the thermostat part in stock nearby?" },
  {
    id: 4,
    role: "assistant",
    content:
      "Yes — Part #1W-2451 (Cat thermostat, 83°C rating) is available at two nearby locations:\n\n- **Wichita branch** — 4 units on hand, ~12 miles from the asset's current location\n- **Oklahoma City branch** — 7 units on hand, ~94 miles\n\nWichita is the obvious pick. I can add it to an open work order or create a new one — want me to draft a work order for this repair and assign it to the next available tech in that area?",
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
  { id: "c1", title: "P0128 fault — ECX-4471", date: "Today" },
  { id: "c2", title: "Work order WO-88231 parts", date: "Yesterday" },
  { id: "c3", title: "Fleet downtime summary Q2", date: "Mon" },
  { id: "c4", title: "Hydraulic leak diagnosis D6T", date: "Last week" },
  { id: "c5", title: "PM schedule — Tulsa fleet", date: "Last week" },
];

// ── Icons ────────────────────────────────────────────────────────────
const ICON_SIZE = 18;

const SVG_PATHS: Record<string, string> = {
  add: "M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z",
  arrow_upward: "M440-647 244-451q-12 12-28 11.5T188-452q-11-12-11.5-28t11.5-28l264-264q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l264 264q11 11 11 27.5T772-452q-12 12-28.5 12T715-452L520-647v447q0 17-11.5 28.5T480-160q-17 0-28.5-11.5T440-200v-447Z",
  close: "M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z",
  delete: "M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM428.5-291.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5ZM280-720v520-520Z",
  menu: "M160-240q-17 0-28.5-11.5T120-280q0-17 11.5-28.5T160-320h640q17 0 28.5 11.5T840-280q0 17-11.5 28.5T800-240H160Zm0-200q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h640q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H160Zm0-200q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h640q17 0 28.5 11.5T840-680q0 17-11.5 28.5T800-640H160Z",
  mic: "M395-435q-35-35-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35q-50 0-85-35Zm85-205Zm-40 480v-83q-92-13-157.5-78T203-479q-2-17 9-29t28-12q17 0 28.5 11.5T284-480q14 70 69.5 115T480-320q72 0 127-45.5T676-480q4-17 15.5-28.5T720-520q17 0 28 12t9 29q-14 91-79 157t-158 79v83q0 17-11.5 28.5T480-120q-17 0-28.5-11.5T440-160Zm68.5-331.5Q520-503 520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480q17 0 28.5-11.5Z",
  search: "M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z",
  edit: "M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z",
  expand_more: "M465-363.5q-7-2.5-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5q-8 0-15-2.5Z",
  more_vert: "M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z",
  stop: "M240-320v-320q0-33 23.5-56.5T320-720h320q33 0 56.5 23.5T720-640v320q0 33-23.5 56.5T640-240H320q-33 0-56.5-23.5T240-320Zm80 0h320v-320H320v320Zm160-160Z",
  logout: "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h240q17 0 28.5 11.5T480-160q0 17-11.5 28.5T440-120H200Zm487-320H400q-17 0-28.5-11.5T360-480q0-17 11.5-28.5T400-520h287l-75-75q-11-11-11-27t11-28q11-12 28-12.5t29 11.5l143 143q12 12 12 28t-12 28L669-309q-12 12-28.5 11.5T612-310q-11-12-10.5-28.5T613-366l74-74Z",
  camera: "M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l50-54q11-12 26.5-19t32.5-7h170q17 0 32.5 7t26.5 19l50 54h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z",
  attach: "M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-330q0-17 11.5-28.5T400-720q17 0 28.5 11.5T440-680v330q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-350q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680v350Z",
};

function Icon({ name, size = ICON_SIZE, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  const path = SVG_PATHS[name];
  if (path) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" style={{ display: "block", flexShrink: 0, userSelect: "none", ...style }}>
        <path d={path} />
      </svg>
    );
  }
  // Fallback to Material Symbols for icons without a provided SVG (expand_more, edit, stop, etc.)
  return (
    <span className="ms" style={{ fontSize: size, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", ...style }}>
      {name}
    </span>
  );
}

const ScrapIcon = () => (
  <img src="/logo.jpeg" alt="Scoop" width={32} height={32} style={{ borderRadius: 8, display: "block", objectFit: "cover" }} />
);

// ── Helpers ──────────────────────────────────────────────────────────

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgb(241,102,34)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
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
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_")) return <em key={i} style={{ color: "#7a7a78" }}>{part.slice(1, -1)}</em>;
    return part;
  });
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
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  const [view, setView] = useState<"home" | "chat">("home");
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [dataSourcesOpen, setDataSourcesOpen] = useState(false);
  const [chatsSearchOpen, setChatsSearchOpen] = useState(false);
  const [chatsQuery, setChatsQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatTitle, setChatTitle] = useState("P0128 fault — ECX-4471");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
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

  function sendSuggestion(userText: string, reply: string) {
    const nextId = Date.now();
    setMessages([
      { id: nextId, role: "user", content: userText },
      { id: nextId + 1, role: "assistant", content: reply },
    ]);
    setChatTitle(userText);
    setView("chat");
  }

  function handleStop() {
    setThinking(false);
    setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "Scoop's response was interrupted." }]);
  }

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
    <div className="scoop-app" style={{ fontFamily: "var(--font-instrument), system-ui, sans-serif", background: bg, height: "100vh", display: "flex", flexDirection: "column", color: textPrimary, transition: "background 0.2s, color 0.2s", overflow: "hidden" }}>

      {/* ── Backdrop (sidebar + apps) ─────────────────────────── */}
      {(sidebarOpen || chatMenuOpen) && (
        <div
          onClick={() => { setSidebarOpen(false); setChatMenuOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 20, background: sidebarOpen ? "rgba(0,0,0,0.25)" : "transparent", backdropFilter: sidebarOpen ? "blur(1px)" : "none" }}
        />
      )}

      {/* ── Search chats modal ────────────────────────────────── */}
      {chatsSearchOpen && (
        <div
          onClick={() => { setChatsSearchOpen(false); setChatsQuery(""); }}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: surface, borderRadius: r.lg, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", width: "min(560px, 90vw)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${border}` }}>
              <Icon name="search" style={{ color: textMuted, flexShrink: 0 }} />
              <input
                autoFocus
                value={chatsQuery}
                onChange={e => setChatsQuery(e.target.value)}
                placeholder="Search chats…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: textPrimary, fontFamily: "inherit" }}
              />
              {chatsQuery && (
                <button onClick={() => setChatsQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="close" />
                </button>
              )}
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto", padding: "6px 8px" }}>
              {PAST_CHATS.filter(c => c.title.toLowerCase().includes(chatsQuery.toLowerCase())).map(chat => (
                <button
                  key={chat.id}
                  onClick={() => { setChatsSearchOpen(false); setChatsQuery(""); setSidebarOpen(false); setView("chat"); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: r.md, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ fontSize: 14, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</span>
                  <span style={{ fontSize: 12, color: textMuted, flexShrink: 0, marginLeft: 12 }}>{chat.date}</span>
                </button>
              ))}
              {PAST_CHATS.filter(c => c.title.toLowerCase().includes(chatsQuery.toLowerCase())).length === 0 && (
                <p style={{ fontSize: 14, color: textMuted, padding: "12px" }}>No chats found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ─────────────────────────────────────── */}
      {renameOpen && (
        <div
          onClick={() => setRenameOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: surface, borderRadius: r.lg, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", width: "min(420px, 90vw)", padding: 24 }}
          >
            <p style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }}>Rename chat</p>
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && renameValue.trim()) { setChatTitle(renameValue.trim()); setRenameOpen(false); } if (e.key === "Escape") setRenameOpen(false); }}
              style={{ width: "100%", background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.md, padding: "10px 14px", fontSize: 14, color: textPrimary, fontFamily: "inherit", outline: "none", marginBottom: 16 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setRenameOpen(false)} style={{ padding: "8px 16px", borderRadius: r.md, border: `1px solid ${border}`, background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, fontFamily: "inherit" }}>Cancel</button>
              <button
                onClick={() => { if (renameValue.trim()) { setChatTitle(renameValue.trim()); setRenameOpen(false); } }}
                style={{ padding: "8px 16px", borderRadius: r.md, border: "none", background: "rgb(241,102,34)", cursor: "pointer", fontSize: 14, color: "#fff", fontFamily: "inherit", fontWeight: 500 }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 340,
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
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 16, flexShrink: 0 }}>
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
            style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 6, borderRadius: r.sm, display: "flex", alignItems: "center", justifyContent: "center" }}
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
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: dark ? "#3a3a3a" : "#FDDBC8", color: textPrimary, flexShrink: 0 }}><Icon name="add" size={16} /></span>
            New chat
          </button>
          {/* Chats */}
          <button
            onClick={() => { setChatsSearchOpen(o => !o); setChatsQuery(""); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", minHeight: 40, borderRadius: r.md, border: "none", background: chatsSearchOpen ? hoverBg : "none", cursor: "pointer", color: textPrimary, fontSize: 14, fontWeight: 400, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = chatsSearchOpen ? hoverBg : "none")}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0 }}><Icon name="search" size={18} /></span>
            Search chats
          </button>
        </nav>

        {/* Sidebar scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>

          {/* Apps — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setAppsOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Apps</span>
              <Icon name="expand_more" style={{ transform: appsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
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
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Data sources</span>
              <Icon name="expand_more" style={{ transform: dataSourcesOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
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
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Dev tools</span>
              <Icon name="expand_more" style={{ transform: devToolsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
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
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 36, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Settings</span>
              <Icon name="expand_more" style={{ transform: settingsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
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

          {/* Recents */}
          <div style={{ marginBottom: 8, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const, color: textMuted }}>Recents</span>
            </div>
            {PAST_CHATS.map(chat => (
              <button
                key={chat.id}
                onClick={() => { setSidebarOpen(false); setView("chat"); }}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px", minHeight: 36, borderRadius: r.md, border: "none", background: chat.id === "c1" ? hoverBg : "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = chat.id === "c1" ? hoverBg : "none")}
              >
                {chat.title}
              </button>
            ))}
          </div>

        </div>

        {/* ── Account pinned to bottom ──────────────────────────── */}
        <div style={{ padding: 8, borderTop: `1px solid ${border}`, position: "relative" }}>
          {accountMenuOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% - 4px)", left: 8, right: 8, background: surface, border: `1px solid ${border}`, borderRadius: r.md, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 40, padding: "4px 0", overflow: "hidden" }}>
              <button
                onClick={() => setAccountMenuOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", background: "none", cursor: "pointer", color: "#c0392b", fontSize: 14, fontWeight: 400, textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <Icon name="logout" />
                Log out
              </button>
            </div>
          )}
          <button
            onClick={() => setAccountMenuOpen(o => !o)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: r.md, border: "none", background: accountMenuOpen ? hoverBg : "none", cursor: "pointer", color: textPrimary, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = accountMenuOpen ? hoverBg : "none")}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0D9488", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>R</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rebecca Story</p>
              <p style={{ fontSize: 11, color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>rebecca.story@equipmentshare.com</p>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header
        style={{ background: bg, height: 52, display: "flex", alignItems: "center", paddingInline: "8px 16px", gap: 4, position: "sticky", top: 0, zIndex: 10, transition: "background 0.2s" }}
      >
        {/* Hamburger — sidebar only, no label */}
        <button
          onClick={() => openSidebar()}
          style={{ color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: r.sm }}
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
              {chatTitle}
              <Icon name="expand_more" style={{ color: textMuted, flexShrink: 0 }} />
            </button>
            {chatMenuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: surface, border: `1px solid ${border}`, borderRadius: r.md, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 40, minWidth: 160, padding: "4px 0", overflow: "hidden" }}>
                <button
                  onClick={() => { setChatMenuOpen(false); setRenameValue(chatTitle); setRenameOpen(true); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", background: "none", cursor: "pointer", color: textMuted, fontSize: 14, fontWeight: 400, textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Icon name="edit" />
                  Rename
                </button>
                <button
                  onClick={() => { setChatMenuOpen(false); setChatTitle("Garage door recommendations"); setView("home"); }}
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
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 680, width: "100%", padding: "0 16px 80px" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 600, color: textPrimary, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 12 }}>Ask about any part,<br />fault, or service.</h2>
            <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.5, maxWidth: isMobile ? 220 : "none", margin: "0 auto" }}>Scoop pulls from your manuals, work orders, and fleet data.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%", marginBottom: 32, justifyContent: "center" }}>
            {[
              { title: "Find a part", reply: "Sure — what part, and which asset or model is it for?" },
              { title: "Diagnose an issue", reply: "Got a fault code? Paste it. Otherwise tell me what it's doing and which asset (e.g. won't start, 451123)." },
              { title: "Find a service kit", reply: "Which asset, and what interval — 50, 250, 500 hour?" },
              { title: "Find a manual", reply: "Which machine or asset do you need the manual for?" },
            ].map(s => (
              <button
                key={s.title}
                onClick={() => sendSuggestion(s.title, s.reply)}
                style={{ textAlign: "left", padding: isMobile ? "0 14px" : "7px 14px", minHeight: isMobile ? 42 : "auto", borderRadius: r.lg, border: "none", background: dark ? "#2a2a2a" : "#edecea", cursor: "pointer", fontFamily: "inherit", boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.08)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = dark ? "#555" : "#ccc")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: "nowrap" }}>{s.title}</p>
              </button>
            ))}
          </div>
          {/* Input on home screen */}
          <div style={{ width: "100%", background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isMobile ? "Ask about a part, fault or service" : "Ask about a part, fault, service or anything else"}
              rows={1}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "16px 18px 0" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 14px" }}>
              {/* Discovery state: muted, no border */}
              <button style={{ height: isMobile ? 40 : 34, padding: "0 8px", borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: textMuted, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="add" size={20} />Add file or photo</button>
              <div style={{ flex: 1 }} />
              <button style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="mic" size={24} /></button>
              <button
                onClick={() => thinking ? handleStop() : handleSend()}
                style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, background: "rgb(241,102,34)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 0.15s", marginLeft: 8 }}
              ><Icon name={thinking ? "stop" : "arrow_upward"} size={18} /></button>
            </div>
          </div>
        </div></div>
      )}

      {/* ── Chat body ────────────────────────────────────────────── */}
      {view === "chat" && <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 20, paddingTop: 28, paddingBottom: 32 }}>
          {messages.map(msg => (
            msg.role === "user" ? (
              // ── User bubble ────────────────────────────────────
              <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 8 }}>
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
            <div style={{ paddingTop: 12, fontSize: 14, color: textMuted, animation: "pulse 1.6s ease-in-out infinite" }}>
              Thinking…
            </div>
          )}
        </div>

      </div>
      <div style={{ background: bg, paddingBottom: 24, paddingTop: 8, flexShrink: 0 }}>
        <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isMobile ? "Ask about a part, fault or service" : "Ask about a part, fault, service or anything else"}
              rows={1}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "16px 18px 0" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 14px" }}>
              {/* Active conversation: icon only */}
              <button style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="add" size={20} /></button>
              <div style={{ flex: 1 }} />
              <button style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="mic" size={24} /></button>
              <button
                onClick={() => thinking ? handleStop() : handleSend()}
                style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, background: (thinking || input.trim()) ? "rgb(241,102,34)" : dark ? "#333" : "#e5e5e3", border: "none", cursor: (thinking || input.trim()) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: (thinking || input.trim()) ? "#fff" : textMuted, transition: "background 0.15s", marginLeft: 8 }}
              ><Icon name={thinking ? "stop" : "arrow_upward"} size={18} /></button>
            </div>
          </div>
        </div>
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
