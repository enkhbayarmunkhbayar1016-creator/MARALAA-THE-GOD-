export function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  return `${fmt(dateStr)} ${fmtTime(dateStr)}`;
}

export function courseStatus(startOn, endOn) {
  const now = Date.now();
  const start = startOn ? new Date(startOn).getTime() : null;
  const end = endOn ? new Date(endOn).getTime() : null;
  if (end && now > end) return { label: "Дууссан", color: "bg-teal-50 text-teal-600" };
  if (start && now < start) return { label: "Эхлээгүй", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Явагдаж байна", color: "bg-green-100 text-green-700" };
}

export function avatarSrc(picture) {
  if (!picture || picture === "no-image.jpg") return null;
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  if (picture.startsWith("data:image/")) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

export function isDateInRange(startOn, endOn, nowTs = Date.now()) {
  const start = startOn ? new Date(startOn).getTime() : null;
  const end = endOn ? new Date(endOn).getTime() : null;
  if (start && nowTs < start) return false;
  if (end && nowTs > end) return false;
  return true;
}
