require('dotenv').config()
const express= require('express')
const pool = require('./db')
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3000
app.get('/jobs',async(req,res)=>{
    try{
        const result = await pool.query('SELECT * FROM jobs')
        res.json(result.rows)
    } catch(error){
        res.status(500).json({message: error.message})
    }
})

app.post('/jobs',async (req,res)=>{
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

app.put('/jobs/:id',async(req,res)=>{
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

app.delete('/jobs/:id',async(req,res)=>{
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
app.listen(PORT, ()=>{
    console.log(`Server is running ${PORT}`)
})