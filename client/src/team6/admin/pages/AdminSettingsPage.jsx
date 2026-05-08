import { useState } from "react";
import { FiLock, FiSave, FiUser } from "react-icons/fi";
import { updateMyPassword, updateMyProfile } from "../api";
import { useAdminAuth } from "../AdminAuthContext";

const AdminSettingsPage = () => {
  const { user, refreshProfile } = useAdminAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    picture: user?.picture || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setMessage("");
      await updateMyProfile(profileForm);
      await refreshProfile();
      setMessage("Профайл амжилттай шинэчлэгдлээ.");
    } catch (err) {
      setError(err?.message || "Профайл шинэчлэх үед алдаа гарлаа");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Нууц үгийн талбаруудыг бүрэн бөглөнө үү");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");
      await updateMyPassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Нууц үг амжилттай солигдлоо.");
    } catch (err) {
      setError(err?.message || "Нууц үг шинэчлэх үед алдаа гарлаа");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="t5a-page">
      <div className="t5a-page-title">
        <h2>Тохиргоо</h2>
        <p>Админ профайл болон нууц үгийн тохиргоо</p>
      </div>

      {message && <div className="t5a-success">{message}</div>}
      {error && <div className="t5a-error">{error}</div>}

      <div className="t5a-grid two">
        <article className="t5a-card">
          <div className="t5a-card-head">
            <h3>
              <FiUser /> Профайл
            </h3>
          </div>

          <form className="t5a-form" onSubmit={handleSaveProfile}>
            <label>
              <span>Нэр</span>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Овог</span>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Утас</span>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Зураг (URL)</span>
              <input
                type="text"
                value={profileForm.picture}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, picture: event.target.value }))
                }
              />
            </label>

            <button type="submit" className="t5a-btn t5a-btn-primary" disabled={savingProfile}>
              <FiSave /> {savingProfile ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </form>
        </article>

        <article className="t5a-card">
          <div className="t5a-card-head">
            <h3>
              <FiLock /> Нууц үг
            </h3>
          </div>

          <form className="t5a-form" onSubmit={handleSavePassword}>
            <label>
              <span>Одоогийн нууц үг</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Шинэ нууц үг</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
            </label>

            <button type="submit" className="t5a-btn" disabled={savingPassword}>
              <FiSave /> {savingPassword ? "Шинэчилж байна..." : "Нууц үг солих"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
};

export default AdminSettingsPage;
