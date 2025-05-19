import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import CourseEditPage from '../pages/CourseEditPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Common/Layout';
import AccountPage from '../pages/AccountPage';
import ChangePassword from '../pages/ChangePassword';
import CreateCoursePage from '../pages/CreateCoursePage';
import LecturesPage from '../pages/LecturesPage';
import LectureCreatePage from '@/pages/LectureCreatePage';
import LectureDetailPage from '@/pages/LectureDetailPage';
import LectureEditPage from '@/pages/LectureEditPage';
import QuestionBank from '@/pages/QuestionBankPage';
import QuestionCreatePage from '@/pages/QuestionCreatePage';
import QuestionEditPage from '@/pages/QuestionEditPage';
import CourseLectures from '@/pages/CourseDetail/CourseLecture';
import CourseExams from '@/pages/CourseDetail/CourseExam';
import CourseTopics from '@/pages/CourseDetail/CourseTopic';
import CourseReviews from '@/pages/CourseDetail/CourseReview';
import ExamCreatePage from '@/pages/ExamCreatePage';
import NotPermission from '../pages/NotPermission';

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Homepage */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout>
            <HomePage />
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
        <ProtectedRoute>
          <Layout>
            <AccountPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/change-password"
      element={
        <ProtectedRoute>
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
        <ProtectedRoute>
          <Layout>
            <CoursesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="/courses/:id"
      element={
        <ProtectedRoute>
          <Layout>
            <CourseDetailPage />
          </Layout>
        </ProtectedRoute>
      }>
      <Route index element={<CourseLectures />} />

      <Route path="lectures" element={<CourseLectures />} />
      <Route path="exams" element={<CourseExams />} />
      <Route path="discussions" element={<CourseTopics />} />
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
        <ProtectedRoute>
          <Layout>
            <LecturesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lectures/:id"
      element={
        <ProtectedRoute>
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

    {/* Question Bank */}
    <Route
      path="/question-bank"
      element={
        <ProtectedRoute>
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

    {/* Exam */}
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
  </Routes>
);

export default AppRoutes;
