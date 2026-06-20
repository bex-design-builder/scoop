"use client";

import React, { useState, useEffect, useRef } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  muted?: boolean;
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
  { id: "docs", title: "📋 App documentation — for developers", date: "Pinned" },
  { id: "c1", title: "P0128 fault — ECX-4471", date: "Today" },
  { id: "c2", title: "Work order WO-88231 parts", date: "Yesterday" },
  { id: "c3", title: "Fleet downtime summary Q2", date: "Mon" },
  { id: "c4", title: "Hydraulic leak diagnosis D6T", date: "Last week" },
  { id: "c5", title: "PM schedule — Tulsa fleet", date: "Last week" },
];

const DOCS_MESSAGES: Message[] = [
  { id: 101, role: "user", content: "Can you give me a full overview of how this app works?" },
  {
    id: 102, role: "assistant",
    content: "Here's a full rundown of Scoop — how it's structured, how each feature works, and things to know before making changes.\n\n---\n\n**App structure**\n\nThe app has two screens: a **home screen** and a **chat screen**. The user starts on the home screen and moves into the chat once they send a message or tap a quick-start button.\n\nThe home screen is a calm landing state — a headline, a short description, four quick-start buttons, and an input field. Nothing is open by default.\n\nOnce a conversation is underway, the screen shifts to a three-layer layout:\n- The **header bar** at the top — always fixed. Shows the menu icon and the current conversation title.\n- The **message area** in the middle — the only part that scrolls. New messages appear at the bottom and the view follows them automatically.\n- The **input bar** at the bottom — always fixed. The user can always reach it without scrolling, no matter how long the conversation gets.\n\nIf the user types a long message, the input bar grows upward into the message area — nothing overlaps. It expands up to around 7–8 lines, then becomes scrollable internally. The send and mic buttons stay anchored to the bottom of the input bar as it grows.\n\n---\n\n**Quick-start buttons**\n\nBelow the headline on the home screen are four suggestion buttons — Find a part, Diagnose an issue, Find a service kit, and Find a manual. Tapping one immediately sends a pre-written message on the user's behalf and triggers a contextually relevant response from Scoop — the conversation starts instantly, without a blank screen moment.\n\nThe intent is that the response feels like a natural opening to a real conversation, not a canned FAQ answer. As the product develops, these responses should prompt the user to give more detail (like an asset number or fault code) rather than trying to answer in full without enough information.\n\n---\n\n**Side menu**\n\nThe side menu slides in from the left when the user taps the menu icon in the top-left corner. A semi-transparent overlay covers the rest of the screen — tapping it closes the menu.\n\nNavigation is organised into collapsible sections so it doesn't feel overwhelming:\n- **New chat** — returns to the home screen\n- **Search chats** — opens a focused search overlay that filters conversations in real time as the user types. Tapping a result opens that conversation. Escape or tapping outside closes it.\n- **My tools** — connected integrations (named 'My tools' rather than 'Apps' — language that feels natural to a field technician)\n- **My data** — connected data sources, using plain language rather than 'Data sources'\n- **Dev tools** — visible during development/testing\n- **Settings** — appearance, language, and font preferences\n- **Recent conversations** — list of past chats. The active one is highlighted. Each has a three-dot menu on hover/long-press with options to rename or delete.\n- **Account** (pinned to bottom) — name and email. Tapping reveals a log out option.\n\n---\n\n**Rename a conversation**\n\nFrom the three-dot menu on any recent conversation, the user can rename it. This opens a modal with the current title pre-filled — so they can edit rather than retype. Saving updates the title in both the header and the recents list. Cancel or Escape closes without any change.\n\n---\n\n**Mobile behaviours**\n\nMobile is detected by whether the device uses a touch pointer — not by screen width. A tablet with a keyboard attached is treated as a desktop.\n\n- Every tappable element is at least 48×48px on touch devices, with at least 8px between adjacent targets\n- Input text is 16px — anything smaller triggers iOS Safari auto-zoom on focus\n- The app uses a modern viewport unit that accounts for the browser's address bar and bottom chrome on mobile\n- On mobile, Enter adds a new line. On desktop, Enter sends; Shift+Enter adds a new line.\n\n---\n\n**Accessibility (WCAG 2.1 AA)**\n\n- All text meets minimum 4.5:1 contrast ratio against its background\n- Escape closes the sidebar, menus, and modals\n- Tab is trapped inside open modals so focus can't escape behind the overlay\n- Every interactive element shows a visible orange focus ring when reached by keyboard\n- Every icon-only button has a screen reader label\n- Collapsible sections, menus, and modals use the correct ARIA roles and states\n- The sidebar is hidden from screen readers when closed\n- An announcement region notifies screen readers when Scoop is thinking or a new response arrives\n- All animations are disabled for users who have reduced motion turned on\n\n---\n\n**Things to know before making changes**\n\n- Tooltips are desktop-only — they appear on hover for mouse/trackpad users and are hidden on touch screens entirely\n- User messages in the chat show Copy and Edit buttons. On desktop they appear on hover; on mobile they're always visible. Copy writes the message to the clipboard and confirms with a checkmark icon. Edit opens an inline text field spanning the full conversation width, pre-filled with the message — the user can make changes and tap Send to update it, or Cancel to close without saving. Enter sends on desktop; Escape cancels.\n- The delete confirmation modal is intentional — the action is irreversible and the extra step prevents accidents",
  },
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
  content_copy: "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Zm160-240v-480 480Z",
  check: "M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z",
  thumb_up: "M840-640q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14H280v-520l240-238q15-15 35.5-17.5T595-888q19 10 28 28t4 37l-45 183h258Zm-480 34v406h360l120-280v-80H480l54-220-174 174ZM160-120q-33 0-56.5-23.5T80-200v-360q0-33 23.5-56.5T160-640h120v80H160v360h120v80H160Zm200-80v-406 406Z",
  thumb_down: "M120-320q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14h440v520L440-82q-15 15-35.5 17.5T365-72q-19-10-28-28t-4-37l45-183H120Zm480-34v-406H240L120-480v80h360l-54 220 174-174Zm200-486q33 0 56.5 23.5T880-760v360q0 33-23.5 56.5T800-320H680v-80h120v-360H680v-80h120Zm-200 80v406-406Z",
  thumb_up_filled: "M840-640q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14H400q-33 0-56.5-23.5T320-200v-407q0-16 6.5-30.5T344-663l217-216q15-14 35.5-17t39.5 7q19 10 27.5 28t3.5 37l-45 184h218ZM160-120q-33 0-56.5-23.5T80-200v-360q0-33 23.5-56.5T160-640q33 0 56.5 23.5T240-560v360q0 33-23.5 56.5T160-120Z",
  thumb_down_filled: "M120-320q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14h320q33 0 56.5 23.5T640-760v407q0 16-6.5 30.5T616-297L399-81q-15 14-35.5 17T324-71q-19-10-27.5-28t-3.5-37l45-184H120Zm680-520q33 0 56.5 23.5T880-760v360q0 33-23.5 56.5T800-320q-33 0-56.5-23.5T720-400v-360q0-33 23.5-56.5T800-840Z",
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

// ── Focus trap (for modals) ──────────────────────────────────────────
function trapFocus(e: React.KeyboardEvent<HTMLDivElement>) {
  if (e.key !== "Tab") return;
  const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// ── Tooltip ──────────────────────────────────────────────────────────
function Tooltip({ label, children, position = "bottom" }: { label: string; children: React.ReactNode; position?: "top" | "bottom" | "left" | "right" }) {
  return (
    <span className={`tt-wrap tt-${position}`} data-tip={label} style={{ position: "relative", display: "inline-flex" }}>
      {children}
    </span>
  );
}

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
  const [useInter, setUseInter] = useState(false);
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down" | null>>({});
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedMsgId, setCopiedMsgId] = useState<number | null>(null);
  const homeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    [homeTextareaRef, chatTextareaRef].forEach(ref => {
      if (!ref.current) return;
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    });
  }, [input]);

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
    setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "Scoop's response was interrupted.", muted: true }]);
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
  const textMuted   = dark ? "#9b9b9b" : "#686866";
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

  // Letter spacing — Inter needs less positive tracking at small sizes and
  // less negative tracking at large sizes than Instrument Sans.
  const ls = {
    heading:  useInter ? "-0.02em"  : "-0.03em",  // 36px display heading
    wordmark: useInter ? "0"        : "-0.01em",  // "Scoop" logo/header
    label:    useInter ? "-0.01em"  : "0.02em",   // 13px sidebar section labels
    body:     useInter ? "-0.011em" : "normal",   // 16px conversation text
  };

  function openSidebar() {
    setSidebarOpen(true);
  }

  return (
    <div className="scoop-app" style={{ fontFamily: useInter ? "var(--font-inter), system-ui, sans-serif" : "var(--font-instrument), system-ui, sans-serif", background: bg, height: "100dvh", display: "flex", flexDirection: "column", color: textPrimary, transition: "background 0.2s, color 0.2s", overflow: "hidden" }}>

      {/* ── Screen-reader live region for AI responses ────────── */}
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        {thinking ? "Scoop is thinking…" : messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1].content : ""}
      </div>

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
            role="dialog"
            aria-modal="true"
            aria-label="Search chats"
            onClick={e => e.stopPropagation()}
            onKeyDown={trapFocus}
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
                <Tooltip label="Clear" position="bottom">
                  <button onClick={() => setChatsQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="close" />
                  </button>
                </Tooltip>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
            onClick={e => e.stopPropagation()}
            onKeyDown={trapFocus}
            style={{ background: surface, borderRadius: r.lg, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", width: "min(420px, 90vw)", padding: 24 }}
          >
            <p id="rename-dialog-title" style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }}>Rename chat</p>
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
                style={{ padding: "8px 16px", borderRadius: r.md, border: "none", background: "rgb(241,102,34)", cursor: "pointer", fontSize: 14, color: "#fff", fontFamily: "inherit", fontWeight: 600 }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ────────────────────────── */}
      {deleteOpen && (
        <div
          onClick={() => setDeleteOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onClick={e => e.stopPropagation()}
            onKeyDown={trapFocus}
            style={{ background: surface, borderRadius: r.lg, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", width: "min(420px, 90vw)", padding: 24 }}
          >
            <p id="delete-dialog-title" style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>Delete chat</p>
            <p style={{ fontSize: 14, color: textPrimary, marginBottom: 24, lineHeight: 1.5 }}>Are you sure you want to delete this chat?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                autoFocus
                onClick={() => setDeleteOpen(false)}
                style={{ padding: "10px 20px", borderRadius: r.md, border: `1px solid ${border}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: textPrimary, fontFamily: "inherit" }}
              >Cancel</button>
              <button
                onClick={() => { setDeleteOpen(false); setView("home"); }}
                style={{ padding: "10px 20px", borderRadius: r.md, border: "none", background: "#c0392b", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "inherit" }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      <aside
        aria-label="Sidebar navigation"
        aria-hidden={!sidebarOpen}
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
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: r.pill, minHeight: 48 }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary, letterSpacing: ls.wordmark }}>Scoop</span>
          </button>
          <Tooltip label="Close sidebar" position="bottom">
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 6, borderRadius: r.sm, display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Icon name="close" />
            </button>
          </Tooltip>
        </div>

        {/* Nav items */}
        <nav aria-label="Main navigation" style={{ padding: "8px 8px 0", flexShrink: 0 }}>
          {/* New chat */}
          <button
            onClick={() => { setSidebarOpen(false); setView("home"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", color: textPrimary, fontSize: 14, textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: dark ? "#3a3a3a" : "#FDDBC8", color: textPrimary, flexShrink: 0 }}><Icon name="add" size={16} /></span>
            New chat
          </button>
          {/* Chats */}
          <button
            onClick={() => { setChatsSearchOpen(o => !o); setChatsQuery(""); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", minHeight: 40, borderRadius: r.md, border: "none", background: chatsSearchOpen ? hoverBg : "none", cursor: "pointer", color: textPrimary, fontSize: 14, textAlign: "left" }}
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
              aria-expanded={appsOpen}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: ls.label, textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Apps</span>
              <Icon name="expand_more" style={{ transform: appsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
            </button>
            {appsOpen && APPS[0].items.map(app => (
              <button key={app.name} onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >{app.name}</button>
            ))}
          </div>

          {/* Data Sources — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setDataSourcesOpen(o => !o)}
              aria-expanded={dataSourcesOpen}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: ls.label, textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Data sources</span>
              <Icon name="expand_more" style={{ transform: dataSourcesOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
            </button>
            {dataSourcesOpen && APPS[1].items.map(app => (
              <button key={app.name} onClick={() => setSidebarOpen(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >{app.name}</button>
            ))}
          </div>

          {/* Dev Tools — collapsible */}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setDevToolsOpen(o => !o)}
              aria-expanded={devToolsOpen}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: ls.label, textTransform: "none" as const, color: textMuted, textAlign: "left" }}
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
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px 0 20px", minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
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
              aria-expanded={settingsOpen}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, paddingInline: 12, minHeight: 48, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: ls.label, textTransform: "none" as const, color: textMuted, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ flex: 1 }}>Settings</span>
              <Icon name="expand_more" style={{ transform: settingsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
            </button>
            {settingsOpen && (
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px" }}>
                  <span style={{ fontSize: 14, color: textPrimary }}>Appearance</span>
                  <div role="radiogroup" aria-label="Appearance" style={{ display: "flex", background: dark ? "#333" : "#e8e8e6", borderRadius: r.pill, padding: 2, gap: 2 }}>
                    {(["Light", "Dark"] as const).map(opt => (
                      <button key={opt} role="radio" aria-checked={(opt === "Dark") === dark} onClick={() => setDark(opt === "Dark")}
                        style={{ fontSize: 13, fontWeight: 500, padding: "4px 10px", borderRadius: r.seg, border: "none", cursor: "pointer", background: (opt === "Dark") === dark ? (dark ? "#555" : "#fff") : "transparent", color: (opt === "Dark") === dark ? textPrimary : textMuted, boxShadow: (opt === "Dark") === dark ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px" }}>
                  <span style={{ fontSize: 14, color: textPrimary }}>Language</span>
                  <div role="radiogroup" aria-label="Language" style={{ display: "flex", background: dark ? "#333" : "#e8e8e6", borderRadius: r.pill, padding: 2, gap: 2 }}>
                    {(["EN", "ES"] as const).map(opt => (
                      <button key={opt} role="radio" aria-checked={lang === opt.toLowerCase()} onClick={() => setLang(opt.toLowerCase() as "en" | "es")}
                        style={{ fontSize: 13, fontWeight: 500, padding: "4px 10px", borderRadius: r.seg, border: "none", cursor: "pointer", background: lang === opt.toLowerCase() ? (dark ? "#555" : "#fff") : "transparent", color: lang === opt.toLowerCase() ? textPrimary : textMuted, boxShadow: lang === opt.toLowerCase() ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px" }}>
                  <span style={{ fontSize: 14, color: textPrimary }}>Font</span>
                  <div role="radiogroup" aria-label="Font" style={{ display: "flex", background: dark ? "#333" : "#e8e8e6", borderRadius: r.pill, padding: 2, gap: 2 }}>
                    {(["Instrument", "Inter"] as const).map(opt => {
                      const active = opt === "Inter" ? useInter : !useInter;
                      return (
                        <button key={opt} role="radio" aria-checked={active} onClick={() => setUseInter(opt === "Inter")}
                          style={{ fontSize: 13, fontWeight: 500, padding: "4px 10px", borderRadius: r.seg, border: "none", cursor: "pointer", background: active ? (dark ? "#555" : "#fff") : "transparent", color: active ? textPrimary : textMuted, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                        >{opt}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recents */}
          <div style={{ marginBottom: 8, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: ls.label, textTransform: "none" as const, color: textMuted }}>Recents</span>
            </div>
            {PAST_CHATS.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setSidebarOpen(false);
                  setView("chat");
                  setChatTitle(chat.title);
                  setMessages(chat.id === "docs" ? DOCS_MESSAGES : SAMPLE_MESSAGES);
                }}
                style={{ width: "100%", display: "flex", alignItems: "center", textAlign: "left", padding: "0 12px", minHeight: 48, borderRadius: r.md, border: "none", background: chat.id === "c1" ? hoverBg : "none", cursor: "pointer", fontSize: 14, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
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
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", minHeight: 48, border: "none", background: "none", cursor: "pointer", color: "#c0392b", fontSize: 14, textAlign: "left" }}
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
            aria-haspopup="true"
            aria-expanded={accountMenuOpen}
            aria-label="Account menu"
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
        style={{ background: bg, height: 52, display: "flex", alignItems: "center", paddingInline: "8px 16px", gap: 4, position: "sticky", top: 0, zIndex: 25, transition: "background 0.2s" }}
      >
        {/* Hamburger — sidebar only, no label */}
        <Tooltip label="Open sidebar" position="bottom">
          <button
            onClick={() => openSidebar()}
            style={{ color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: r.sm, minWidth: 48, minHeight: 48 }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Icon name="menu" />
          </button>
        </Tooltip>

        {view === "home" ? (
          <button
            onClick={() => setView("home")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: r.pill, minHeight: 48 }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <ScrapIcon />
            <span style={{ fontSize: 16, fontWeight: 600, color: textPrimary, letterSpacing: ls.wordmark }}>Scoop</span>
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setChatMenuOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={chatMenuOpen}
              aria-label={`Chat options for ${chatTitle}`}
              style={{ display: "flex", alignItems: "center", gap: 6, background: chatMenuOpen ? hoverBg : "none", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: r.pill, color: textPrimary, fontSize: 14, fontWeight: 600, minHeight: 48 }}
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
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", minHeight: 48, border: "none", background: "none", cursor: "pointer", color: textPrimary, fontSize: 14, textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Icon name="edit" />
                  Rename
                </button>
                <button
                  onClick={() => { setChatMenuOpen(false); setDeleteOpen(true); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", minHeight: 48, border: "none", background: "none", cursor: "pointer", color: "#c0392b", fontSize: 14, textAlign: "left" }}
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
            <h2 style={{ fontSize: 36, fontWeight: 600, color: textPrimary, letterSpacing: ls.heading, lineHeight: 1.2, marginBottom: 12 }}>Ask about any part,<br />fault, or service.</h2>
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
                style={{ textAlign: "left", padding: isMobile ? "0 14px" : "7px 14px", minHeight: isMobile ? 48 : "auto", borderRadius: r.lg, border: "none", background: dark ? "#2a2a2a" : "#edecea", cursor: "pointer", fontFamily: "inherit", boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.08)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = dark ? "#555" : "#ccc")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
              >
                <p style={{ whiteSpace: "nowrap", fontSize: 14 }}>{s.title}</p>
              </button>
            ))}
          </div>
          {/* Input on home screen */}
          <div style={{ width: "100%", background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Scoop anything"
              rows={1}
              ref={homeTextareaRef}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "16px 18px 10px", maxHeight: 200, overflowY: "auto" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 14px" }}>
              {/* Discovery state: muted, no border */}
              <button style={{ height: isMobile ? 48 : 34, padding: "0 8px", borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: textPrimary, fontSize: 14, whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              ><Icon name="add" size={20} />Add file or photo</button>
              <div style={{ flex: 1 }} />
              <Tooltip label="Use microphone" position="top">
                <button aria-label="Use microphone" style={{ width: isMobile ? 48 : 34, height: isMobile ? 48 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                ><Icon name="mic" size={24} /></button>
              </Tooltip>
              <Tooltip label={thinking ? "Stop" : "Send"} position="top">
                <button
                  aria-label={thinking ? "Stop" : "Send"}
                  onClick={() => thinking ? handleStop() : handleSend()}
                  style={{ width: isMobile ? 48 : 34, height: isMobile ? 48 : 34, borderRadius: r.md, background: input.trim() ? "rgb(241,102,34)" : dark ? "#333" : "#e5e5e3", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() ? "#fff" : textMuted, transition: "background 0.15s", marginLeft: 8 }}
                ><Icon name={thinking ? "stop" : "arrow_upward"} size={18} /></button>
              </Tooltip>
            </div>
          </div>
        </div></div>
      )}

      {/* ── Chat body ────────────────────────────────────────────── */}
      {view === "chat" && <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, paddingTop: 28, paddingBottom: 32 }}>
          {messages.map(msg => (
            msg.role === "user" ? (
              // ── User bubble ────────────────────────────────────
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingBottom: 8, gap: isMobile ? 0 : 6 }}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                {editingMsgId === msg.id ? (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                      style={{ width: "100%", background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.md, padding: "11px 16px", fontSize: 16, fontWeight: 500, letterSpacing: ls.body, lineHeight: 1.55, color: textPrimary, outline: "none", resize: "none", fontFamily: "inherit", minHeight: 48 }}
                      onKeyDown={e => {
                        if (e.key === "Escape") { setEditingMsgId(null); setEditValue(""); }
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: editValue } : m));
                          setEditingMsgId(null); setEditValue("");
                        }
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditingMsgId(null); setEditValue(""); }} style={{ padding: "6px 14px", borderRadius: r.md, border: `1px solid ${border}`, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: textPrimary }}>Cancel</button>
                      <button onClick={() => { setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: editValue } : m)); setEditingMsgId(null); setEditValue(""); }} style={{ padding: "6px 14px", borderRadius: r.md, border: "none", background: "rgb(241,102,34)", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff" }}>Send</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: dark ? "#2e2e2e" : "#ececea", borderRadius: "18px 18px 4px 18px", padding: "11px 16px", fontSize: 16, fontWeight: 500, letterSpacing: ls.body, lineHeight: 1.55, color: textPrimary, maxWidth: "80%" }}>
                    {msg.content}
                  </div>
                )}
                {editingMsgId !== msg.id && (
                  <div style={{ display: "flex", gap: isMobile ? 8 : 2, opacity: isMobile || hoveredMsgId === msg.id ? 1 : 0, transition: "opacity 0.15s" }}>
                    <Tooltip label={copiedMsgId === msg.id ? "Copied!" : "Copy"} position="bottom">
                      <button
                        aria-label="Copy message"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 1500);
                        }}
                        style={{ width: isMobile ? 48 : 30, height: isMobile ? 48 : 30, borderRadius: r.sm, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copiedMsgId === msg.id ? "rgb(241,102,34)" : textMuted, transition: "color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <Icon name={copiedMsgId === msg.id ? "check" : "content_copy"} size={isMobile ? 16 : 18} />
                      </button>
                    </Tooltip>
                    <Tooltip label="Edit" position="bottom">
                      <button
                        aria-label="Edit message"
                        onClick={() => { setEditingMsgId(msg.id); setEditValue(msg.content); }}
                        style={{ width: isMobile ? 48 : 30, height: isMobile ? 48 : 30, borderRadius: r.sm, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <Icon name="edit" size={isMobile ? 16 : 18} />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            ) : (
              // ── Assistant response ──────────────────────────────
              <div key={msg.id} style={{ paddingTop: 8, fontSize: 16, fontWeight: 500, letterSpacing: ls.body, lineHeight: 1.7, color: msg.muted ? textMuted : textPrimary }}>
                {formatContent(msg.content)}
                <div style={{ display: "flex", gap: isMobile ? 8 : 4, marginTop: 10 }}>
                  {(["up", "down"] as const).map(dir => {
                    const active = feedback[msg.id] === dir;
                    return (
                      <Tooltip key={dir} label={dir === "up" ? "Good response" : "Bad response"} position="bottom">
                        <button
                          onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === dir ? null : dir }))}
                          aria-pressed={active}
                          aria-label={dir === "up" ? "Good response" : "Bad response"}
                          style={{ width: isMobile ? 48 : 30, height: isMobile ? 48 : 30, borderRadius: r.md, border: "none", background: active ? hoverBg : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: active ? textPrimary : textMuted, transition: "background 0.15s, color 0.15s" }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}
                        >
                          <Icon name={active ? (dir === "up" ? "thumb_up_filled" : "thumb_down_filled") : (dir === "up" ? "thumb_up" : "thumb_down")} size={16} />
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
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
      <div style={{ background: bg, paddingBottom: 12, paddingTop: 8, flexShrink: 0 }}>
        <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ background: inputBg, border: `1.5px solid ${border}`, borderRadius: r.xl, boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Scoop anything"
              rows={1}
              ref={chatTextareaRef}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: textPrimary, fontFamily: "inherit", padding: "16px 18px 10px", maxHeight: 200, overflowY: "auto" }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 8px 14px" }}>
              {/* Active conversation: icon only */}
              <Tooltip label="Add file or photo" position="top">
                <button aria-label="Add file or photo" style={{ width: isMobile ? 48 : 34, height: isMobile ? 48 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                ><Icon name="add" size={20} /></button>
              </Tooltip>
              <div style={{ flex: 1 }} />
              <Tooltip label="Use microphone" position="top">
                <button aria-label="Use microphone" style={{ width: isMobile ? 48 : 34, height: isMobile ? 48 : 34, borderRadius: r.md, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                ><Icon name="mic" size={24} /></button>
              </Tooltip>
              <Tooltip label={thinking ? "Stop" : "Send"} position="top">
                <button
                  aria-label={thinking ? "Stop" : "Send"}
                  onClick={() => thinking ? handleStop() : handleSend()}
                  style={{ width: isMobile ? 42 : 34, height: isMobile ? 42 : 34, borderRadius: r.md, background: (thinking || input.trim()) ? "rgb(241,102,34)" : dark ? "#333" : "#e5e5e3", border: "none", cursor: (thinking || input.trim()) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: (thinking || input.trim()) ? "#fff" : textMuted, transition: "background 0.15s", marginLeft: 8 }}
                ><Icon name={thinking ? "stop" : "arrow_upward"} size={18} /></button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      </div>}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (pointer: fine) {
          .tt-wrap { display: inline-flex; }
          .tt-wrap::after {
            content: attr(data-tip);
            position: absolute;
            white-space: nowrap;
            font-size: 12px;
            font-weight: 500;
            line-height: 1;
            padding: 5px 8px;
            border-radius: 5px;
            background: rgba(30,30,30,0.88);
            color: #fff;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.12s;
            z-index: 9999;
          }
          .tt-wrap:hover::after { opacity: 1; }
          .tt-bottom::after { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
          .tt-top::after    { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
          .tt-right::after  { left: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
          .tt-left::after   { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
        }
        :focus-visible { outline: 2px solid rgb(241,102,34); outline-offset: 2px; border-radius: 4px; }
        .scoop-app button { font-weight: 500; }
        ${useInter ? ".scoop-app strong { font-weight: 700; letter-spacing: 0.002em; }" : ""}
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
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
