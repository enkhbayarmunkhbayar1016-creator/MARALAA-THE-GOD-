import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiUser, FiCalendar } from "react-icons/fi";
import { apiGet } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Card, CardHeader, CardTitle, CardContent,
} from "../../components/ui/Card";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
      <div>
        <p className="text-xs text-teal-300">{label}</p>
        <p className="text-sm font-medium font-semibold" style={{ color: "#042f2e" }}>{value || "—"}</p>
      </div>
    </div>
  );
}

export default function UserDetail() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet(`/users/${user_id}`);
        setUser(data);
      } catch (err) {
        const msg = err.message || "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user_id]);

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean).map((s) => s[0]?.toUpperCase()).join("") || "?";

  const fullName = [user?.last_name, user?.first_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/team4/users")}>
          <FiArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Хэрэглэгчийн мэдээлэл</h1>
          <p className="text-sm" style={{ color: "#99f6e4" }}>ID: {user_id}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-teal-50" />
          <div className="h-48 animate-pulse rounded-xl bg-teal-50" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          {/* Avatar + name card */}
          <div className="flex items-center gap-4 rounded-xl border border-teal-100 bg-white p-5">
            {user?.picture && user.picture !== "no-image.jpg" ? (
              <img
                src={/^(https?:)?\/\//i.test(user.picture) ? user.picture : `https://todu.mn/bs/lms/v1/${user.picture}`}
                alt={fullName}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
              />
            ) : null}
            <div className={`h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 ${user?.picture && user.picture !== "no-image.jpg" ? "hidden" : "flex"}`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold" style={{ color: "#042f2e" }}>{fullName}</p>
              <p className="text-sm" style={{ color: "#99f6e4" }}>@{user?.username ?? "—"}</p>
            </div>
            <Link to={`/team4/users/${user_id}/edit`}>
              <Button variant="outline" size="sm">
                <FiEdit2 className="h-4 w-4" /> Засах
              </Button>
            </Link>
          </div>

          {/* Details card */}
          <Card>
            <CardHeader>
              <CardTitle>Дэлгэрэнгүй мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-100">
              <InfoRow icon={FiUser} label="Овог" value={user?.last_name} />
              <InfoRow icon={FiUser} label="Нэр" value={user?.first_name} />
              <InfoRow icon={FiUser} label="Ургийн овог" value={user?.family_name} />
              <InfoRow icon={FiMail} label="Имэйл" value={user?.email} />
              <InfoRow icon={FiUser} label="Хэрэглэгчийн нэр" value={user?.username} />
              <InfoRow icon={FiPhone} label="Утас" value={user?.phone} />
              <InfoRow icon={FiCalendar} label="Бүртгүүлсэн огноо" value={user?.created_on} />
            </CardContent>
          </Card>

          {/* Schools */}
          {user?.schools?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Бүртгэлтэй сургуулиуд</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.schools.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: "1px solid #f1f5f9", background: "#f0fdfa" }}>
                    <span className="text-sm font-medium " style={{ color: "#134e4a" }}>{s.name}</span>
                    <Badge variant="secondary">{s.role?.name ?? "—"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
