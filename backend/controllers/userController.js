import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
// API to register user
const registerUser=async(req,res)=>{
    try{
  const {name,email,password}=req.body
  if(!name || !email || !password){
    return res.json({success:false,message:'Please provide all fields'})
  }
  if(!validator.isEmail(email)){
     return res.json({success:false,message:'Please provide a valid email'})
  }
  if(password.length<8){
     return res.json({success:false,message:'Please enter a strong password'})
  }

// hashing user password
const salt=await bcrypt.genSalt(10)
const hashedPassword=await bcrypt.hash(password,salt)
 const userData={
    name,
    email,
    password:hashedPassword
 }
const newUser=new userModel(userData)
const user=await newUser.save()

const token= jwt.sign({id:user._id},process.env.JWT_SECRET)
res.json({success:true,token})
    }catch(error){
console.log(error);
res.json({success:false,message:error.message})
    }
}
//api for user login
const loginUser=async(req,res)=>{
try{
    const {email,password}=req.body
    const user=await userModel.findOne({email})
    if(!user){
        return res.json({success:false,message:'User not found'})
    }
    const isMatch= await bcrypt.compare(password,user.password)
    if(isMatch){
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.json({success:true,token})
    }else{
        return res.json({success:false,message:'Invalid credentials'})
    }
}catch(error){
    console.log(error);
res.json({success:false,message:error.message})
}
}
// api to get user profile data
const getProfile = async (req, res) => {
try{

    const userId = req.user.id;
    const userData=await userModel.findById(userId).select('-password')
    res.json({success:true,userData})
}catch(error){
    console.log(error);
    res.json({success:false,message:error.message})
}
}
//api to update profile
const updateProfile = async (req, res) => {
try{
const {name,phone,address,dob,gender}=req.body
const userId = req.user.id;
const imageFile=req.file
if(!name || !phone || !address || !dob || !gender){
    return res.json({success:false,message:'Data Missing'})
}
await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
    if(imageFile){
       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'});
      const imageURL=imageUpload.secure_url
      await userModel.findByIdAndUpdate(userId,{image:imageURL})
       
   }
res.json({success:true,message:'Profile updated'})
}catch(error){
    console.log(error);
    res.json({success:false,message:error.message})
}
}
const bookAppointment = async (req, res) => {
try{
    const {docId, slotDate, slotTime} = req.body
    const userId = req.user.id;
    const docData = await doctorModel.findById(docId).select('-password')
    if(!docData.available){
        return res.json({success:false,message:'Doctor not available'})
    }
    let slots_booked=docData.slots_booked 

// checking for slot availability
if(slots_booked[slotDate]){
    if(slots_booked[slotDate].includes(slotTime)){
return res.json({success:false,message:'Slot not available'})
    }else{
        slots_booked[slotDate].push(slotTime)
    }
}else{
    slots_booked[slotDate]=[]
    slots_booked[slotDate].push(slotTime)
}
const userData=await userModel.findById(userId).select('-password')

delete docData.slots_booked

  const formattedDate = new Date(slotDate.replace(/_/g, '-'));
const appointmentData={
    userId,
    docId,
    userData,
    docData,
    amount:docData.fees,
    slotTime,
    slotDate:formattedDate,
    date:Date.now()
}
const newAppointment = new appointmentModel(appointmentData)
await newAppointment.save()

//  save new slots data to doctors data
await doctorModel.findByIdAndUpdate(docId,{slots_booked})
res.json({success:true,message:'Appointment booked'})

}catch(error){
    console.log(error);
    res.json({success:false,message:error.message})
}
}
// api to get appointments from user
const listAppointments = async (req, res) => {
try {
    const userId = req.user.id;
    // Fetch appointments and populate userData
    const appointments = await appointmentModel.find({userId});
    
    // Add user data to each appointment
    const userInfo = await userModel.findById(userId).select('-password');
    
    // Map appointments to include userData
    const appointmentsWithUserData = appointments.map(appointment => {
        return {
            ...appointment.toObject(),
            userData: userInfo
        };
    });
    
    res.json({success: true, appointments: appointmentsWithUserData})
}catch(error){
    console.log(error);
    res.json({success:false,message:error.message})
}
}
// api to cancel appointment 
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!req.user) {
      return res.json({ success: false, message: "Please login first" });
    }

    const userId = req.user.id; // Using id from auth middleware
    
    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Convert both to string for comparison since MongoDB ObjectIds are objects
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    
    console.log("Appointment Data:", { docId, slotDate, slotTime });
    
    const doctorData = await doctorModel.findById(docId);
    
    if (!doctorData) {
        return res.json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = doctorData.slots_booked || {};
    
    // Convert the Date object back to the format used in slots_booked (day_month_year)
    const formattedSlotDate = `${slotDate.getDate()}_${slotDate.getMonth() + 1}_${slotDate.getFullYear()}`;
    
    // Check if the slot exists before trying to filter it
    if (slots_booked[formattedSlotDate] && Array.isArray(slots_booked[formattedSlotDate])) {
        slots_booked[formattedSlotDate] = slots_booked[formattedSlotDate].filter(
            (e) => e !== slotTime
        );
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance=new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

// API to make payment using RazorPay
const paymentRazorpay = async(req,res)=>{


    try{
 const { appointmentId } = req.body;
  const appointmentData=await appointmentModel.findById(appointmentId)
if(!appointmentData || appointmentData.cancelled){
    return res.json({success:false,message:'Appointment Cancelled or not found'})

}
// creating options for razorpay amount
const options={
    amount:appointmentData.amount*100,
    currency:process.env.CURRENCY,
    receipt:appointmentId,
}
// creation of an order
const order=await razorpayInstance.orders.create(options)

res.json({success:true,order})
    }catch(error){
        console.log("error:", error);
    res.json({ success: false, message: error.message });
    }
 
}
// api to verify razorpay payment
const verifyRazorpay=async(req,res)=>{
    try{
   
   const {razorpay_order_id}=req.body
   const  orderInfo=await razorpayInstance.orders.fetch(razorpay_order_id)


   if(orderInfo.status==="paid"){
   await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
   res.json({success:true,message:'Payment Successful'})
   }else{
     res.json({success:false,message:'Payment Failed'})
   }

    }catch(error){
console.log("error:", error);
    res.json({ success: false, message: error.message });
    }
}
export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointment,paymentRazorpay,verifyRazorpay}