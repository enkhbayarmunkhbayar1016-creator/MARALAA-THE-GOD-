import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiSend, FiArrowRight } from "react-icons/fi";
import { FaSchool } from "react-icons/fa";
import { useAuth } from "../../utils/AuthContext";
import { apiGet, parseField } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { ROLES } from "../../utils/constants";
import RequestAccessDialog from "../../components/RequestAccessDialog";

const ROLE_META = {
  [ROLES.ADMIN]: {
    label: "Админ",
    bgColor: "#eff6ff",
    textColor: "#2563eb",
    borderColor: "#bfdbfe",
    dotColor: "#2563eb",
  },
  [ROLES.TEACHER]: {
    label: "Багш",
    bgColor: "#eff6ff",
    textColor: "#2563eb",
    borderColor: "#bfdbfe",
    dotColor: "#2563eb",
  },
  [ROLES.STUDENT]: {
    label: "Оюутан",
    bgColor: "#eff6ff",
    textColor: "#2563eb",
    borderColor: "#bfdbfe",
    dotColor: "#2563eb",
  },
};

const FALLBACK_ROLE = {
  bgColor: "#eff6ff",
  textColor: "#2563eb",
  borderColor: "#bfdbfe",
  dotColor: "#2563eb",
};

function pictureUrl(picture) {
  if (!picture || picture === "no-image.jpg") return null;
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  if (picture.startsWith("data:image/")) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

export default function SchoolSelect() {
  const navigate = useNavigate();
  const { user, selectSchool } = useAuth();
  const toast = useToast();

  const [schools, setSchools] = useState([]);
  const [schoolPictures, setSchoolPictures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchSchoolPictures = useCallback(async (schoolList) => {
    const pics = {};

    await Promise.allSettled(
      schoolList.map(async (s) => {
        if (s.id === 0) return;

        try {
          const detail = await apiGet(`/schools/${s.id}`);
          const url = pictureUrl(detail?.picture);
          if (url) pics[s.id] = url;
        } catch {
          // fallback
        }
      })
    );

    setSchoolPictures(pics);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    apiGet(`/users/${user.id}/schools`)
      .then(async (data) => {
        const userSchools = data?.items ?? [];

        const hasSystemAdmin = userSchools.some((s) => {
          const role = parseField(s, "role");
          return s.id === 0 && role?.id === ROLES.ADMIN;
        });

        let finalSchools;

        if (hasSystemAdmin) {
          setIsSystemAdmin(true);

          try {
            const allData = await apiGet("/schools?limit=10000");
            const allSchools = allData?.items ?? [];
            const systemSchool = userSchools.find((s) => s.id === 0);
            const otherSchools = allSchools.filter((s) => s.id !== 0);

            finalSchools = systemSchool
              ? [systemSchool, ...otherSchools]
              : otherSchools;
          } catch {
            finalSchools = userSchools;
          }
        } else {
          finalSchools = userSchools;
        }

        finalSchools.sort((a, b) => {
          if (a.id === 0) return -1;
          if (b.id === 0) return 1;
          return Number(a.id) - Number(b.id);
        });

        setSchools(finalSchools);
        fetchSchoolPictures(finalSchools);
      })
      .catch((err) => {
        const msg = err.message || "Сургуулийн мэдээлэл авахад алдаа гарлаа";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [user?.id, toast, fetchSchoolPictures]);

  function handleSelect(school) {
    const roleObj = parseField(school, "role");

    if (!roleObj && isSystemAdmin) {
      selectSchool({
        ...school,
        "{}role": JSON.stringify({ id: ROLES.ADMIN, name: "Админ" }),
      });
    } else {
      selectSchool(school);
    }

    toast.success(`${school.name ?? "Сургууль"} сонгогдлоо.`);
    navigate("/team4/", { replace: true });
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6">
      <div className="w-full rounded-[28px] border border-blue-100 bg-white p-6 shadow-md sm:p-8">
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 w-full rounded-2xl border border-blue-100 bg-blue-50 shadow-sm school-shimmer"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="school-card-enter flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Алдаа гарлаа</p>
              <p className="mt-0.5 text-red-600/80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && schools.length === 0 && (
          <div className="school-card-enter rounded-2xl border border-blue-100 bg-blue-50 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-blue-500">
              <FaSchool />
            </div>

            <h2 className="text-lg font-semibold text-blue-950">
              Сургуультай холбогдоогүй байна
            </h2>

            <p className="mx-auto mt-1.5 max-w-xs text-sm text-blue-400">
              Та ямар нэг сургуулийн гишүүн биш байна.
            </p>
          </div>
        )}

        {!loading && !error && schools.length > 0 && (
          <div className="flex flex-col gap-4">
            {schools.map((school, idx) => {
              const roleObj =
                parseField(school, "role") ??
                (isSystemAdmin ? { id: ROLES.ADMIN, name: "Админ" } : null);

              const roleMeta = ROLE_META[roleObj?.id] ?? FALLBACK_ROLE;
              const roleLabel = roleObj?.name;
              const imgSrc = schoolPictures[school.id];
              const isHovered = hoveredId === school.id;

              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => handleSelect(school)}
                  onMouseEnter={() => setHoveredId(school.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="school-card-enter group flex w-full overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <div className="relative h-28 w-60 shrink-0 overflow-hidden bg-blue-50">
                    {imgSrc ? (
                      <>
                        <img
                          src={imgSrc}
                          alt={school.name ?? ""}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50">
                        <FaSchool className="text-4xl text-blue-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 items-center justify-between p-5">
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-blue-950">
                        {school.name ?? `Сургууль #${school.id}`}
                      </h3>

                      {roleLabel && (
                        <span
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: roleMeta.bgColor,
                            color: roleMeta.textColor,
                            borderColor: roleMeta.borderColor,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: roleMeta.dotColor }}
                          />
                          {roleLabel}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        isHovered
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      <FiArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowRequestDialog(true)}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white text-base font-bold text-blue-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 active:scale-[0.99]"
          >
            <FiSend className="h-5 w-5" />
            Эрхийн санал хүсэлт
          </button>
        </div>
      </div>

      <RequestAccessDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        userSchools={schools}
      />
    </div>
  );
}