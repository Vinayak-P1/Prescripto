import React, { useContext } from 'react'
import Login from './pages/Login'
 import { ToastContainer, toast } from 'react-toastify';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route,Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
const App = () => {
  const {atoken} = useContext(AdminContext)
  const {dtoken} = useContext(DoctorContext)

  // Show login if no tokens present
  if (!atoken && !dtoken) {
    return (
      <>
        <Login/>
        <ToastContainer />
      </>
    )
  }

  // Determine which dashboard to show based on token
  const isAdmin = Boolean(atoken);
  const isDoctor = Boolean(dtoken);
  
  return (
    <div className='bg-[#F8F9FD]'>
         <ToastContainer />
         <Navbar/>
         <div className='flex items-start'>
 <Sidebar/>
      <Routes>
        {isAdmin ? (
          // Admin Routes
          <>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/admin-dashboard" element={<Dashboard/>} />
            <Route path="/all-appointments" element={<AllAppointments/>} />
            <Route path="/add-doctor" element={<AddDoctor/>} />
            <Route path="/doctor-list" element={<DoctorsList/>} />
            <Route path="*" element={<Dashboard/>} />
          </>
        ) : isDoctor ? (
          // Doctor Routes
          <>
            <Route path="/" element={<DoctorDashboard/>} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
            <Route path="/doctor-appointments" element={<DoctorAppointments/>} />
            <Route path="/doctor-profile" element={<DoctorProfile/>} />
            <Route path="*" element={<DoctorDashboard/>} />
          </>
        ) : (
          // Fallback to login
          <Route path="*" element={<Login/>} />
        )}
      </Routes>
         </div>
    </div>
  );
}

export default App
