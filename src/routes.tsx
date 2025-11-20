import { BrowserRouter, Route, Routes } from "react-router";
import * as Views from "./views/containers";
import { PATHS } from "./constant";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={PATHS.MAINSCREEN.path} element={<Views.MainScreen />} />
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
              <Views.Dashboard />
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
      </Routes>
    </BrowserRouter>
  );
};
