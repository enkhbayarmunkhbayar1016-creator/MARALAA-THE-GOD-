export function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("mn-MN") : "—";
}
export function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
