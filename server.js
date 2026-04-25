require('dotenv').config()
const express= require('express')
const pool = require('./db')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const verifyToken=require('./middleware')
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3000
app.get('/jobs',verifyToken,async(req,res)=>{
    try{
        const result = await pool.query('SELECT * FROM jobs')
        res.json(result.rows)
    } catch(error){
        res.status(500).json({message: error.message})
    }
})

app.post('/jobs',verifyToken,async (req,res)=>{
    try{
        const {company,role,status,applied_date} = req.body
        const result = await pool.query(
            'INSERT INTO jobs(company,role,status,applied_date) VALUES($1,$2,$3,$4) RETURNING *',[company,role,status,applied_date]
        )
        res.status(201).json(result.rows[0])
    } catch(error){
        res.status(500).json({message:error.message})
    }
})

app.put('/jobs/:id',verifyToken,async(req,res)=>{
    try{
        const {id}=req.params
        const {status} = req.body
        const result = await pool.query(
            'UPDATE jobs SET status = $1 WHERE id=$2 RETURNING *',[status,id]
        )
        res.json(result.rows[0])
    } catch(error){
        res.status(500).json({message:error.message})
    }
})

app.delete('/jobs/:id',verifyToken,async(req,res)=>{
    try{
        const {id}=req.params
        const result = await pool.query(
            'DELETE FROM jobs WHERE id = $1',[id]
        )
        res.json({message:'Job deleted successfully'})
    } catch(error){
        res.status(500).json({message:error.message})
    }
})

app.post('/register',async(req,res)=>{
    try{
        const {username,email,password}=req.body
        if (!username || !email || !password) {  
            return res.status(400).json({ message: 'All fields are required' }) }
        const existingUser = await pool.query('SELECT * FROM users WHERE email=$1', [email])
        if (existingUser.rows.length==1){ 
            return res.status(409).json({message:'Already Exists'})
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const result=await pool.query('INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING *',[username,email,hashedPassword])
        res.status(201).json(result.rows[0])
    } catch(error){
        res.status(500).json({message:error.message})
    }
})

app.post('/login',async(req,res)=>{
    try{
        const {email,password} =req.body
        if (!email||!password){
            return res.status(400).json({message:'All fields are required'})
        }
        const existingUser=await pool.query('SELECT * FROM users WHERE email=$1',[email])
        if (existingUser.rows.length==0){
            return res.status(401).json({message:'Invalid Credentials'})
        }
        const isMatch=await bcrypt.compare(password,existingUser.rows[0].password)
        if(!isMatch){
            return res.status(401).json({message:'Invalid Credentials'})
        }
        const token=jwt.sign({id:existingUser.rows[0].id},process.env.JWT_SECRET,{expiresIn:'1d'})
        res.json({message:'Login Successfull',token:token})
    } catch(error){
        res.status(500).json({message:error.message})
    }
})
app.listen(PORT, ()=>{
    console.log(`Server is running ${PORT}`)
})