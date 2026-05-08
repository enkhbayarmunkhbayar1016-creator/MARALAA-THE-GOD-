import { useState } from "react";
import {
  FiBell,
  FiLock,
  FiMail,
  FiSave,
  FiSettings,
  FiShield,
  FiToggleLeft,
  FiUsers,
} from "react-icons/fi";

function SettingCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-blue-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-blue-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-blue-50/60 px-4 py-4">
      <span className="text-sm font-bold text-blue-950">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-blue-600"
      />
    </label>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    allowRegistration: true,
    requireAdminApprove: true,
    emailNotify: true,
    allowTeacherAddStudent: true,
    maintenanceMode: false,
    autoLogout: true,
  });

  function set(key) {
    return (value) => setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-7">
      <div className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white">
            <FiSettings className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-blue-950">
              Системийн тохиргоо
            </h1>
            <p className="mt-1 text-sm font-bold text-blue-500">
              Сургуулийн хэрэглэгч, эрх, мэдэгдэл болон хамгаалалтын тохиргоо
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingCard
          icon={FiUsers}
          title="Хэрэглэгчийн тохиргоо"
          desc="Бүртгэл болон хэрэглэгч нэмэх эрхийн тохиргоо"
        >
          <div className="space-y-3">
            <ToggleRow
              label="Шинэ хэрэглэгч бүртгүүлэхийг зөвшөөрөх"
              checked={settings.allowRegistration}
              onChange={set("allowRegistration")}
            />
            <ToggleRow
              label="Шинэ хэрэглэгчийг админ баталгаажуулсны дараа идэвхжүүлэх"
              checked={settings.requireAdminApprove}
              onChange={set("requireAdminApprove")}
            />
            <ToggleRow
              label="Багш суралцагч нэмэх боломжтой байх"
              checked={settings.allowTeacherAddStudent}
              onChange={set("allowTeacherAddStudent")}
            />
          </div>
        </SettingCard>

        <SettingCard
          icon={FiShield}
          title="Эрхийн тохиргоо"
          desc="Админ, багш, суралцагчийн эрхийн хяналт"
        >
          <div className="space-y-3">
            <div className="rounded-2xl bg-blue-50/60 px-4 py-4">
              <p className="text-sm font-black text-blue-950">Админ</p>
              <p className="mt-1 text-xs font-bold text-blue-500">
                Хэрэглэгч харах, засах, эрх батлах боломжтой
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50/60 px-4 py-4">
              <p className="text-sm font-black text-blue-950">Багш</p>
              <p className="mt-1 text-xs font-bold text-blue-500">
                Хичээл болон суралцагчийн мэдээлэл удирдах боломжтой
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50/60 px-4 py-4">
              <p className="text-sm font-black text-blue-950">Суралцагч</p>
              <p className="mt-1 text-xs font-bold text-blue-500">
                Өөрийн хичээл, шалгалт, мэдээллээ харах боломжтой
              </p>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={FiBell}
          title="Мэдэгдлийн тохиргоо"
          desc="Эрхийн хүсэлт болон шинэ бүртгэлийн мэдэгдэл"
        >
          <div className="space-y-3">
            <ToggleRow
              label="Эрхийн хүсэлт ирэхэд мэдэгдэл харуулах"
              checked={settings.emailNotify}
              onChange={set("emailNotify")}
            />
            <ToggleRow
              label="Хэрэглэгч нэмэгдэхэд админд мэдэгдэх"
              checked={settings.emailNotify}
              onChange={set("emailNotify")}
            />
          </div>
        </SettingCard>

        <SettingCard
          icon={FiLock}
          title="Хамгаалалтын тохиргоо"
          desc="Нэвтрэлт, session болон системийн горим"
        >
          <div className="space-y-3">
            <ToggleRow
              label="Идэвхгүй үед автоматаар гарах"
              checked={settings.autoLogout}
              onChange={set("autoLogout")}
            />
            <ToggleRow
              label="Maintenance mode асаах"
              checked={settings.maintenanceMode}
              onChange={set("maintenanceMode")}
            />
          </div>
        </SettingCard>
      </div>

      <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-blue-950">
          Ерөнхий мэдээлэл
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-5">
            <FiMail className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-sm font-black text-blue-950">
              Email domain
            </p>
            <p className="mt-1 text-sm font-bold text-blue-500">
              @must.edu.mn
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <FiToggleLeft className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-sm font-black text-blue-950">
              Системийн төлөв
            </p>
            <p className="mt-1 text-sm font-bold text-blue-500">
              Идэвхтэй
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <FiShield className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-sm font-black text-blue-950">
              Default role
            </p>
            <p className="mt-1 text-sm font-bold text-blue-500">
              Суралцагч
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700"
        >
          <FiSave className="h-4 w-4" />
          Тохиргоо хадгалах
        </button>
      </div>
    </div>
  );
}