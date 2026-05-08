import { useEffect, useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { updateMyPassword, updateMyProfile } from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";

const tabs = [
  { key: "profile", label: "Профайл" },
  { key: "password", label: "Нууцлал" },
  { key: "notifications", label: "Мэдэгдэл" },
  { key: "system", label: "Тохиргоо" },
];

const TeacherSettingsPage = () => {
  const { user, refreshProfile } = useTeacherAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    picture: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationForm, setNotificationForm] = useState({
    email: true,
    push: true,
    examStart: true,
    examEnd: true,
  });

  const [systemForm, setSystemForm] = useState({
    language: "Монгол",
    timezone: "Улаанбаатар (GMT+8)",
    autoPublish: true,
    passPercentage: 60,
  });

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      picture: user.picture || "",
    });
  }, [user]);

  const resetFeedback = () => {
    setError("");
    setSuccess("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    resetFeedback();

    try {
      await updateMyProfile(profileForm);
      await refreshProfile();
      setSuccess("Профайлын мэдээлэл хадгалагдлаа.");
    } catch (err) {
      setError(err?.message || "Профайл хадгалах үед алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Шинэ нууц үг таарахгүй байна.");
      return;
    }

    setSaving(true);
    try {
      await updateMyPassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Нууц үг амжилттай солигдлоо.");
    } catch (err) {
      setError(err?.message || "Нууц үг солих үед алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  const saveLocalSettings = (event) => {
    event.preventDefault();
    localStorage.setItem("team5_teacher_notifications", JSON.stringify(notificationForm));
    localStorage.setItem("team5_teacher_system_settings", JSON.stringify(systemForm));
    setSuccess("Тохиргоо хадгалагдлаа.");
    setError("");
  };

  const activeContent = useMemo(() => {
    if (activeTab === "profile") {
      return (
        <form className="team5-form-card" onSubmit={saveProfile}>
          <h3>Профайлын мэдээлэл</h3>
          <div className="team5-form-grid two">
            <label>
              Овог
              <input
                value={profileForm.lastName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
              />
            </label>
            <label>
              Нэр
              <input
                value={profileForm.firstName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
              />
            </label>
            <label>
              Утас
              <input
                value={profileForm.phone}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>
            <label>
              Зураг (URL)
              <input
                value={profileForm.picture}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, picture: event.target.value }))}
              />
            </label>
          </div>

          <button type="submit" className="team5-primary-btn" disabled={saving}>
            <FiSave /> {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>
      );
    }

    if (activeTab === "password") {
      return (
        <form className="team5-form-card" onSubmit={savePassword}>
          <h3>Нууц үг солих</h3>
          <label>
            Одоогийн нууц үг
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Шинэ нууц үг
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
            />
          </label>
          <label>
            Шинэ нууц үг баталгаажуулах
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              required
            />
          </label>

          <button type="submit" className="team5-primary-btn" disabled={saving}>
            <FiSave /> {saving ? "Хадгалж байна..." : "Нууц үг солих"}
          </button>
        </form>
      );
    }

    if (activeTab === "notifications") {
      return (
        <form className="team5-form-card" onSubmit={saveLocalSettings}>
          <h3>Мэдэгдлийн тохиргоо</h3>
          <label className="team5-switch-row">
            Имэйл мэдэгдэл
            <input
              type="checkbox"
              checked={notificationForm.email}
              onChange={(event) =>
                setNotificationForm((prev) => ({ ...prev, email: event.target.checked }))
              }
            />
          </label>
          <label className="team5-switch-row">
            Push мэдэгдэл
            <input
              type="checkbox"
              checked={notificationForm.push}
              onChange={(event) => setNotificationForm((prev) => ({ ...prev, push: event.target.checked }))}
            />
          </label>
          <label className="team5-switch-row">
            Оюутны шалгалт эхлэхэд
            <input
              type="checkbox"
              checked={notificationForm.examStart}
              onChange={(event) =>
                setNotificationForm((prev) => ({ ...prev, examStart: event.target.checked }))
              }
            />
          </label>
          <label className="team5-switch-row">
            Шалгалт дуусахад
            <input
              type="checkbox"
              checked={notificationForm.examEnd}
              onChange={(event) =>
                setNotificationForm((prev) => ({ ...prev, examEnd: event.target.checked }))
              }
            />
          </label>

          <button type="submit" className="team5-primary-btn">
            <FiSave /> Хадгалах
          </button>
        </form>
      );
    }

    return (
      <form className="team5-form-card" onSubmit={saveLocalSettings}>
        <h3>Системийн тохиргоо</h3>
        <label>
          Хэл
          <select
            value={systemForm.language}
            onChange={(event) => setSystemForm((prev) => ({ ...prev, language: event.target.value }))}
          >
            <option>Монгол</option>
            <option>English</option>
          </select>
        </label>
        <label>
          Цагийн бүс
          <input
            value={systemForm.timezone}
            onChange={(event) => setSystemForm((prev) => ({ ...prev, timezone: event.target.value }))}
          />
        </label>
        <label className="team5-switch-row">
          Автомат дүн гаргах
          <input
            type="checkbox"
            checked={systemForm.autoPublish}
            onChange={(event) => setSystemForm((prev) => ({ ...prev, autoPublish: event.target.checked }))}
          />
        </label>
        <label>
          Тэнцэх үнэлгээ (%)
          <input
            type="number"
            min="1"
            max="100"
            value={systemForm.passPercentage}
            onChange={(event) =>
              setSystemForm((prev) => ({ ...prev, passPercentage: Number(event.target.value) || 60 }))
            }
          />
        </label>

        <button type="submit" className="team5-primary-btn">
          <FiSave /> Хадгалах
        </button>
      </form>
    );
  }, [
    activeTab,
    notificationForm,
    passwordForm,
    profileForm,
    saving,
    systemForm,
    saveProfile,
    savePassword,
  ]);

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Тохиргоо</h2>
          <p>Таны профайл болон системийн тохиргоо</p>
        </div>
      </header>

      <div className="team5-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`team5-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.key);
              setError("");
              setSuccess("");
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="team5-error-box">{error}</p> : null}
      {success ? <p className="team5-success-box">{success}</p> : null}

      {activeContent}
    </section>
  );
};

export default TeacherSettingsPage;
