import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiSearch, FiUserMinus, FiUserPlus, FiUsers } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { Button, EmptyState, Input, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, useToast } from "../../components/ui";
import { useAuth } from "../../utils/AuthContext";
import { apiDelete, apiGet, apiPost, parseField, withCurrentUser } from "../../utils/api";
import { ROLES } from "../../utils/constants";

const COURSE_USERS_LIMIT = 10000;

function getFullName(user) {
  return [user?.last_name, user?.first_name].filter(Boolean).join(" ").trim();
}

function userMatchesSearch(user, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return [
    getFullName(user),
    user?.username,
    user?.email,
    user?.phone,
  ].some((value) => String(value ?? "").toLowerCase().includes(q));
}

function StudentTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function CourseUserEdit() {
  const { course_id } = useParams();
  const { school } = useAuth();
  const toast = useToast();

  const [courseName, setCourseName] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchEnrolled, setSearchEnrolled] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingUserId, setSubmittingUserId] = useState(null);

  useEffect(() => {
    if (!course_id || !school?.id) return;

    async function loadData() {
      try {
        setLoading(true);

        const [courseRes, courseUsersRes, schoolUsersRes, groupsRes] = await Promise.all([
          apiGet(`/courses/${course_id}`).catch(() => ({})),
          apiGet(`/courses/${course_id}/users?limit=${COURSE_USERS_LIMIT}`).catch(() => ({ items: [] })),
          apiGet(`/schools/${school.id}/users`).catch(() => ({ items: [] })),
          apiGet(`/courses/${course_id}/groups`).catch(() => ({ items: [] })),
        ]);

        setCourseName(courseRes?.name ?? `Хичээл #${course_id}`);
        setGroups(groupsRes?.items ?? []);

        const enrolledItems = courseUsersRes?.items ?? [];
        const normalizedEnrolled = enrolledItems.map((item) => {
          const user = parseField(item, "user") ?? item.user ?? {};
          const group = parseField(item, "group") ?? item.group ?? null;
          return {
            enrollmentId: item.id,
            userId: item.user_id ?? user.id ?? item.id,
            user,
            group,
          };
        });
        setEnrolledUsers(normalizedEnrolled);

        const schoolUsers = schoolUsersRes?.items ?? [];
        const membershipResults = await Promise.allSettled(
          schoolUsers.map((user) => apiGet(`/users/${user.id}/schools`))
        );

        const studentUsers = schoolUsers.filter((user, index) => {
          const detail = membershipResults[index];
          if (detail.status !== "fulfilled") return false;

          const memberships = detail.value?.items ?? [];
          const matched = memberships.find((item) => String(item?.id ?? item?.school_id ?? "") === String(school.id));
          const role = parseField(matched, "role");
          const roleId = Number(role?.id ?? matched?.role_id ?? 0);
          return roleId === ROLES.STUDENT;
        });

        const enrolledUserIds = new Set(normalizedEnrolled.map((item) => String(item.userId)));
        setAvailableStudents(studentUsers.filter((user) => !enrolledUserIds.has(String(user.id))));
      } catch (error) {
        toast.error(error.message || "Хичээлийн хэрэглэгчийн мэдээлэл авахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [course_id, school?.id, toast]);

  async function handleAddStudent(student) {
    try {
      setSubmittingUserId(student.id);
      await apiPost(
        `/courses/${course_id}/users`,
        withCurrentUser({
          user_id: String(student.id),
          group_id: selectedGroupId || "",
        })
      );

      const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId)) ?? null;
      setAvailableStudents((prev) => prev.filter((item) => String(item.id) !== String(student.id)));
      setEnrolledUsers((prev) => [...prev, {
        enrollmentId: `tmp-${student.id}`,
        userId: student.id,
        user: student,
        group: selectedGroup,
      }]);
      toast.success("Оюутан хичээлд амжилттай нэмэгдлээ.");
    } catch (error) {
      toast.error(error.message || "Оюутан нэмэхэд алдаа гарлаа.");
    } finally {
      setSubmittingUserId(null);
    }
  }

  async function handleRemoveStudent(item) {
    try {
      setSubmittingUserId(item.userId);
      await apiDelete(
        `/courses/${course_id}/users/${item.userId}`,
        withCurrentUser({
          COURSE_ID: String(course_id),
          USER_ID: String(item.userId),
        })
      );

      setEnrolledUsers((prev) => prev.filter((entry) => String(entry.userId) !== String(item.userId)));
      setAvailableStudents((prev) => [...prev, item.user].sort((a, b) => String(getFullName(a) || a.username).localeCompare(String(getFullName(b) || b.username))));
      toast.success("Оюутан хичээлээс хасагдлаа.");
    } catch (error) {
      toast.error(error.message || "Оюутан хасахад алдаа гарлаа.");
    } finally {
      setSubmittingUserId(null);
    }
  }

  const filteredAvailable = useMemo(
    () => availableStudents.filter((user) => userMatchesSearch(user, searchAvailable)),
    [availableStudents, searchAvailable]
  );

  const filteredEnrolled = useMemo(
    () => enrolledUsers.filter((item) => userMatchesSearch(item.user, searchEnrolled)),
    [enrolledUsers, searchEnrolled]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-300">
            <Link to={`/team4/courses/${course_id}/users`} className="inline-flex items-center gap-1 hover:font-semibold" style={{ color: "#042f2e" }}>
              <FiChevronLeft className="h-4 w-4" />
              Буцах
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold font-semibold" style={{ color: "#042f2e" }}>Хичээлийн хэрэглэгч удирдах</h1>
          <p className="mt-1 text-sm" style={{ color: "#99f6e4" }}>
            {courseName || `Хичээл #${course_id}`} хичээлд оюутан нэмэх, хасах
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
          <p className="text-sm font-medium text-teal-300">Боломжит оюутан</p>
          <p className="mt-1 text-3xl font-bold font-semibold" style={{ color: "#042f2e" }}>{loading ? "…" : availableStudents.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
          <p className="text-sm font-medium text-teal-300">Хичээлд орсон</p>
          <p className="mt-1 text-3xl font-bold font-semibold" style={{ color: "#042f2e" }}>{loading ? "…" : enrolledUsers.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
          <p className="text-sm font-medium text-teal-300">Бүлэг</p>
          <Select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)} className="mt-3">
            <option value="">Бүлэг сонгохгүй</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-teal-100 bg-white shadow-sm">
          <div className="border-b border-teal-100 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold " style={{ color: "#134e4a" }}>Нэмэх боломжтой оюутнууд</h2>
                <p className="mt-1 text-sm" style={{ color: "#99f6e4" }}>Сонгосон сургуульд харьяалагддаг, энэ хичээлд ороогүй оюутнууд.</p>
              </div>
            </div>
            <div className="relative mt-4">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
              <Input
                value={searchAvailable}
                onChange={(event) => setSearchAvailable(event.target.value)}
                placeholder="Нэр, имэйл, username..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <StudentTableSkeleton />
            ) : searchAvailable.trim().length === 0 ? (
              <EmptyState
                icon={<FiSearch className="h-6 w-6" />}
                title="Оюутан хайх"
              />
            ) : filteredAvailable.length === 0 ? (
              <EmptyState
                icon={<FiUsers className="h-6 w-6" />}
                title="Нэмэх оюутан алга"
                description="Сонгосон шүүлтээр харуулах боломжтой оюутан олдсонгүй."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Имэйл</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailable.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-semibold" style={{ color: "#042f2e" }}>
                        {getFullName(student) || student.username || `Хэрэглэгч #${student.id}`}
                      </TableCell>
                      <TableCell>{student.email || "—"}</TableCell>
                      <TableCell>{student.username || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          loading={submittingUserId === student.id}
                          onClick={() => handleAddStudent(student)}
                        >
                          <FiUserPlus className="h-4 w-4" />
                          Нэмэх
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-white shadow-sm">
          <div className="border-b border-teal-100 px-5 py-4">
            <h2 className="font-semibold " style={{ color: "#134e4a" }}>Хичээлд бүртгэлтэй оюутнууд</h2>
            <p className="mt-1 text-sm" style={{ color: "#99f6e4" }}>Одоогоор энэ хичээлд орсон хэрэглэгчид.</p>
            <div className="relative mt-4">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
              <Input
                value={searchEnrolled}
                onChange={(event) => setSearchEnrolled(event.target.value)}
                placeholder="Нэр, имэйл, username..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <StudentTableSkeleton />
            ) : filteredEnrolled.length === 0 ? (
              <EmptyState
                icon={<FiUsers className="h-6 w-6" />}
                title="Хэрэглэгч алга"
                description="Энэ хичээлд одоогоор оюутан бүртгэгдээгүй байна."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Имэйл</TableHead>
                    <TableHead>Бүлэг</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrolled.map((item) => (
                    <TableRow key={item.enrollmentId}>
                      <TableCell className="font-medium font-semibold" style={{ color: "#042f2e" }}>
                        {getFullName(item.user) || item.user?.username || `Хэрэглэгч #${item.userId}`}
                      </TableCell>
                      <TableCell>{item.user?.email || "—"}</TableCell>
                      <TableCell>{item.group?.name || "Бүлэггүй"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={submittingUserId === item.userId}
                          onClick={() => handleRemoveStudent(item)}
                        >
                          <FiUserMinus className="h-4 w-4" />
                          Хасах
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
