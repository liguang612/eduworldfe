import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from '../pages/Homepage/HomePage';
import CoursesPage from '../pages/Course/CoursesPage';
import CourseDetailPage from '../pages/Course/CourseDetailPage';
import CourseEditPage from '../pages/Course/CourseEditPage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Common/Layout';
import AccountPage from '@/pages/Auth/AccountPage';
import ChangePassword from '@/pages/Auth/ChangePassword';
import CreateCoursePage from '@/pages/Course/CourseCreatePage';
import LecturesPage from '@/pages/Lecture/LecturesPage';
import LectureCreatePage from '@/pages/Lecture/LectureCreatePage';
import LectureDetailPage from '@/pages/Lecture/LectureDetailPage';
import LectureEditPage from '@/pages/Lecture/LectureEditPage';
import QuestionBank from '@/pages/Question/QuestionBankPage';
import QuestionCreatePage from '@/pages/Question/QuestionCreatePage';
import QuestionEditPage from '@/pages/Question/QuestionEditPage';
import CourseLectures from '@/pages/Course/CourseDetail/CourseLecture';
import CourseExams from '@/pages/Course/CourseDetail/CourseExam';
import CourseTopics from '@/pages/Course/CourseDetail/CourseTopic';
import CourseReviews from '@/pages/Course/CourseDetail/CourseReview';
import NotPermission from '../pages/NotPermission';
import DoExamPage from '@/pages/Attempt/DoExamPage';
import DoEndQuestion from '@/pages/Lecture/DoEndQuestion';
import ExamCreatePage from '@/pages/Exam/ExamCreatePage';
import ExamEditPage from '@/pages/Exam/ExamEditPage';
import SolutionCreatePage from '@/pages/Question/SolutionCreatePage';
import SolutionPage from '@/pages/Question/SolutionPage';
import ExamInstructionsPage from '@/pages/Exam/ExamInstructions';
import AttemptListPage from '@/pages/Attempt/AttemptListPage';
import AttemptCongratulationPage from '@/pages/Attempt/AttemptCongratulationPage';
import AttemptDetailPage from '@/pages/Attempt/AttemptDetailPage';
import ExamPages from '@/pages/Exam/ExamPages';
import ExamResultsPage from '@/pages/Exam/ExamResultsPage';
import FavouritePage from '@/pages/Favourite/FavouritePage';
import SearchResultsPage from '@/pages/Homepage/SearchPage';
import AdminLayout from '@/pages/Admin/AdminLayout';
import DashboardPage from '@/pages/Admin/DashboardPage';
import UserManagementPage from '@/pages/Admin/UserManagementPage';
import CourseManagementPage from '@/pages/Admin/CourseManagementPage';
import LectureManagementPage from '@/pages/Admin/LectureManagementPage';
import ExamManagementPage from '@/pages/Admin/ExamManagementPage';
import StorageUsagePage from '@/pages/Admin/StorageUsagePage';

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Homepage */}
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <HomePage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/search"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <SearchResultsPage initialQuery={useLocation().state?.initialQuery || ''} />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Not Permission Page */}
    <Route path="/not-permission" element={
      <Layout>
        <NotPermission />
      </Layout>
    } />

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/account"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <AccountPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/change-password"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <ChangePassword />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Courses */}
    <Route
      path="/courses"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <CoursesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="/courses/:id"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <CourseDetailPage />
          </Layout>
        </ProtectedRoute>
      }>
      <Route index element={<CourseLectures />} />

      <Route path="lectures" element={<CourseLectures />} />
      <Route path="exams" element={<CourseExams />} />
      <Route path="topics" element={<CourseTopics />} />
      <Route path="reviews" element={<CourseReviews />} />
    </Route>
    <Route
      path="/courses/:id/edit"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <CourseEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/new"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <CreateCoursePage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Lectures */}
    <Route
      path="/lectures"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <LecturesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lectures/:id"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <LectureDetailPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lectures/create"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <LectureCreatePage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lectures/:id/edit"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <LectureEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lectures/:id/end-questions"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <DoEndQuestion />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Question Bank */}
    <Route
      path="/question-bank"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <QuestionBank />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/question-bank/new"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <QuestionCreatePage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/question-bank/:id/edit"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <QuestionEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    {/* Question Solutions */}
    <Route
      path="/question-bank/:questionId/solutions"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <SolutionPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/question-bank/:questionId/solutions/create"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <SolutionCreatePage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Exam */}
    <Route
      path="/exams"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <ExamPages />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:courseId/exams/create"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <ExamCreatePage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:courseId/exams/:examId/edit"
      element={
        <ProtectedRoute allowedRoles={[1]}>
          <Layout>
            <ExamEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:courseId/exams/:examId/instructions"
      element={
        <ProtectedRoute allowedRoles={[0]}>
          <Layout>
            <ExamInstructionsPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:courseId/exams/:examId/do"
      element={
        <ProtectedRoute allowedRoles={[0]}>
          <Layout>
            <DoExamPage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Attempt List */}
    <Route
      path="/attempts"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <AttemptListPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/attempts/:attemptId/congratulation"
      element={
        <ProtectedRoute allowedRoles={[0]}>
          <Layout>
            <AttemptCongratulationPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/attempt/:id"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <AttemptDetailPage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Exam Results */}
    <Route
      path="/courses/:courseId/exams/:examId/results"
      element={
        <ProtectedRoute allowedRoles={[0, 1]}>
          <Layout>
            <ExamResultsPage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={[100]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="users" element={<UserManagementPage />} />
      <Route path="courses" element={<CourseManagementPage />} />
      <Route path="lectures" element={<LectureManagementPage />} />
      <Route path="exams" element={<ExamManagementPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="storage" element={<StorageUsagePage />} />
    </Route>

    {/* Favorite */}
    <Route
      path="/favourite"
      element={
        <ProtectedRoute allowedRoles={[0]}>
          <Layout>
            <FavouritePage />
          </Layout>
        </ProtectedRoute>
      }
    />

  </Routes>
);

export default AppRoutes;
