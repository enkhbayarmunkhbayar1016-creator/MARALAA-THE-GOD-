import { useAuth } from "../../utils/AuthContext";
import { ROLES } from "../../utils/constants";
import AdminProfile   from "../Admin/AdminProfile";
import TeacherProfile from "../Teacher/TeacherProfile";
import StudentProfile from "../Student/StudentProfile";

export default function Profile() {
  const { role } = useAuth();

  if (role === ROLES.ADMIN)   return <AdminProfile />;
  if (role === ROLES.TEACHER) return <TeacherProfile />;
  if (role === ROLES.STUDENT) return <StudentProfile />;

  return (
    <div className="mx-auto max-w-xl space-y-2">
      <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Миний профайл</h1>
      <p className="text-sm" style={{ color: "#99f6e4" }}>
        Сургуулиа сонгосны дараа таны профайл харагдана.
      </p>
    </div>
  );
}
