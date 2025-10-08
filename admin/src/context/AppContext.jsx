import { createContext,  } from "react";
import { AdminContextProvider } from "./AdminContext";


export const AppContext=createContext();

export const AppContextProvider=(props)=>{

    const currency='$'

const calculateAge=(dob)=>{
    const today = new Date()
    const birthDate = new Date(dob)
    let age=today.getFullYear()-birthDate.getFullYear()
    return age
}
const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

const slotDateFormat = (slotDate) => {
  if (!slotDate) return "";

  const dateObj = new Date(slotDate); // parse ISO string
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth() + 1]; // months array is 1-indexed
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
};

const value={
calculateAge,slotDateFormat
}
return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
)
}
export default AppContextProvider