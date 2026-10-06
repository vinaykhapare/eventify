import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// auth
import Login from "./screens/Auth/Login";
import Signup from "./screens/Auth/Signup";
import Landing from "./screens/Landing";
// admin
import AdminDashboard from "./screens/admin/AdminDashboard";
import AdminAnalytics from "./screens/admin/AdminAnalytics";
import CreateVolunteer from "./screens/admin/CreateVolunteer";
import CreateEvent from "./screens/admin/CreateEvent";
import AssignVolunteer from "./screens/admin/AssignVolunteer";
import Participants from "./screens/admin/Participants";
import Volunteers from "./screens/admin/Volunteers";

// participant / shared
import EventListings from "./screens/participant/EventListings";
import MyTicket from "./screens/participant/MyTickets";
import EventDetails from "./screens/participant/EventDetails";

// volunteer
import AssignedEvents from "./screens/volunteer/AssignedEvents";
import QrScanner from "./screens/volunteer/QrScanner";

// new production SaaS modules
import Profile from "./screens/profile/Profile";
import AdminProfile from "./screens/profile/AdminProfile";
import Messages from "./screens/messages/Messages";
import Settings from "./screens/settings/Settings";

import PageNotFound from "./screens/PageNotFound";
import Unauthorized from "./screens/Unauthorized";
import GuestRoute from "./components/auth/GuestRoute";
import RootRedirect from "./components/auth/RootRedirect";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm font-medium",
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#1E293B",
            color: "#F8FAFC",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Public Guest Routes */}
        <Route path="/landing" element={<Landing />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* SHARED AUTHENTICATED ROUTES (All Roles) */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STUDENT", "VOLUNTEER"]} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/events" element={<EventListings />} />
          <Route path="/events/:id" element={<EventDetails />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/create-event" element={<CreateEvent />} />
          <Route path="/admin/create-volunteer" element={<CreateVolunteer />} />
          <Route path="/admin/assign-volunteer" element={<AssignVolunteer />} />
          <Route path="/admin/participants" element={<Participants />} />
          <Route path="/attendees" element={<Participants />} />
          <Route path="/admin/volunteers" element={<Volunteers />} />
        </Route>

        {/* PARTICIPANT ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]} />}>
          <Route path="/my-ticket" element={<MyTicket />} />
        </Route>

        {/* VOLUNTEER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["VOLUNTEER"]} />}>
          <Route path="/assigned-events" element={<AssignedEvents />} />
          <Route path="/scan/:eventId" element={<QrScanner />} />
        </Route>

        {/* System Error & Fallback Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default App;
