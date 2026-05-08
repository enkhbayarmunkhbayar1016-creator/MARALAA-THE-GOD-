import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./Home";
import Example from "./Example";

// Pages
import CoursePage from "./pages/Student/studentSubject"; 
import TeacherCreate from "./pages/Teacher/teacherCreate";
import TeacherPage from "./pages/Teacher/teacherSubject";
import TeacherSubjectEdit from "./pages/Teacher/teacherSubjectEdit"; // Энэ компонентыг сонгов
import SystemAdminDashboard from "./pages/Admin/sysAdmin";
import SchoolAdminDashboard from "./pages/Admin/schoolAdmin";
import SchoolInfo from "./pages/Teacher/teacherSchoolInfo";
import EditSchoolInfo from "./pages/Teacher/teacherSchoolEdit";
import StudentSchool from "./pages/Student/studentSchoolInfo";
import StudentSchoolList from "./pages/Student/studentSchoolList";
import SysAdminSchoolView from "./pages/Admin/sysAdminSchoolView";
import Report from "./pages/Report"; 
import CourseReport from "./pages/CourseReport";

const Index = () => {
  return (
    <Routes>
      <Route path="/*" element={<Layout />}>

        {/* HOME */}
        <Route index element={<Home />} />

      {/* ✅ REPORT (ЭНЭ Л ЧУХАЛ) */}  
        <Route path="report" element={<Report />} />
        <Route path="course-report" element={<CourseReport />} />
        <Route path="example" element={<Example />} />

        {/* --- БАГШИЙН ХЭСЭГ --- */}
        <Route path="teacher/courses" element={<TeacherCourseList />} />
        <Route path="teacher/courses/create" element={<TeacherCreate />} />
        
        {/* :id гэж нэрлэснээр useParams().id ажиллана */}
        <Route path="teacher/courses/:id" element={<TeacherPage />} />
        <Route path="teacher/courses/:id/edit" element={<TeacherSubjectEdit />} />
        
        <Route path="school/:school_id" element={<SchoolInfo/>} />
        <Route path="school/:school_id/edit" element={<EditSchoolInfo/>} />

        {/* --- ОЮУТНЫ ХЭСЭГ --- */}
        <Route path="courses/:id" element={<CoursePage />} /> 
        
        {/* Оюутан сургуулийн мэдээлэл харах */}
        <Route path="student/schools" element={<StudentSchoolList />} />
        <Route path="student/school/:id" element={<StudentSchool/>} />

        {/* --- АДМИН ХЭСЭГ --- */}
        <Route path="sysAdmin" element={<SystemAdminDashboard />} />
        <Route path="sysAdmin/schools/:id" element={<SysAdminSchoolView />} />

      </Route>
    </Routes>
  );
};

export default Index;