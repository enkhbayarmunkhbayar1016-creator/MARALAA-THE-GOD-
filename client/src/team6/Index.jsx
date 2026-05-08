import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "./admin/AdminAuthContext";
import AdminLayout from "./admin/components/AdminLayout";
import AdminProtectedRoute from "./admin/components/AdminProtectedRoute";
import AdminCoursesPage from "./admin/pages/AdminCoursesPage";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminReportsPage from "./admin/pages/AdminReportsPage";
import AdminRolesPage from "./admin/pages/AdminRolesPage";
import AdminSettingsPage from "./admin/pages/AdminSettingsPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import { StudentAuthProvider } from "./student/StudentAuthContext";
import StudentLayout from "./student/components/StudentLayout";
import StudentProtectedRoute from "./student/components/StudentProtectedRoute";
import StudentAssignmentsPage from "./student/pages/StudentAssignmentsPage";
import StudentAttendancePage from "./student/pages/StudentAttendancePage";
import StudentCoursesPage from "./student/pages/StudentCoursesPage";
import StudentDashboardPage from "./student/pages/StudentDashboardPage";
import StudentExamAnswersPage from "./student/pages/StudentExamAnswersPage";
import StudentExamDetailPage from "./student/pages/StudentExamDetailPage";
import StudentExamResultPage from "./student/pages/StudentExamResultPage";
import StudentExamTakePage from "./student/pages/StudentExamTakePage";
import StudentExamsPage from "./student/pages/StudentExamsPage";
import StudentLibraryPage from "./student/pages/StudentLibraryPage";
import StudentMessagesPage from "./student/pages/StudentMessagesPage";
import StudentReportsPage from "./student/pages/StudentReportsPage";
import StudentRequestsPage from "./student/pages/StudentRequestsPage";
import StudentSchedulePage from "./student/pages/StudentSchedulePage";
import StudentSettingsPage from "./student/pages/StudentSettingsPage";
import { TeacherAuthProvider } from "./teacher/TeacherAuthContext";
import TeacherLayout from "./teacher/components/TeacherLayout";
import TeacherProtectedRoute from "./teacher/components/TeacherProtectedRoute";
import TeacherExamDetailPage from "./teacher/pages/TeacherExamDetailPage";
import TeacherExamsPage from "./teacher/pages/TeacherExamsPage";
import TeacherQuestionBankPage from "./teacher/pages/TeacherQuestionBankPage";
import TeacherReportsPage from "./teacher/pages/TeacherReportsPage";
import TeacherSettingsPage from "./teacher/pages/TeacherSettingsPage";
import TeacherStudentDetailPage from "./teacher/pages/TeacherStudentDetailPage";
import TeacherStudentsPage from "./teacher/pages/TeacherStudentsPage";
import TeacherCreateExamPage from "./teacher/pages/TeacherCreateExamPage";
import UnifiedLoginPage from "./UnifiedLoginPage";
import "./admin/styles.css";
import "./student/styles.css";
import "./teacher/styles.css";

const Index = () => {
  return (
    <AdminAuthProvider>
      <StudentAuthProvider>
        <TeacherAuthProvider>
          <Routes>
            <Route index element={<Navigate to="login" replace />} />

            <Route path="login" element={<UnifiedLoginPage />} />

            <Route path="admin/login" element={<Navigate to="/team6/login?role=admin" replace />} />
            <Route
              path="admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="student/login" element={<Navigate to="/team6/login?role=student" replace />} />
            <Route
              path="student"
              element={
                <StudentProtectedRoute>
                  <StudentLayout />
                </StudentProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="library" element={<StudentLibraryPage />} />
              <Route path="exams" element={<StudentExamsPage />} />
              <Route path="exams/:examId" element={<StudentExamDetailPage />} />
              <Route path="exams/:examId/take" element={<StudentExamTakePage />} />
              <Route path="exams/:examId/result" element={<StudentExamResultPage />} />
              <Route path="exams/:examId/answers" element={<StudentExamAnswersPage />} />
              <Route path="reports" element={<StudentReportsPage />} />
              <Route path="courses" element={<StudentCoursesPage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="messages" element={<StudentMessagesPage />} />
              <Route path="requests" element={<StudentRequestsPage />} />
              <Route path="settings" element={<StudentSettingsPage />} />
            </Route>

            <Route path="teacher/login" element={<Navigate to="/team6/login?role=teacher" replace />} />
            <Route
              path="teacher"
              element={
                <TeacherProtectedRoute>
                  <TeacherLayout />
                </TeacherProtectedRoute>
              }
            >
              <Route index element={<Navigate to="exams" replace />} />
              <Route path="exams" element={<TeacherExamsPage />} />
              <Route path="exams/new" element={<TeacherCreateExamPage />} />
              <Route path="exams/:examId/edit" element={<TeacherCreateExamPage />} />
              <Route path="exams/:examId" element={<TeacherExamDetailPage />} />
              <Route path="questions" element={<TeacherQuestionBankPage />} />
              <Route path="students" element={<TeacherStudentsPage />} />
              <Route path="students/:studentId" element={<TeacherStudentDetailPage />} />
              <Route path="reports" element={<TeacherReportsPage />} />
              <Route path="settings" element={<TeacherSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="login" replace />} />
          </Routes>
        </TeacherAuthProvider>
      </StudentAuthProvider>
    </AdminAuthProvider>
  );
};

export default Index;