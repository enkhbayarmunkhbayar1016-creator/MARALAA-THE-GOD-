import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import { apiGet } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";

function pictureUrl(picture) {
  if (!picture || picture === "no-image.jpg") return null;
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-base font-extrabold text-blue-950">
        {value || "—"}
      </p>
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
        setError("");

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
  }, [user_id, toast]);

  const fullName =
    [user?.last_name, user?.first_name].filter(Boolean).join(" ") || "—";

  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "?";

  const src = pictureUrl(user?.picture);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/team4/users")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm hover:bg-blue-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-3xl font-black text-blue-950">
            Хэрэглэгчийн мэдээлэл
          </h1>
          <p className="mt-1 text-sm font-bold text-blue-500">ID: {user_id}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-[30px] bg-white" />
          <div className="h-80 animate-pulse rounded-[30px] bg-white" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-10 text-white">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  {src ? (
                    <img
                      src={src}
                      alt={fullName}
                      className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white/30"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-black">
                      {initials}
                    </div>
                  )}

                  <div>
                    <h2 className="text-3xl font-black">{fullName}</h2>
                    <p className="mt-1 text-blue-100">
                      @{user?.username || "—"}
                    </p>
                    <p className="mt-1 text-blue-100">
                      {user?.email || "Имэйл байхгүй"}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/team4/users/${user_id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg hover:bg-blue-50"
                >
                  <FiEdit2 className="h-4 w-4" />
                  Засах
                </Link>
              </div>
            </div>

            <div className="p-8">
              <h3 className="mb-5 text-xl font-black text-blue-950">
                Дэлгэрэнгүй мэдээлэл
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={FiUser} label="Овог" value={user?.last_name} />
                <InfoCard icon={FiUser} label="Нэр" value={user?.first_name} />
                <InfoCard
                  icon={FiUser}
                  label="Ургийн овог"
                  value={user?.family_name}
                />
                <InfoCard icon={FiMail} label="Имэйл" value={user?.email} />
                <InfoCard
                  icon={FiUser}
                  label="Хэрэглэгчийн нэр"
                  value={user?.username}
                />
                <InfoCard icon={FiPhone} label="Утас" value={user?.phone} />
                <InfoCard
                  icon={FiCalendar}
                  label="Бүртгүүлсэн огноо"
                  value={user?.created_on}
                />
              </div>
            </div>
          </div>

          {user?.schools?.length > 0 && (
            <div className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-xl font-black text-blue-950">
                Бүртгэлтэй сургуулиуд
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {user.schools.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-blue-100 bg-blue-50 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-blue-950">{s.name}</p>
                        <p className="mt-1 text-sm font-bold text-blue-500">
                          ID: {s.id}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                        <FiShield className="h-3.5 w-3.5" />
                        {s.role?.name ?? "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}