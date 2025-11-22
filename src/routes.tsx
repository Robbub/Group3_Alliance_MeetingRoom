import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as Views from "./views/containers";
import { PATHS } from "./constant";
import ProtectedRoute from "./ProtectedRoute";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={PATHS.HOMEPAGE.path} element={<Views.Homepage />} />
        <Route path={PATHS.LOGIN.path} element={<Views.Login />} />
        <Route path={PATHS.REGISTER.path} element={<Views.Register />} />
        <Route path={PATHS.ABOUT_US.path} element={<Views.AboutUs />} />
        <Route path={PATHS.NOT_FOUND.path} element={<Views.NotFound />} />

        {/* Protected Routes */}
        <Route
          path={PATHS.UPCOMING.path}
          element={
            <ProtectedRoute>
              <Views.Upcoming />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PAST.path}
          element={
            <ProtectedRoute>
              <Views.Past />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BROWSE.path}
          element={
            <ProtectedRoute>
              <Views.Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.DASHBOARD.path}
          element={
            <ProtectedRoute>
              <Views.AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ROOM_MANAGEMENT.path}
          element={
            <ProtectedRoute>
              <Views.RoomManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BOOKING_REQUESTS.path}
          element={
            <ProtectedRoute>
              <Views.BookingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.RECURRING_MEETINGS.path}
          element={
            <ProtectedRoute>
              <Views.RecurringMeetings />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BOOKING_MANAGEMENT.path}
          element={
            <ProtectedRoute>
              <Views.BookingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.SETTINGS.path}
          element={
            <ProtectedRoute>
              <Views.Settings />
            </ProtectedRoute>
          }
        >
          <Route path="account" element={<Views.AccountSettings />} />
          <Route path="security" element={<Views.SecuritySettings />} />
          <Route path="notifications" element={<Views.NotificationSettings />} />
          <Route path="appearance" element={<Views.AppearanceSettings />} />
        </Route>
        <Route
          path={PATHS.ANALYTICS.path}
          element={
            <ProtectedRoute>
              <Views.Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.USER_MANAGEMENT.path}
          element={
            <ProtectedRoute>
              <Views.UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
