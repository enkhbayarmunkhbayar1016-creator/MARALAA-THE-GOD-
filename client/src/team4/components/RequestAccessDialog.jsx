import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiSearch,
  FiSend,
  FiX,
} from "react-icons/fi";
import { FaSchool } from "react-icons/fa";
import { apiGet, apiPost, parseField, withCurrentUser } from "../utils/api";
import { ROLES } from "../utils/constants";
import { useToast } from "./ui/Toast";
import { useAuth } from "../utils/AuthContext";

function getSchoolId(school) {
  return school?.id ?? school?.school_id ?? school?.SCHOOL_ID ?? school?.ID ?? null;
}

function getSchoolName(school) {
  return school?.name ?? `Сургууль #${getSchoolId(school) ?? "-"}`;
}

function getStatusLabel(item) {
  if (item?.status_id === 10) return "Хүлээгдэж байна";
  if (item?.status_id === 20) return "Зөвшөөрсөн";
  if (item?.status_id === 30) return "Татгалзсан";
  return item?.["{}status"] || `Төлөв #${item?.status_id ?? "-"}`;
}

function getRoleLabel(roleId, roleName) {
  if (roleName) return roleName;
  if (Number(roleId) === Number(ROLES.ADMIN)) return "Сургуулийн админ";
  if (Number(roleId) === Number(ROLES.TEACHER)) return "Багш";
  if (Number(roleId) === Number(ROLES.STUDENT)) return "Суралцагч";
  return `Эрх #${roleId ?? "-"}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMembershipRole(userSchools, schoolId) {
  const matched = (userSchools || []).find(
    (s) => String(getSchoolId(s)) === String(schoolId)
  );

  if (!matched) return null;
  return parseField(matched, "role");
}

function isAdminOfSchool(userSchools, schoolId) {
  const role = getMembershipRole(userSchools, schoolId);
  return Number(role?.id) === Number(ROLES.ADMIN);
}

function SchoolImage({ school }) {
  const [failed, setFailed] = useState(false);
  const picture = school?.picture;
  const name = getSchoolName(school);
  const firstLetter = name?.charAt(0)?.toUpperCase?.() || "S";

  if (!picture || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
        <div className="flex flex-col items-center gap-1">
          <FaSchool className="h-6 w-6" />
          <span className="text-xs font-bold">{firstLetter}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={picture}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function RequestAccessDialog({ open, onClose, userSchools = [] }) {
  const toast = useToast();
  const { user } = useAuth();

  const [allSchools, setAllSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [roleId, setRoleId] = useState(String(ROLES.STUDENT));
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  const selectedSchoolId = getSchoolId(selectedSchool);

  useEffect(() => {
    if (!open) return;
    if (allSchools.length > 0) return;

    setLoadingSchools(true);

    apiGet("/schools?limit=10000")
      .then((data) => {
        const items = data?.items ?? [];
        const filtered = items
          .filter((s) => Number(getSchoolId(s)) !== 0)
          .sort((a, b) => Number(getSchoolId(a)) - Number(getSchoolId(b)));

        setAllSchools(filtered);
      })
      .catch((err) => {
        toast.error(err.message || "Сургуулийн жагсаалт авахад алдаа гарлаа.");
      })
      .finally(() => setLoadingSchools(false));
  }, [open, allSchools.length, toast]);

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = allSchools.filter((s) => Number(getSchoolId(s)) !== 0);

    if (!q) return source.slice(0, 20);

    return source
      .filter((school) => String(school?.name ?? "").toLowerCase().includes(q))
      .slice(0, 20);
  }, [allSchools, search]);

  const loadMyRequests = useCallback(
    async (schoolId) => {
      if (!schoolId) return;

      setHistoryLoading(true);

      try {
        const data = await apiGet(`/schools/${schoolId}/requests`);
        const items = data?.items ?? [];
        const currentUserId = String(user?.id ?? "");

        const filtered = items.filter((item) => {
          const itemUserId = String(
            item?.user_id ??
              item?.created_by ??
              item?.user?.id ??
              item?.user?.user_id ??
              ""
          );

          return currentUserId && itemUserId === currentUserId;
        });

        const sorted = [...filtered].sort((a, b) => {
          const aTime = new Date(a?.created_on ?? 0).getTime();
          const bTime = new Date(b?.created_on ?? 0).getTime();
          return bTime - aTime;
        });

        setHistoryItems(sorted);
      } catch {
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!open || !selectedSchoolId) return;
    loadMyRequests(selectedSchoolId);
  }, [open, selectedSchoolId, loadMyRequests]);

  function resetForm() {
    setSearch("");
    setSelectedSchool(null);
    setRoleId(String(ROLES.STUDENT));
    setDescription("");
    setHistoryItems([]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleBackToSearch() {
    setSelectedSchool(null);
    setRoleId(String(ROLES.STUDENT));
    setDescription("");
    setHistoryItems([]);
  }

  function handleSelectSchool(school) {
    setSelectedSchool(school);
    setRoleId(String(ROLES.STUDENT));
    loadMyRequests(getSchoolId(school));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedSchoolId) {
      toast.warning("Сургууль сонгоно уу.");
      return;
    }

    setSubmitting(true);

    const requestType =
      Number(roleId) === Number(ROLES.ADMIN)
        ? "school_admin"
        : Number(roleId) === Number(ROLES.TEACHER)
        ? "teacher"
        : "school_member";

    try {
      await apiPost(
        `/schools/${selectedSchoolId}/requests`,
        withCurrentUser({
          description: description.trim(),
          role_id: Number(roleId),
          request_type: requestType,
          request_scope:
            requestType === "school_admin" ? "school_request" : "school_membership",
        })
      );

      toast.success("Эрхийн хүсэлт амжилттай илгээгдлээ.");
      setDescription("");
      setRoleId(String(ROLES.STUDENT));
      await loadMyRequests(selectedSchoolId);
    } catch (err) {
      toast.error(err.message || "Эрхийн хүсэлт илгээхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  const isAdminForSelectedSchool =
    selectedSchoolId && isAdminOfSchool(userSchools, selectedSchoolId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="hidden w-80 shrink-0 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-950 p-8 text-white lg:flex lg:flex-col">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-3xl shadow-lg">
            <FiSend />
          </div>

          <h2 className="mt-8 text-3xl font-extrabold">Эрхийн хүсэлт</h2>

          <p className="mt-4 text-sm leading-7 text-blue-100">
            Сургуулиа сонгоод системийн админ руу эрхийн хүсэлт илгээнэ.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-3xl bg-white/10 p-5">
              <div className="text-sm font-bold">01</div>
              <div className="mt-1 text-base font-semibold">Сургууль сонгох</div>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <div className="text-sm font-bold">02</div>
              <div className="mt-1 text-base font-semibold">Эрх сонгох</div>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <div className="text-sm font-bold">03</div>
              <div className="mt-1 text-base font-semibold">Хүсэлт илгээх</div>
            </div>
          </div>

        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-blue-100 bg-white px-7 py-5">
            <div>
              <h2 className="text-2xl font-extrabold text-blue-950">
                {selectedSchool ? "Хүсэлт илгээх" : "Сургууль сонгох"}
              </h2>
              <p className="mt-1 text-sm text-blue-500">
                {selectedSchool
                  ? getSchoolName(selectedSchool)
                  : "Доорх жагсаалтаас сургуулиа сонгоно уу."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl bg-blue-50 p-3 text-blue-600 transition hover:bg-blue-100"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-7">
            {!selectedSchool ? (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Сургуулийн нэрээр хайх..."
                      className="h-14 w-full rounded-2xl border border-blue-200 bg-blue-50/60 pl-13 pr-5 text-base outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {loadingSchools ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-28 animate-pulse rounded-[28px] bg-white"
                      />
                    ))}
                  </div>
                ) : filteredSchools.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-blue-200 bg-white px-4 py-16 text-center text-sm text-blue-500">
                    Тохирох сургууль олдсонгүй.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSchools.map((school) => {
                      const schoolId = getSchoolId(school);
                      const roleObj = getMembershipRole(userSchools, schoolId);
                      const isMember = !!roleObj;

                      return (
                        <button
                          key={schoolId}
                          type="button"
                          disabled={isMember}
                          onClick={() => handleSelectSchool(school)}
                          className={`group flex w-full items-center gap-5 rounded-[28px] border bg-white p-4 text-left shadow-sm transition-all ${
                            isMember
                              ? "cursor-not-allowed border-slate-200 opacity-55"
                              : "border-blue-100 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-xl"
                          }`}
                        >
                          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50">
                            <SchoolImage school={school} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                ID: {schoolId}
                              </span>

                              {isMember && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  Бүртгэлтэй
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 line-clamp-2 text-xl font-extrabold text-blue-950 transition group-hover:text-blue-600">
                              {getSchoolName(school)}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Энэ сургууль руу эрхийн хүсэлт илгээх
                            </p>
                          </div>

                          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white sm:flex">
                            <FiCheckCircle className="h-5 w-5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-blue-600 shadow-sm hover:bg-blue-50"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Буцах
                </button>

                <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-extrabold text-blue-950">
                    {getSchoolName(selectedSchool)}
                  </h3>
                  <p className="mt-1 text-sm text-blue-500">
                    Хүсэх эрхээ сонгоод тайлбараа бичнэ үү.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-[28px] border p-5 shadow-sm transition ${
                        String(roleId) === String(ROLES.TEACHER)
                          ? "border-blue-600 bg-blue-50"
                          : "border-blue-100 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role_id"
                        value={ROLES.TEACHER}
                        checked={String(roleId) === String(ROLES.TEACHER)}
                        onChange={(e) => setRoleId(e.target.value)}
                      />
                      <div className="mt-4 text-lg font-extrabold text-blue-950">
                        Багш
                      </div>
                      <p className="mt-2 text-sm leading-6 text-blue-500">
                        Тухайн сургуульд багш эрх хүсэх
                      </p>
                    </label>

                    <label
                      className={`cursor-pointer rounded-[28px] border p-5 shadow-sm transition ${
                        String(roleId) === String(ROLES.STUDENT)
                          ? "border-blue-600 bg-blue-50"
                          : "border-blue-100 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role_id"
                        value={ROLES.STUDENT}
                        checked={String(roleId) === String(ROLES.STUDENT)}
                        onChange={(e) => setRoleId(e.target.value)}
                      />
                      <div className="mt-4 text-lg font-extrabold text-blue-950">
                        Суралцагч
                      </div>
                      <p className="mt-2 text-sm leading-6 text-blue-500">
                        Тухайн сургуульд суралцагч эрх хүсэх
                      </p>
                    </label>
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Тайлбар бичнэ үү..."
                    className="w-full rounded-[28px] border border-blue-100 bg-white px-5 py-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  {isAdminForSelectedSchool && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Та энэ сургуулийн админ тул өөрийн сургууль руу эрхийн хүсэлт илгээх боломжгүй.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedSchoolId || isAdminForSelectedSchool}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSend className="h-4 w-4" />
                    {submitting ? "Илгээж байна..." : "Эрхийн хүсэлт илгээх"}
                  </button>
                </form>

                <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-extrabold text-blue-950">
                    Миний хүсэлтүүд
                  </h3>

                  {historyLoading ? (
                    <div className="rounded-3xl bg-blue-50 px-4 py-10 text-center text-sm text-blue-500">
                      Уншиж байна...
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div className="rounded-3xl bg-blue-50 px-4 py-10 text-center text-sm text-blue-500">
                      Энэ сургууль дээр таны өмнөх эрх хүсэлт олдсонгүй.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-sm font-extrabold text-blue-950">
                              {getRoleLabel(
                                item.role_id,
                                item?.role?.name || item?.["{}role"]
                              )}
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600">
                              {getStatusLabel(item)}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-blue-600">
                            <div className="flex items-center gap-2">
                              <FiClock className="h-4 w-4 text-blue-400" />
                              <span>
                                Илгээсэн огноо: {formatDate(item.created_on)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <FiFileText className="h-4 w-4 text-blue-400" />
                              <span>
                                Сургууль:{" "}
                                {allSchools.find(
                                  (s) =>
                                    String(getSchoolId(s)) ===
                                    String(item.school_id)
                                )?.name ?? `Сургууль #${item.school_id}`}
                              </span>
                            </div>

                            <div className="rounded-2xl bg-white px-4 py-3 text-blue-700">
                              {item.description?.trim() || "Тайлбар оруулаагүй"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-blue-100 bg-white px-7 py-4 text-right">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl border border-blue-200 bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
            >
              Хаах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}