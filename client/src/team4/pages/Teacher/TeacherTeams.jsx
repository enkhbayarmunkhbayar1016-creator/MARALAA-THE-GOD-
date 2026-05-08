import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2,
  FiSave, FiX, FiCalendar,
} from "react-icons/fi";
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Input, Label, useToast,
} from "../../components/ui";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { apiGet, apiPost, apiPut, apiDelete, withCurrentUser, parseField } from "../../utils/api";
import { useAuth } from "../../utils/AuthContext";

// Гарагууд (API weekday: 1=Даваа … 7=Ням)
const WEEKDAYS = [
  { id: 1, label: "Даваа" },
  { id: 2, label: "Мягмар" },
  { id: 3, label: "Лхагва" },
  { id: 4, label: "Пүрэв" },
  { id: 5, label: "Баасан" },
  { id: 6, label: "Бямба" },
  { id: 7, label: "Ням" },
];

const WEEKDAY_COLORS = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-purple-100 text-purple-700",
  3: "bg-teal-100 text-teal-700",
  4: "bg-amber-100 text-amber-700",
  5: "bg-green-100 text-green-700",
  6: "bg-rose-100 text-rose-700",
  7: "bg-teal-50 text-teal-600",
};

const EMPTY_FORM = {
  weekday:      "1",
  period_id:    "",
  lesson_type_id: "",
};

export default function TimetableManagePage() {
  const { course_id } = useParams();
  const { school }    = useAuth();
  const toast         = useToast();

  const [timetables, setTimetables]   = useState([]);
  const [periods, setPeriods]         = useState([]);
  const [lessonTypes, setLessonTypes] = useState([]);
  const [courseName, setCourseName]   = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  // Form state
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);  // null = create mode
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // Delete confirm
  const [confirmItem, setConfirmItem] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // ── Data loading ──────────────────────────────────────────
  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [courseRes, ttRes, periodsRes] = await Promise.all([
        apiGet(`/courses/${course_id}`).catch(() => ({})),
        apiGet(`/courses/${course_id}/timetables`).catch(() => ({ items: [] })),
        school?.id
          ? apiGet(`/schools/${school.id}/periods`).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
      ]);

      setCourseName(courseRes?.name ?? `Хичээл #${course_id}`);
      setTimetables(ttRes?.items ?? []);

      const sortedPeriods = (periodsRes?.items ?? [])
        .slice()
        .sort((a, b) => Number(a.no ?? a.priority ?? a.id) - Number(b.no ?? b.priority ?? b.id));
      setPeriods(sortedPeriods);

      // Хичээлийн төрлүүд
      try {
        const ltRes = await apiGet("/lesson-types");

        if (!ltRes?.items?.length) {
            throw new Error("Хичээлийн төрөл олдсонгүй");
        }
        setLessonTypes(ltRes?.items ?? []);
      } catch (err) {
        const msg = err.message || "Хичээлийн төрлүүдийг ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
        }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [course_id, school?.id]);

  // ── Form helpers ──────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      period_id:      periods[0]?.id ? String(periods[0].id) : "",
      lesson_type_id: lessonTypes[0]?.id ? String(lessonTypes[0].id) : "",
    });
    setFormOpen(true);
  }

  function openEdit(tt) {
    setEditing(tt);
    const period      = parseField(tt, "period") ?? tt.period ?? null;
    const lessonType  = parseField(tt, "lesson_type") ?? tt.lesson_type ?? null;
    setForm({
      weekday:        String(tt.weekday ?? 1),
      period_id:      String(period?.id ?? tt.period_id ?? ""),
      lesson_type_id: String(lessonType?.id ?? tt.lesson_type_id ?? ""),
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Save (create / update) ────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();

    if (!form.weekday) {
      toast.warning("Гараг сонгоно уу.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        weekday:        Number(form.weekday),
        period_id:      form.period_id      ? Number(form.period_id)      : undefined,
        lesson_type_id: form.lesson_type_id ? Number(form.lesson_type_id) : undefined,
        course_id:      Number(course_id),
      };

      if (editing) {
        await apiPut(`/timetables/${editing.id}`, payload);
        toast.success("Цаг хуваарь амжилттай засагдлаа.");
      } else {
        await apiPost(`/courses/${course_id}/timetables`, withCurrentUser(payload));
        toast.success("Цаг хуваарь амжилттай нэмэгдлээ.");
      }
      closeForm();
      loadAll();
    } catch (err) {
      toast.error(err.message || "Хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmItem) return;
    setDeleting(true);
    try {
      await apiDelete(`/timetables/${confirmItem.id}`, withCurrentUser());
      toast.success("Цаг хуваарь устгагдлаа.");
      setConfirmItem(null);
      loadAll();
    } catch (err) {
      toast.error(err.message || "Устгахад алдаа гарлаа.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  function getWeekdayLabel(id) {
    return WEEKDAYS.find((w) => w.id === Number(id))?.label ?? `Гараг #${id}`;
  }

  function getPeriodLabel(tt) {
    const period = parseField(tt, "period") ?? tt.period ?? null;
    const no     = period?.no ?? tt.period_no ?? null;
    const start  = period?.start_time ?? null;
    const end    = period?.end_time   ?? null;
    if (no)    return `${no}-р пар${start ? ` (${start}–${end ?? ""})` : ""}`;
    if (start) return `${start}–${end ?? ""}`;
    return "Пар тодорхойгүй";
  }

  function getLessonTypeLabel(tt) {
    const lt = parseField(tt, "lesson_type") ?? tt.lesson_type ?? null;
    return lt?.name ?? "—";
  }

  // Group timetable by weekday for display
  const grouped = WEEKDAYS.map((day) => ({
    ...day,
    items: timetables.filter((tt) => Number(tt.weekday) === day.id),
  })).filter((day) => day.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-teal-300">
        <Link
          to={`/team4/courses/${course_id}/users`}
          className="flex items-center gap-1 hover:font-semibold"
        >
          <FiArrowLeft className="h-3.5 w-3.5" /> Буцах
        </Link>
        <span>/</span>
        <span className="font-semibold" style={{ color: "#042f2e" }}>Цаг хуваарь</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <FiCalendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Цаг хуваарь</h1>
            <p className="text-sm" style={{ color: "#99f6e4" }}>{courseName}</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <FiPlus className="h-4 w-4" /> Цаг нэмэх
        </Button>
      </div>

      {/* Inline form */}
      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Цаг хуваарь засах" : "Шинэ цаг хуваарь нэмэх"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Гараг */}
              <div className="space-y-1.5">
                <Label>Гараг <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setField("weekday", String(day.id))}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all
                        ${form.weekday === String(day.id)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-teal-100 text-teal-600 hover:border-zinc-400"}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Пар */}
                <div className="space-y-1.5">
                  <Label>Пар (хичээлийн цаг)</Label>
                  <select
                    value={form.period_id}
                    onChange={(e) => setField("period_id", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-teal-100 bg-white px-3 py-2
                      text-sm text-teal-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="">Пар сонгохгүй</option>
                    {periods.map((p) => {
                      const no    = p.no ?? p.priority ?? p.id;
                      const start = p.start_time ?? "";
                      const end   = p.end_time   ?? "";
                      return (
                        <option key={p.id} value={p.id}>
                          {no}-р пар{start ? ` · ${start}–${end}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Хичээлийн төрөл */}
                <div className="space-y-1.5">
                  <Label>Хичээлийн төрөл</Label>
                  <select
                    value={form.lesson_type_id}
                    onChange={(e) => setField("lesson_type_id", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-teal-100 bg-white px-3 py-2
                      text-sm text-teal-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="">Төрөл сонгохгүй</option>
                    {lessonTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" loading={saving}>
                  <FiSave className="h-4 w-4" /> Хадгалах
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  <FiX className="h-4 w-4" /> Цуцлах
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timetable list */}
      <Card>
        <CardHeader>
          <CardTitle>Хуваарийн жагсаалт</CardTitle>
          <CardDescription>Нийт {timetables.length} цаг хуваарь</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-teal-50" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          ) : timetables.length === 0 ? (
            <div className="rounded-xl border border-dashed border-teal-100 py-12 text-center text-sm text-teal-400">
              Цаг хуваарь байхгүй байна.{" "}
              <button
                type="button"
                onClick={openCreate}
                className="text-indigo-600 hover:underline"
              >
                Нэмэх
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((day) => (
                <div key={day.id}>
                  {/* Гарагийн гарчиг */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${WEEKDAY_COLORS[day.id]}`}>
                      {day.label}
                    </span>
                    <div className="flex-1 border-t border-teal-100" />
                  </div>

                  {/* Тухайн гарагийн цагууд */}
                  <div className="space-y-2 pl-2">
                    {day.items.map((tt) => (
                      <div
                        key={tt.id}
                        className="flex items-center justify-between gap-4 rounded-xl border
                          border-teal-100 bg-teal-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Пар */}
                          <div className="text-center min-w-[48px]">
                            <p className="text-lg font-bold text-teal-800 leading-none">
                              {(() => {
                                const p = parseField(tt, "period") ?? tt.period ?? null;
                                return p?.no ?? tt.period_no ?? "—";
                              })()}
                            </p>
                            <p className="text-[10px] text-teal-400">пар</p>
                          </div>
                          <div className="w-px h-8 bg-teal-100" />
                          {/* Цаг ба төрөл */}
                          <div>
                            <p className="text-sm font-medium " style={{ color: "#134e4a" }}>
                              {getPeriodLabel(tt)}
                            </p>
                            <p className="text-xs" style={{ color: "#99f6e4" }}>
                              {getLessonTypeLabel(tt)}
                            </p>
                          </div>
                        </div>

                        {/* Үйлдэл */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(tt)}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setConfirmItem(tt)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmItem}
        title="Цаг хуваарь устгах уу?"
        description={
          confirmItem
            ? `${getWeekdayLabel(confirmItem.weekday)} · ${getPeriodLabel(confirmItem)} цагийг устгахдаа итгэлтэй байна уу?`
            : ""
        }
        confirmText="Устгах"
        cancelText="Цуцлах"
        loading={deleting}
        onCancel={() => setConfirmItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}