import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout        from './components/Layout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Projects      from './pages/Projects';

import ResourceCalendar from './pages/ResourceCalendar';
import Timesheets from './pages/Timesheets';
import Tasks         from './pages/Tasks';
import Timeline      from './pages/Timeline';
import Team          from './pages/Team';
import Reports       from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index           element={<Dashboard />} />
          <Route path="projects" element={<Projects />}  />
          <Route path="tasks"    element={<Tasks />}     />
          <Route path="timeline" element={<Timeline />}  />
          <Route path="team"     element={<Team />}      />
          <Route path="resources" element={<ResourceCalendar />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="reports"  element={<Reports />}   />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
