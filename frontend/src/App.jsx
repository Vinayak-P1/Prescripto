import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Doctor from "./pages/Doctors";
import Appointment from "./pages/Appointment";
import Footer from './components/Footer';
  import { ToastContainer, toast } from 'react-toastify';
function App() {
  return (
    <div className='mx-4 sm:mx-[10%]'>
       <ToastContainer />
      <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/login' element={<Login />} />
      <Route path='/my-profile' element={<MyProfile />} />
      <Route path='/my-appointments' element={<MyAppointments />} />
      <Route path='/doctors' element={<Doctor />} />
       <Route path='/doctors/:speciality' element={<Doctor />} />
       <Route path='/appointments/:docId' element={<Appointment />} />
    </Routes>
    <Footer/>
    </div>
  )
}

export default App
