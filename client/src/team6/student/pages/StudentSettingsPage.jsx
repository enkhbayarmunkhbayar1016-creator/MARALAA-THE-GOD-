import { useEffect, useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { updateMyPassword, updateMyProfile } from "../api";
import { useStudentAuth } from "../StudentAuthContext";

const PREF_KEY = "team5_student_preferences";

const initialPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const StudentSettingsPage = () => {
  const { user, refreshProfile } = useStudentAuth();

  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    picture: "",
  });

  const [password, setPassword] = useState(initialPassword);
  const [prefs, setPrefs] = useState({
    emailNotification: true,
    examReminder: true,
    compactMode: false,
  });

  useEffect(() => {
    if (!user) return;

    setProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      picture: user.picture || "",
    });
  }, [user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      setPrefs((prev) => ({ ...prev, ...data }));
    } catch {
      // ignore parse error
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const fullName = useMemo(() => {
    return [profile.lastName, profile.firstName].filter(Boolean).join(" ").trim() || "Оюутан";
  }, [profile.firstName, profile.lastName]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateMyProfile(profile);
      await refreshProfile();
      setSuccess("Профайл амжилттай хадгалагдлаа.");
    } catch (err) {
      setError(err?.message || "Профайл хадгалах үед алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!password.currentPassword || !password.newPassword) {
      setSaving(false);
      setError("Нууц үгийн талбаруудыг бүрэн бөглөнө үү.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setSaving(false);
      setError("Шинэ нууц үг давхцахгүй байна.");
      return;
    }

    try {
      await updateMyPassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });

      setSuccess("Нууц үг амжилттай шинэчлэгдлээ.");
      setPassword(initialPassword);
    } catch (err) {
      setError(err?.message || "Нууц үг солих үед алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="t5s-page t5s-page-narrow">
      <div className="t5s-page-head">
        <div>
          <h2>Тохиргоо</h2>
          <p>Ерөнхий мэдээлэл, тохиргоогоо засах</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}
      {success && <div className="t5s-success">{success}</div>}

      <div className="t5s-tab-switch">
        <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
          Профайл
        </button>
        <button type="button" className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
          Нууцлал
        </button>
        <button type="button" className={tab === "preferences" ? "active" : ""} onClick={() => setTab("preferences")}>
          Мэдэгдэл
        </button>
      </div>

      {tab === "profile" && (
        <article className="t5s-card">
          <form className="t5s-form" onSubmit={saveProfile}>
            <h3>Хувийн мэдээлэл</h3>

            <div className="t5s-inline-tags">
              <div className="t5s-avatar">{fullName.slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{fullName}</strong>
                <p>{user?.username || user?.email}</p>
              </div>
            </div>

            <div className="t5s-form-grid">
              <label>
                Овог
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
              </label>

              <label>
                Нэр
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
              </label>

              <label>
                Имэйл
                <input type="text" value={user?.email || ""} disabled />
              </label>

              <label>
                Утасны дугаар
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </label>

              <label className="full">
                Зураг (URL)
                <input
                  type="text"
                  value={profile.picture}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, picture: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="t5s-row-actions">
              <button type="submit" className="t5s-btn t5s-btn-primary" disabled={saving}>
                <FiSave /> {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </form>
        </article>
      )}

      {tab === "password" && (
        <article className="t5s-card">
          <form className="t5s-form" onSubmit={savePassword}>
            <h3>Нууц үг солих</h3>

            <label>
              Одоогийн нууц үг
              <input
                type="password"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
              />
            </label>

            <label>
              Шинэ нууц үг
              <input
                type="password"
                value={password.newPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
            </label>

            <label>
              Шинэ нууц үг (давтах)
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
            </label>

            <div className="t5s-row-actions">
              <button type="submit" className="t5s-btn t5s-btn-primary" disabled={saving}>
                <FiSave /> {saving ? "Хадгалж байна..." : "Нууц үг шинэчлэх"}
              </button>
            </div>
          </form>
        </article>
      )}

      {tab === "preferences" && (
        <article className="t5s-card">
          <div className="t5s-form">
            <h3>Мэдэгдэл ба харагдац</h3>

            <label className="t5s-toggle">
              <input
                type="checkbox"
                checked={prefs.emailNotification}
                onChange={(event) =>
                  setPrefs((prev) => ({ ...prev, emailNotification: event.target.checked }))
                }
              />
              <span>Имэйл мэдэгдэл авах</span>
            </label>

            <label className="t5s-toggle">
              <input
                type="checkbox"
                checked={prefs.examReminder}
                onChange={(event) =>
                  setPrefs((prev) => ({ ...prev, examReminder: event.target.checked }))
                }
              />
              <span>Шалгалтын сануулга идэвхжүүлэх</span>
            </label>

            <label className="t5s-toggle">
              <input
                type="checkbox"
                checked={prefs.compactMode}
                onChange={(event) =>
                  setPrefs((prev) => ({ ...prev, compactMode: event.target.checked }))
                }
              />
              <span>Компакт харагдац</span>
            </label>
          </div>
        </article>
      )}
    </section>
  );
};

export default StudentSettingsPage;
