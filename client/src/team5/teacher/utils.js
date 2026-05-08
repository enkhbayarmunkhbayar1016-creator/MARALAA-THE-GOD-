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

export const fullName = (raw = {}) => {
  const last = raw.last_name || raw.family_name || "";
  const first = raw.first_name || raw.firstName || "";
  const combined = [last, first].filter(Boolean).join(" ").trim();
  return combined || raw.name || raw.email || "Нэргүй";
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

export const dateTimeToIso = (date, time) => {
  if (!date) return "";
  const merged = `${date}T${time || "00:00"}:00`;
  const parsed = new Date(merged);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
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
  }).format(date);
};

export const getExamStatus = (exam) => {
  const now = Date.now();
  const openOn = exam?.openOn ? new Date(exam.openOn).getTime() : null;
  const closeOn = exam?.closeOn ? new Date(exam.closeOn).getTime() : null;

  if (openOn && now < openOn) return "draft";
  if (closeOn && now > closeOn) return "completed";
  return "active";
};

export const scorePercent = (grade, total) => {
  const gradePoint = toNumber(grade, 0);
  const max = toNumber(total, 0);
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (gradePoint / max) * 100));
};

export const average = (numbers = []) => {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, cur) => acc + toNumber(cur, 0), 0);
  return sum / numbers.length;
};

export const labelFromStatus = (status) => {
  if (status === "active") return "Идэвхтэй";
  if (status === "completed") return "Дууссан";
  return "Ноорог";
};
