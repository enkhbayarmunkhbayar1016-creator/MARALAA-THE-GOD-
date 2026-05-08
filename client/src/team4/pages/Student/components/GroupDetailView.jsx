import {
  FiArrowLeft,
  FiUsers,
  FiHash,
  FiLayers,
  FiBookOpen,
  FiMail,
  FiUserCheck,
} from "react-icons/fi";
import { avatarSrc } from "../utils";

export default function GroupDetailView({ group, meId, onBack }) {
  const teamName = group.groupDetail?.name || "Баг оноогүй";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:-translate-x-1 hover:bg-blue-50"
      >
        <FiArrowLeft className="h-4 w-4" />
        Багууд руу буцах
      </button>

      <div className="overflow-hidden rounded-[34px] border border-blue-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 p-8 text-white">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur">
                Миний баг
              </p>

              <h1 className="text-4xl font-black tracking-tight">
                {teamName}
              </h1>

              <p className="mt-3 text-sm font-bold text-blue-50">
                {group.courseName}
              </p>
            </div>

            <div className="rounded-[26px] bg-white/20 px-6 py-5 backdrop-blur">
              <p className="text-sm font-bold text-blue-50">Гишүүд</p>
              <p className="mt-1 text-3xl font-black">
                {group.classmates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <InfoCard
            icon={FiBookOpen}
            label="Хичээл"
            value={group.courseName}
          />

          <InfoCard
            icon={FiLayers}
            label="Эрэмбэ"
            value={group.groupDetail?.priority ?? "-"}
          />

          <InfoCard
            icon={FiHash}
            label="Group ID"
            value={group.groupId ?? "-"}
          />
        </div>
      </div>

      <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Багийн гишүүд
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Энэ багт хамрагдсан оюутнуудын жагсаалт
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
            {group.classmates.length} гишүүн
          </div>
        </div>

        {group.classmates.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-14 text-center text-sm font-bold text-blue-500">
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
    <div className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-blue-50/50 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/70 transition group-hover:scale-125" />

      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-blue-500">
          {label}
        </p>

        <p className="mt-2 break-words text-lg font-black text-slate-950">
          {value}
        </p>
      </div>
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
    <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-125 group-hover:bg-blue-100" />

      <div className="relative flex items-center gap-4">
        {pic ? (
          <img
            src={pic}
            alt={name}
            className="h-16 w-16 rounded-3xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
            <FiUsers className="h-7 w-7" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black text-slate-950">
              {name}
            </h3>

            {isMe && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                <FiUserCheck className="h-3 w-3" />
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