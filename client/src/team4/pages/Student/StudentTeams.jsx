import { useState } from "react";
import {
  FiArrowLeft,
  FiBookOpen,
  FiHash,
  FiLayers,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import { getStudentCourses } from "./api/studentCourseApi";
import { getGroupDetail, getCourseMembers } from "./api/studentGroupApi";
import { useStudentData } from "./hooks";
import Pagination from "./components/Pagination";
import { avatarSrc } from "./utils";

const PAGE_SIZE = 6;

async function loadStudentGroups(userId) {
  if (!userId) return [];

  const enrolled = await getStudentCourses(userId);
  const courses = enrolled?.items ?? [];

  const withGroup = courses
    .map((enrollment) => {
      const course = enrollment.course ?? {};

      return {
        enrollment,
        course,
        courseId: course.id ?? enrollment.course_id,
        groupId: enrollment.group_id ?? enrollment.group?.id ?? null,
      };
    })
    .filter((item) => item.groupId != null);

  return Promise.all(
    withGroup.map(async ({ enrollment, course, courseId, groupId }) => {
      const [groupDetail, members] = await Promise.all([
        getGroupDetail(groupId).catch(() => null),
        getCourseMembers(courseId).catch(() => ({ items: [] })),
      ]);

      const classmates = (members?.items ?? []).filter(
        (member) => member.group_id === groupId
      );

      return {
        courseId,
        courseName: course.name ?? course.course_name ?? `Хичээл #${courseId}`,
        groupId,
        groupDetail: groupDetail ?? {
          id: groupId,
          name: enrollment.group?.name,
        },
        classmates,
      };
    })
  );
}


export default function StudentGroups() {
  const { user } = useAuth();

  const { data, loading, error } = useStudentData(
    () => loadStudentGroups(user?.id),
    [user?.id]
  );

  const groups = data ?? [];

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = groups;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedGroup =
    groups.find((group) => group.courseId === selectedCourseId) ??
    pageItems[0] ??
    null;

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-[24px] bg-blue-50"
              />
            ))}
          </div>

          <div className="h-80 animate-pulse rounded-[30px] bg-blue-50" />
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[30px] border border-dashed border-blue-200 bg-white px-5 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
            <FiUsers className="h-8 w-8" />
          </div>

          <p className="text-lg font-black text-slate-950">Баг олдсонгүй</p>

          <p className="mt-2 text-sm font-bold text-slate-500">
            Та ямар нэг хичээлд багд хуваарилагдаагүй байна.
          </p>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-950">
                  Миний багууд
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Багаа сонгоод мэдээллийг баруун талаас харна.
                </p>
              </div>

              <div className="space-y-3">
                {pageItems.map((group) => {
                  const active =
                    selectedGroup?.courseId === group.courseId;

                  return (
                    <button
                      key={group.courseId}
                      type="button"
                      onClick={() => setSelectedCourseId(group.courseId)}
                      className={`w-full rounded-[24px] border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                        active
                          ? "border-blue-500 bg-blue-600 text-white shadow-lg"
                          : "border-blue-100 bg-blue-50/40 text-slate-950 hover:bg-blue-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-black uppercase tracking-widest ${
                          active ? "text-blue-50" : "text-blue-500"
                        }`}
                      >
                        {group.courseName}
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        {group.groupDetail?.name || "Баг оноогүй"}
                      </h3>

                      <p
                        className={`mt-2 text-sm font-bold ${
                          active ? "text-blue-50" : "text-slate-500"
                        }`}
                      >
                        {group.classmates.length} гишүүн
                      </p>
                    </button>
                  );
                })}
              </div>

              {pageCount > 1 && (
                <div className="mt-5">
                  <Pagination
                    page={currentPage}
                    pageCount={pageCount}
                    onChange={setPage}
                  />
                </div>
              )}
            </div>

            <GroupPreview group={selectedGroup} meId={user?.id} />
          </div>
        </>
      )}
    </div>
  );
}

function GroupPreview({ group, meId }) {
  if (!group) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-[30px] border border-dashed border-blue-200 bg-white text-sm font-bold text-blue-500">
        Баг сонгоно уу.
      </div>
    );
  }

  const teamName = group.groupDetail?.name || "Баг оноогүй";

  return (
    <div className="overflow-hidden rounded-[34px] border border-blue-100 bg-white shadow-sm">
      <div className="relative bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 p-8 text-white">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative">
          <p className="mb-3 inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur">
            Сонгосон баг
          </p>

          <h1 className="text-4xl font-black tracking-tight">{teamName}</h1>

          <p className="mt-3 text-sm font-bold text-blue-50">
            {group.courseName}
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <InfoCard icon={FiBookOpen} label="Хичээл" value={group.courseName} />
        <InfoCard
          icon={FiLayers}
          label="Эрэмбэ"
          value={group.groupDetail?.priority ?? "-"}
        />
        <InfoCard icon={FiHash} label="Group ID" value={group.groupId ?? "-"} />
      </div>

      <div className="border-t border-blue-100 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Багийн гишүүд
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Энэ багт хамрагдсан оюутнууд
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
            {group.classmates.length} гишүүн
          </div>
        </div>

        {group.classmates.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-12 text-center text-sm font-bold text-blue-500">
            Гишүүн олдсонгүй.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {group.classmates.map((member) => (
              <MemberCard
                key={member.id ?? member.user_id}
                member={member}
                isMe={member.user?.id === meId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-blue-500">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function MemberCard({ member, isMe }) {
  const user = member.user ?? {};

  const name =
    [user.last_name, user.first_name].filter((x) => x && x !== "-").join(" ") ||
    user.username ||
    `User #${user.id}`;

  const pic = avatarSrc(user.picture);

  return (
    <div className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        {pic ? (
          <img
            src={pic}
            alt={name}
            className="h-14 w-14 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FiUsers className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-slate-950">
              {name}
            </h3>

            {isMe && (
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                Би
              </span>
            )}
          </div>

          <p className="mt-2 flex items-center gap-2 truncate text-sm font-bold text-slate-500">
            <FiMail className="h-4 w-4 text-blue-500" />
            {user.email || user.username || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}