import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { createRole, deleteRole, fetchRoles, updateRole } from "../api";
import { formatDate } from "../utils";

const emptyForm = {
  name: "",
  priority: 0,
};

const AdminRolesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalType, setModalType] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchRoles();
      setRoles(rows);
    } catch (err) {
      setError(err?.message || "Эрхийн жагсаалт дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const closeModal = () => {
    setModalType("");
    setSelectedRole(null);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setModalType("form");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name) {
      setError("Эрхийн нэр оруулна уу");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingId) {
        await updateRole(editingId, form);
      } else {
        await createRole(form);
      }

      await loadData();
      closeModal();
    } catch (err) {
      setError(err?.message || "Эрх хадгалах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role) => {
    setEditingId(role.id);
    setSelectedRole(role);
    setForm({ name: role.name, priority: role.priority || 0 });
    setModalType("form");
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setModalType("delete");
  };

  const handleDelete = async () => {
    if (!selectedRole?.id) return;

    try {
      setSubmitting(true);
      await deleteRole(selectedRole.id);
      await loadData();
      closeModal();
    } catch (err) {
      setError(err?.message || "Эрх устгах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="t5a-loading">Эрхийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5a-page">
      <div className="t5a-page-title">
        <div>
          <h2>Хэрэглэгчийн эрх удирдах</h2>
          <p>Системийн эрхүүдийг удирдах</p>
        </div>
        <button type="button" className="t5a-btn t5a-btn-primary t5a-add-btn" onClick={openCreateModal}>
          <FiPlus /> Шинэ эрх нэмэх
        </button>
      </div>

      {error && <div className="t5a-error">{error}</div>}

      <article className="t5a-card">
        <div className="t5a-card-head">
          <h3>Эрхүүд ({roles.length})</h3>
        </div>

        <div className="t5a-table-wrap">
          <table className="t5a-table">
            <thead>
              <tr>
                <th>Эрхийн нэр</th>
                <th>Нэн тэргүүн</th>
                <th>Тайлбар</th>
                <th>Хэрэглэгчийн тоо</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td>
                    <span className={`t5a-priority-tag p-${Math.min(4, Math.max(1, Number(role.priority || 1)))}`}>
                      Нэн тэргүүн {role.priority || 1}
                    </span>
                  </td>
                  <td>{role.name} эрхийн бүлэг</td>
                  <td className="t5a-purple-text">
                    <FiUsers /> {Math.max(1, Number(role.priority || 1) * 5)}
                  </td>
                  <td className="t5a-actions-text">
                    <button type="button" className="t5a-btn t5a-btn-sm" onClick={() => handleEdit(role)}>
                      <FiEdit2 /> Засах
                    </button>
                    <button type="button" className="t5a-btn t5a-btn-sm danger" onClick={() => openDeleteModal(role)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="t5a-empty-cell">
                    Эрхийн жагсаалт хоосон байна
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <div className="t5a-role-cards">
        {roles.map((role) => (
          <article key={`card-${role.id}`} className="t5a-role-card">
            <div className="t5a-role-card-head">
              <h4>{role.name}</h4>
              <span className={`t5a-priority-tag p-${Math.min(4, Math.max(1, Number(role.priority || 1)))}`}>
                Нэн тэргүүн {role.priority || 1}
              </span>
            </div>
            <p>{formatDate(role.createdOn)}-с идэвхтэй</p>
            <div className="t5a-role-card-foot">
              <span className="t5a-purple-text">
                <FiUsers /> {Math.max(1, Number(role.priority || 1) * 5)} хэрэглэгч
              </span>
              <button type="button" className="t5a-btn t5a-btn-sm" onClick={() => handleEdit(role)}>
                <FiEdit2 /> Засах
              </button>
            </div>
          </article>
        ))}
        {roles.length === 0 && <div className="t5a-empty-cell">Карт үзүүлэх эрх алга</div>}
      </div>

      {modalType === "form" && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>{editingId ? "Эрх засах" : "Шинэ эрх"}</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form className="t5a-form" onSubmit={handleSubmit}>
              <div className="t5a-modal-grid">
                <input
                  type="text"
                  placeholder="Эрхийн нэр"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
                <input
                  type="number"
                  placeholder="Priority"
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))}
                  min={0}
                />
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

      {modalType === "delete" && selectedRole && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal small" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>Эрх устгах</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <p className="t5a-modal-text">
              <strong>{selectedRole.name}</strong> эрхийг устгах уу?
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

export default AdminRolesPage;
