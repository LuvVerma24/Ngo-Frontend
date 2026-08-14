import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import VolunteerDashboard from './VolunteerDashboard';
import ManagerDashboard from './ManagerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;