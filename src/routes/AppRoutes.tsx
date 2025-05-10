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
    <Route
      path="/courses/:id"
      element={
        <ProtectedRoute>
          <Layout>
            <CourseDetailPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:id/edit"
      element={
        <ProtectedRoute>
          <Layout>
            <CourseEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/new"
      element={
        <ProtectedRoute>
          <Layout>
            <CourseEditPage />
          </Layout>
        </ProtectedRoute>
      }
    />

  </Routes>
);

export default AppRoutes;
