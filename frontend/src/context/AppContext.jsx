import { createContext, useState,useEffect } from "react";
import { doctors } from "../assets/assets";
import axios from "axios"
import { toast } from "react-toastify";
export const AppContext=createContext();

export const AppContextProvider=(props)=>{
const [doctors,setDoctors]=useState([]);
const [token,setToken]=useState(localStorage.getItem('token')? localStorage.getItem('token') : '');
const [userData,setUserData]=useState(false);
const currencySymbol = "$";
const backendUrl=import.meta.env.VITE_BACKEND_URL

const getDoctorsData=async()=>{
    try{
        const {data}=await axios.get(backendUrl+'/api/doctor/list')
        if(data.success){
       setDoctors(data.doctors)
        }else{
            toast.error(data.message)
        }
    }catch(error){
   console.log(error);
   toast.error(error.message)
    }
}
const loadUserProfileData=async()=>{
    try{
    
const {data} = await axios.get(backendUrl+'/api/user/get-profile',{headers:{token}})
if(data.success){
        setUserData(data.userData)
}else{
    toast.error(data.message)
}
    }catch(error){
        console.log(error);
        toast.error(error.message)
    }
}
const value={
    doctors,getDoctorsData,
    currencySymbol,token,setToken,backendUrl,userData,setUserData,loadUserProfileData
}
useEffect(()=>{
    getDoctorsData();
    // Refresh doctor data every 30 seconds
    const refreshInterval = setInterval(getDoctorsData, 30000);
    return () => clearInterval(refreshInterval);
},[])

useEffect(()=>{
    if(token){
        loadUserProfileData()
    }else{
        setUserData(false)
    }
},[token])
return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
)
}
