import { Navigate, Route, Routes } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './contexts/UserContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Layout/Login';
import Home from './pages/Home'; 

// Student
import StudentSubject from './pages/Student/studentSubject'; 
import StudentSchool from './pages/Student/studentSchoolInfo';
import StudentSchoolList from './pages/Student/studentSchoolList';

// Teacher - (Импортуудыг нэгтгэж, замыг зөв болгов)
import TeacherCourseList from './pages/Teacher/TeacherCourseList'; 
import TeacherCategoryList from './pages/Teacher/TeacherCategoryList';
import TeacherCategoryCourses from './pages/Teacher/TeacherCategoryCourses';
import TeacherCreate from './pages/Teacher/teacherCreate'; 
import TeacherPage from './pages/Teacher/teacherSubject'; 
import TeacherSubjectEdit from './pages/Teacher/teacherSubjectEdit'; 
import SchoolInfo from './pages/Teacher/teacherSchoolInfo';

// Admin 
import SystemAdminDashboard from './pages/Admin/admin'; 
import SchoolAdminDashboard from './pages/Admin/schoolAdmin'; 
import SysAdminSchoolView from './pages/Admin/sysAdminSchoolView';

export default function App() {
  const { user } = useContext(UserContext);

  const getRedirectPath = () => {
    if (!user) return "/layout/login";
    return "/team1/home"; 
  };

  return (
    <Routes>
      <Route path="/layout/login" element={user ? <Navigate to="/team1/home" replace /> : <Login />} />
      
      <Route path="team1">
        <Route path="home" element={
          <ProtectedRoute roles={['student', 'teacher', 'admin', 'schoolAdmin']}>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="school-list" element={
          <ProtectedRoute roles={['student', 'teacher', 'admin', 'schoolAdmin']}>
            <StudentSchoolList />
          </ProtectedRoute>
        } />

        <Route path="school/:id" element={
          <ProtectedRoute roles={['student', 'teacher', 'admin', 'schoolAdmin']}>
            <StudentSchool />
          </ProtectedRoute>
        } />
        
        {/* ОЮУТНЫ ХИЧЭЭЛ - :courseId-г :id болгов (Бусадтай адилхан болгох үүднээс) */}
        <Route path="courses/:id" element={
          <ProtectedRoute roles={['student']}>
            <StudentSubject />
          </ProtectedRoute>
        } />

        {/* --- БАГШИЙН ХЭСЭГ --- */}
        <Route path="teacher">
          <Route path="courses" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCourseList />
            </ProtectedRoute>
          } />
          
          <Route path="category" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCategoryList />
            </ProtectedRoute>
          } />

          <Route path="category/:id/courses" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCategoryCourses />
            </ProtectedRoute>
          } />

          <Route path="courses/create" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCreate />
            </ProtectedRoute>
          } />

          {/* Багшийн хичээлийн удирдлага */}
          <Route path="courses/:id" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherPage />
            </ProtectedRoute>
          } />

          <Route path="courses/:id/edit" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherSubjectEdit />
            </ProtectedRoute>
          } />

          <Route path="school-info" element={
            <ProtectedRoute roles={['teacher']}>
              <SchoolInfo />
            </ProtectedRoute>
          } />
        </Route>

        {/* --- АДМИНЫ ХЭСЭГ --- */}
        <Route path="sysAdmin">
          <Route path="dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="schools/:id" element={
            <ProtectedRoute roles={['admin']}>
              <SysAdminSchoolView />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="schoolAdmin">
          <Route path="dashboard" element={
            <ProtectedRoute roles={['schoolAdmin']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
}