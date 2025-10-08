import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
const {atoken, setAToken} = useContext(AdminContext)
const {dtoken, setDToken} = useContext(DoctorContext)
const navigate = useNavigate()

const logout = () => {
    if (atoken) {
        setAToken('');
        localStorage.removeItem('atoken');
    }
    if (dtoken) {
        setDToken('');
        localStorage.removeItem('dtoken');
    }
    navigate('/');
}


  return (
   <div className="flex sticky top-0 z-10 justify-between items-center px-4 py-2 sm:px-10 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img
          className="w-96 sm:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-600 text-gray-600">
          {atoken ? "Admin" : dtoken ? "Doctor" : "Login"}
        </p>
      </div>
      <button onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>

  )
}

export default Navbar
