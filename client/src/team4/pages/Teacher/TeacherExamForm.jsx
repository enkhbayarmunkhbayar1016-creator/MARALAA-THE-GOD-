import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiUsers } from "react-icons/fi";
import { apiGet, parseField } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "../../components/ui/Card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "../../components/ui/Table";

const COURSE_USERS_LIMIT = 10000;

export default function GroupUserList() {
  const { course_id, group_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [usersRes, groupRes] = await Promise.all([
          apiGet(`/courses/${course_id}/users?limit=${COURSE_USERS_LIMIT}`),
          apiGet(`/groups/${group_id}`).catch(() => null),
        ]);

        const allEnrollments = usersRes?.items ?? (Array.isArray(usersRes) ? usersRes : []);

        // Filter enrollments belonging to this group and extract user data
        const groupUsers = allEnrollments
          .filter((enrollment) => {
            // Try multiple ways to get group_id from the enrollment object
            const groupFromField = parseField(enrollment, "group");
            const groupIdFromField = groupFromField?.id;
            const groupIdDirect = enrollment.group_id;
            
            const enrollmentGroupId = groupIdFromField ?? groupIdDirect;
            
            return String(enrollmentGroupId) === String(group_id);
          })
          .map((enrollment) => {
            // Extract the actual user object from the enrollment
            const user = parseField(enrollment, "user") ?? enrollment.user ?? enrollment;
            return {
              ...user,
              enrollmentId: enrollment.id,
              group_id: enrollment.group_id || parseField(enrollment, "group")?.id,
            };
          });

        setUsers(groupUsers);
        setGroupInfo(groupRes);
      } catch (err) {
        const msg = err.message || "Мэдээлэл ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [course_id, group_id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return name.includes(q) || String(u.email || "").toLowerCase().includes(q);
    });
  }, [users, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/team4/courses/${course_id}/groups`)}>
          <FiArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <FiUsers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Бүлгийн гишүүд</h1>
            <p className="text-sm" style={{ color: "#99f6e4" }}>
              {groupInfo?.name || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="px-4 pb-4 pt-5">
          <div className="relative w-full max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, имэйл хайх..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Жагсаалт</CardTitle>
          <CardDescription>Нийт {filtered.length} гишүүн</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl" style={{ background: "#f0fdfa" }} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-teal-100 py-10 text-center text-sm text-teal-300">
              Энэ бүлэгт гишүүн олдсонгүй.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Имэйл</TableHead>
                  <TableHead>Username</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id ?? u.user_id}>
                    <TableCell className="font-medium font-semibold" style={{ color: "#042f2e" }}>
                      {[u.last_name, u.first_name].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.username || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
