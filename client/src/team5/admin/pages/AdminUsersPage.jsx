import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2, FiUserCheck, FiX } from "react-icons/fi";
import {
  createUser,
  deleteUser,
  fetchSchoolUsers,
  fetchSchools,
  fetchUsers,
  updateUser,
} from "../api";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
};

const AdminUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");

  const loadData = async (schoolId = "") => {
    setLoading(true);
    setError("");

    try {
      const schoolRows = await fetchSchools();
      const userRows = schoolId ? await fetchSchoolUsers(schoolId) : await fetchUsers();
      setSchools(schoolRows);
      setUsers(userRows);
    } catch (err) {
      setError(err?.message || "Хэрэглэгчийн мэдээлэл дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSchoolId);
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const haystack = [
        user.displayName,
        user.email,
        user.username,
        user.phone,
        user.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [userSearch, users]);

  const inferRole = (user) => {
    const value = String(
      user?.raw?.role_name || user?.raw?.["{}roles"] || user?.raw?.role || user?.raw?.type || "Оюутан"
    ).toLowerCase();

    if (value.includes("school") || value.includes("сургуул")) return "Сургуулийн админ";
    if (value.includes("admin") || value.includes("админ")) return "Админ";
    if (value.includes("teacher") || value.includes("багш")) return "Багш";
    return "Оюутан";
  };

  const handleSchoolChange = async (event) => {
    const value = event.target.value;
    setSelectedSchoolId(value);
    await loadData(value);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const closeModal = () => {
    setModalType("");
    setSelectedUser(null);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setModalType("form");
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalType("view");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.firstName) {
      setError("Имэйл болон нэрийг бөглөнө үү");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await createUser(form);
      }

      await loadData(selectedSchoolId);
      closeModal();
    } catch (err) {
      setError(err?.message || "Хэрэглэгч хадгалах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setSelectedUser(user);
    setModalType("form");
    setForm({
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      password: "",
    });
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType("delete");
  };

  const handleDelete = async () => {
    if (!selectedUser?.id) return;

    try {
      setSubmitting(true);
      await deleteUser(selectedUser.id);
      await loadData(selectedSchoolId);
      closeModal();
    } catch (err) {
      setError(err?.message || "Хэрэглэгч устгах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="t5a-loading">Хэрэглэгчийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5a-page">
      <div className="t5a-page-title">
        <div>
          <h2>Хэрэглэгчийн жагсаалт</h2>
          <p>Бүх хэрэглэгчийг удирдах</p>
        </div>
        <button
          type="button"
          className="t5a-btn t5a-btn-primary t5a-add-btn"
          onClick={openCreateModal}
        >
          <FiPlus /> Шинэ хэрэглэгч нэмэх
        </button>
      </div>

      {error && <div className="t5a-error">{error}</div>}

      <article className="t5a-card">
        <div className="t5a-toolbar-row">
          <span>Хэрэглэгчид ({filteredUsers.length})</span>
          <label className="t5a-filter-inline">
            <span>Хайлт:</span>
            <input
              type="text"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Имэйлээр хайх"
            />
          </label>
          <label className="t5a-filter-inline">
            <span>Сургууль:</span>
            <select value={selectedSchoolId} onChange={handleSchoolChange}>
              <option value="">Бүгд</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="t5a-table-wrap">
          <table className="t5a-table">
            <thead>
              <tr>
                <th>Зураг</th>
                <th>Нэр</th>
                <th>Имэйл</th>
                <th>Эрх</th>
                <th>Сургууль</th>
                <th>Төлөв</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="t5a-avatar-row">
                      <div className="t5a-table-avatar">{(user.displayName || "U").slice(0, 1)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="t5a-name-cell">
                      <strong>{user.displayName}</strong>
                      <span>{user.username || user.id}</span>
                    </div>
                  </td>
                  <td>{user.email || user.username || "-"}</td>
                  <td>
                    <span className="t5a-role-chip">{inferRole(user)}</span>
                  </td>
                  <td>{user.schools || "-"}</td>
                  <td>
                    <span className={`t5a-badge ${user.isActive ? "ok" : "warn"}`}>
                      <FiUserCheck /> {user.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </td>
                  <td className="t5a-actions">
                    <button type="button" title="Харах" onClick={() => openViewModal(user)}>
                      <FiEye />
                    </button>
                    <button type="button" onClick={() => handleEdit(user)}>
                      <FiEdit2 />
                    </button>
                    <button type="button" className="danger" onClick={() => openDeleteModal(user)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="t5a-empty-cell">
                    Хэрэглэгч олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {modalType === "view" && selectedUser && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>Хэрэглэгчийн мэдээлэл</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="t5a-modal-view">
              <div className="t5a-modal-view-item">
                <span>Нэр</span>
                <strong>{selectedUser.displayName || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Имэйл</span>
                <strong>{selectedUser.email || selectedUser.username || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Утас</span>
                <strong>{selectedUser.phone || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Эрх</span>
                <strong>{inferRole(selectedUser)}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Сургууль</span>
                <strong>{selectedUser.schools || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Төлөв</span>
                <strong>{selectedUser.isActive ? "Идэвхтэй" : "Идэвхгүй"}</strong>
              </div>
            </div>

            <div className="t5a-modal-actions">
              <button type="button" className="t5a-btn" onClick={closeModal}>
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "form" && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>{editingId ? "Хэрэглэгч засах" : "Шинэ хэрэглэгч"}</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form className="t5a-form" onSubmit={handleSubmit}>
              <div className="t5a-modal-grid">
                <input
                  type="email"
                  placeholder="Имэйл"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Нэр"
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Овог"
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Утас"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
                {!editingId && (
                  <input
                    type="password"
                    placeholder="Нууц үг"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                )}
              </div>

              <div className="t5a-modal-actions">
                <button type="submit" className="t5a-btn t5a-btn-primary" disabled={submitting}>
                  {editingId ? <FiEdit2 /> : <FiPlus />} {editingId ? "Шинэчлэх" : "Нэмэх"}
                </button>
                <button type="button" className="t5a-btn" onClick={closeModal}>
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "delete" && selectedUser && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal small" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>Хэрэглэгч устгах</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <p className="t5a-modal-text">
              <strong>{selectedUser.displayName || selectedUser.email}</strong> хэрэглэгчийг бүр мөсөн устгах уу?
            </p>

            <div className="t5a-modal-actions">
              <button type="button" className="t5a-btn danger" onClick={handleDelete} disabled={submitting}>
                <FiTrash2 /> {submitting ? "Устгаж байна..." : "Устгах"}
              </button>
              <button type="button" className="t5a-btn" onClick={closeModal}>
                Болих
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsersPage;
