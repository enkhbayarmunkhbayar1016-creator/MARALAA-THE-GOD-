export const toItems = (payload) => {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const toId = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const parseJsonField = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;

  const text = String(value).trim();
  if (!text) return fallback;

  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

export const fullName = (raw = {}) => {
  const last = raw.last_name || raw.family_name || "";
  const first = raw.first_name || raw.firstName || "";
  const name = [last, first].filter(Boolean).join(" ").trim();
  return name || raw.username || raw.email || "Оюутан";
};

export const initials = (value = "") => {
  const words = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.map((w) => w[0]?.toUpperCase() || "").join("") || "ST";
};

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const scorePercent = (score, total) => {
  const numerator = toNumber(score, 0);
  const denominator = toNumber(total, 0);
  if (denominator <= 0) return 0;
  const percent = (numerator / denominator) * 100;
  return Math.max(0, Math.min(100, percent));
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const normalizeAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.map((item) => String(item).trim().toLowerCase()).join("|");
  }

  if (answer && typeof answer === "object") {
    return JSON.stringify(answer);
  }

  return String(answer ?? "")
    .trim()
    .toLowerCase();
};

export const minutesToClock = (totalSeconds) => {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const getExamStatus = (exam = {}) => {
  const now = Date.now();
  const openOn = exam.openOn ? new Date(exam.openOn).getTime() : 0;
  const closeOn = exam.closeOn ? new Date(exam.closeOn).getTime() : 0;

  if (closeOn && now > closeOn) return "closed";
  if (openOn && now < openOn) return "upcoming";
  return "open";
};

export const toAnswerPayload = (answer) => {
  if (Array.isArray(answer) || (answer && typeof answer === "object")) {
    return JSON.stringify(answer);
  }

  return String(answer ?? "");
};
