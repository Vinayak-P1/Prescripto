import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'



// app config
const app=express()
const port = process.env.PORT || 4000
connectDB()

//middlewares
app.use(cors())
app.use(express.json())

// api endpoint 
app.get('/',(req,res)=>{
  res.send('API is working')
})
app.listen(port, () => console.log('Server started',port))