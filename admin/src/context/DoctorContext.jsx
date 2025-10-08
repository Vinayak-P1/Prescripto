import { createContext, useState } from "react";
import axios from 'axios'
import { toast } from "react-toastify";

export const DoctorContext=createContext();

export const DoctorContextProvider=(props)=>{

    const backendUrl=import.meta.env.VITE_BACKEND_URL
   const [dtoken,setDToken]=useState(localStorage.getItem('dtoken') ? localStorage.getItem('dtoken') :'')
  const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState([]);
  const [profileData, setProfileData] = useState(false);
   const getAppointments = async () => {
    try {
      console.log("Making request to get appointments with token:", dtoken);
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        {
          headers: { dtoken },
        }
      );
      console.log("Received response:", data);
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error.message);
    }
  };
  const completeAppointment = async (appointmentId) => {
    console.log("appointmentId:", appointmentId);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dtoken } }
      );
      console.log("data:", data);
      if (data.success) {
        console.log("data:", data);
        getAppointments();

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error);
    }
  };
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dtoken } }
      );
      if (data.success) {
        getAppointments();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error);
    }
  };
 const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dtoken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error);
    }
  };
 const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dtoken },
      });
      if (data.success) {
        setProfileData(data.profileData);
        console.log("data:", data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error);
    }
  };


const value={
    dtoken,
    setDToken,
    backendUrl,
    appointments,
    getAppointments,setAppointments, completeAppointment,
    cancelAppointment, dashData,setDashData,
    getDashData, profileData,
    setProfileData,
    getProfileData,



}
return (
    <DoctorContext.Provider value={value}>
        {props.children}
    </DoctorContext.Provider>
)
}
export default DoctorContextProvider