import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/auth-layout'
import { UserLayout } from '@/layouts/user-layout'
import { AdminLayout } from '@/layouts/admin-layout'
import { GuestRoute } from './guest-route'
import { ProtectedRoute } from './protected-route'
import { RootRedirect } from './root-redirect'

import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { VerifyOtpPage } from '@/pages/auth/verify-otp-page'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page'

import { UserDashboardPage } from '@/pages/user/dashboard-page'
import { UserTasksListPage } from '@/pages/user/tasks-list-page'
import { UserTaskNewPage } from '@/pages/user/task-new-page'
import { UserTaskDetailPage } from '@/pages/user/task-detail-page'
import { NotificationsPage } from '@/pages/user/notifications-page'
import { ProfilePage } from '@/pages/user/profile-page'

import { AdminDashboardPage } from '@/pages/admin/dashboard-page'
import { AdminUsersListPage } from '@/pages/admin/users-list-page'
import { AdminUserDetailPage } from '@/pages/admin/user-detail-page'
import { AdminTasksListPage } from '@/pages/admin/tasks-list-page'
import { AdminTaskNewPage } from '@/pages/admin/task-new-page'
import { AdminSettingsPage } from '@/pages/admin/settings-page'

import { NotFoundPage } from '@/pages/not-found-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboardPage />} />
            <Route path="/user/tasks" element={<UserTasksListPage />} />
            <Route path="/user/tasks/new" element={<UserTaskNewPage />} />
            <Route path="/user/tasks/:id" element={<UserTaskDetailPage />} />
            <Route path="/user/notifications" element={<NotificationsPage />} />
            <Route path="/user/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersListPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/tasks" element={<AdminTasksListPage />} />
            <Route path="/admin/tasks/new" element={<AdminTaskNewPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
