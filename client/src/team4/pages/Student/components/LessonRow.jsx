import { useState } from "react";
import { FiSend } from "react-icons/fi";
import {
  getLessonSubmissions,
  submitLessonAssignment,
  updateLessonSubmission,
} from "../api/studentCourseApi";
import { useToast } from "../../../components/ui/Toast";
import { fmt } from "../utils";

function decodeHtml(value) {
  if (!value) return "";
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractContentLinks(content) {
  if (!content || typeof content !== "string") return [];
  const links = [];
  const seen = new Set();
  const source = decodeHtml(content);
  const iframeRegex = /<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  for (const match of source.matchAll(iframeRegex)) {
    const url = match[1];
    if (url && !seen.has(url)) { seen.add(url); links.push(url); }
  }
  for (const match of source.matchAll(urlRegex)) {
    const url = match[0];
    if (url && !seen.has(url)) { seen.add(url); links.push(url); }
  }
  return links;
}

const isEmbeddable = (url) => /youtube\.com|youtu\.be|sharepoint\.com|office\.com/i.test(url);

export default function LessonRow({ lesson, userId }) {
  const toast = useToast();
  const [submissions, setSubmissions] = useState(null);
  const [showBox, setShowBox] = useState(false);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const typeName = lesson?.type?.name || "Тодорхойгүй төрөл";
  const links = extractContentLinks(lesson.content);
  const hasSubmission = Number(lesson.has_submission) === 1;

  async function loadSubmissions() {
    try {
      const res = await getLessonSubmissions(lesson.id);
      const items = res?.items ?? [];
      setSubmissions(items);
      const mine = items.find((s) => s.user_id === userId);
      if (mine) setContent(mine.content || "");
    } catch (err) {
      toast.error(err.message || "Даалгаврын мэдээлэл ачааллахад алдаа гарлаа.");
    }
  }

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error("Агуулгаа бөглөнө үү.");
      return;
    }
    setBusy(true);
    try {
      const mine = submissions?.find((s) => s.user_id === userId);
      if (mine) {
        await updateLessonSubmission(mine.id, lesson.id, userId, content);
        toast.success("Даалгаврыг шинэчиллээ.");
      } else {
        await submitLessonAssignment(lesson.id, userId, content);
        toast.success("Даалгаврыг илгээлээ.");
      }
      await loadSubmissions();
      setShowBox(false);
    } catch (err) {
      toast.error(err.message || "Илгээхэд алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium " style={{ color: "#134e4a" }}>{lesson.name}</p>
          <p className="mt-0.5 text-xs text-teal-300">
            {typeName}
            {lesson.point ? ` • ${lesson.point} оноо` : ""}
            {hasSubmission ? " • Даалгавар" : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-teal-600 border border-teal-100">
          #{lesson.priority ?? "-"}
        </span>
      </div>

      <div className="mt-2 grid gap-1 text-xs text-teal-300 sm:grid-cols-3">
        <span>{`Нээх: ${fmt(lesson.open_on)}`}</span>
        <span>{`Хаах: ${fmt(lesson.close_on)}`}</span>
        <span>{`Дуусах: ${fmt(lesson.end_on)}`}</span>
      </div>

      {(lesson.content || links.length > 0) && (
        <div className="mt-2 text-xs">
          {links.length > 0 ? (
            <div className="space-y-2">
              {links.map((url) => (
                <div key={url} className="space-y-1">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                  >
                    {url}
                  </a>
                  {isEmbeddable(url) && (
                    <iframe
                      src={url}
                      title={`${lesson.name}-${url}`}
                      className="h-52 w-full rounded-md border border-teal-100 bg-white"
                      loading="lazy"
                      allowFullScreen
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-teal-600 break-words">{String(lesson.content)}</p>
          )}
        </div>
      )}

      {hasSubmission && userId && (
        <div className="mt-3 space-y-2 border-t border-teal-100 pt-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (submissions === null) loadSubmissions();
                setShowBox((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-teal-100 bg-white px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
            >
              <FiSend className="h-3 w-3" />
              {showBox ? "Хаах" : "Даалгавар илгээх"}
            </button>
            {submissions && (
              <span className="text-xs text-teal-300">{submissions.length} илгээлт</span>
            )}
          </div>
          {showBox && (
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Илгээх агуулга..."
                className="w-full rounded-md border border-teal-100 bg-white p-2 text-sm focus:border-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {busy ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
