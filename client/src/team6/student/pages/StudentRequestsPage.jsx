import { useEffect, useMemo, useState } from "react";
import { FiSend } from "react-icons/fi";
import { createSchoolRequest, fetchSchoolRequests } from "../api";
import { formatDateTime } from "../utils";

const initialForm = {
  type: "Ерөнхий хүсэлт",
  title: "",
  description: "",
};

const detectStatus = (row) => {
  const bucket = `${row.statusName} ${row.statusId}`.toLowerCase();
  if (bucket.includes("татгал") || bucket.includes("reject")) return "rejected";
  if (bucket.includes("зөвш") || bucket.includes("approved") || bucket.includes("2")) return "approved";
  return "pending";
};

const StudentRequestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rows, setRows] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const list = await fetchSchoolRequests();
      setRows(list);
    } catch (err) {
      setError(err?.message || "Хүсэлтийн мэдээлэл дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const statuses = rows.map((row) => detectStatus(row));

    return {
      total: rows.length,
      pending: statuses.filter((item) => item === "pending").length,
      approved: statuses.filter((item) => item === "approved").length,
      rejected: statuses.filter((item) => item === "rejected").length,
    };
  }, [rows]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Гарчиг оруулна уу.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createSchoolRequest({
        name: `${form.type} - ${form.title}`,
      });

      setSuccess("Хүсэлт амжилттай илгээгдлээ.");
      setForm(initialForm);
      setActiveTab("history");
      await loadData();
    } catch (err) {
      setError(err?.message || "Хүсэлт илгээхэд алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="t5s-loading">Хүсэлтийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Хүсэлт</h2>
          <p>Танай хүсэлт, асуулгуудыг илгээх</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}
      {success && <div className="t5s-success">{success}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>Нийт хүсэлт</h4>
          <strong>{stats.total}</strong>
        </article>
        <article className="t5s-stat blue">
          <h4>Хүлээгдэж буй</h4>
          <strong>{stats.pending}</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Зөвшөөрсөн</h4>
          <strong>{stats.approved}</strong>
        </article>
        <article className="t5s-stat red">
          <h4>Татгалзсан</h4>
          <strong>{stats.rejected}</strong>
        </article>
      </div>

      <div className="t5s-tab-switch">
        <button
          type="button"
          className={activeTab === "create" ? "active" : ""}
          onClick={() => setActiveTab("create")}
        >
          Шинэ хүсэлт илгээх
        </button>
        <button
          type="button"
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Миний хүсэлтүүд
        </button>
      </div>

      {activeTab === "create" ? (
        <article className="t5s-card">
          <form className="t5s-form" onSubmit={handleSubmit}>
            <h3>Шинэ хүсэлт илгээх</h3>

            <label>
              Хүсэлтийн төрөл
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option>Ерөнхий хүсэлт</option>
                <option>Чөлөө хүсэх</option>
                <option>Даалгавар сунгах</option>
                <option>Лавлагаа авах</option>
              </select>
            </label>

            <label>
              Гарчиг
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Товч гарчиг бичнэ үү"
              />
            </label>

            <label>
              Дэлгэрэнгүй тайлбар
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Тайлбараа бичнэ үү"
              />
            </label>

            <div className="t5s-row-actions">
              <button type="submit" className="t5s-btn t5s-btn-primary" disabled={submitting}>
                <FiSend />
                {submitting ? "Илгээж байна..." : "Хүсэлт илгээх"}
              </button>
              <button
                type="button"
                className="t5s-btn t5s-btn-outline"
                onClick={() => setForm(initialForm)}
              >
                Цэвэрлэх
              </button>
            </div>
          </form>
        </article>
      ) : (
        <article className="t5s-card">
          <div className="t5s-list-stack">
            {rows.map((row) => {
              const status = detectStatus(row);

              return (
                <div key={row.id} className={`t5s-request-row ${status}`}>
                  <div>
                    <strong>{row.name || "Хүсэлт"}</strong>
                    <p>Огноо: {formatDateTime(row.createdOn)}</p>
                    {row.rejectionReason && <small>Тайлбар: {row.rejectionReason}</small>}
                  </div>
                  <span className={`t5s-status ${status}`}>{row.statusName || status}</span>
                </div>
              );
            })}

            {rows.length === 0 && <div className="t5s-empty">Хүсэлтийн түүх хоосон байна.</div>}
          </div>
        </article>
      )}
    </section>
  );
};

export default StudentRequestsPage;
