import { useState } from "react";
import { FiLock, FiSave } from "react-icons/fi";
import { apiPut, withCurrentUser } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "../../components/ui/Card";

export default function ChangePassword() {
  const toast = useToast();

  const [form, setForm] = useState({
    password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.password || !form.new_password) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }
    if (form.new_password.length < 3) {
      setError("Шинэ нууц үг хамгийн багадаа 3 тэмдэгт байх ёстой.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("Шинэ нууц үг таарахгүй байна.");
      return;
    }

    setSaving(true);
    try {
      await apiPut("/users/me/password", withCurrentUser({
        password: form.password,
        new_password: form.new_password,
      }));
      toast.success("Нууц үг амжилттай солигдлоо.");
      setSuccess(true);
      setForm({ password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const msg = err.message || "Нууц үг солиход алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <FiLock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Нууц үг солих</h1>
          <p className="text-sm" style={{ color: "#99f6e4" }}>Аюулгүй байдлаа хангана уу</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Шинэ нууц үг</CardTitle>
          <CardDescription>Одоогийн нууц үгээ оруулж, шинэ нууц үг тохируулна уу</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Нууц үг амжилттай солигдлоо!
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Одоогийн нууц үг *</Label>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••" required />
            </div>

            <div className="space-y-1.5">
              <Label>Шинэ нууц үг *</Label>
              <Input type="password" value={form.new_password} onChange={set("new_password")} placeholder="••••••" required />
            </div>

            <div className="space-y-1.5">
              <Label>Шинэ нууц үг давтах *</Label>
              <Input type="password" value={form.confirm_password} onChange={set("confirm_password")} placeholder="••••••" required />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              <FiSave className="h-4 w-4" /> Нууц үг солих
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
