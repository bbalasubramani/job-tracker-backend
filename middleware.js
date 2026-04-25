const jwt = require('jsonwebtoken')

const verifyToken =(req,res,next)=>{
    const authHeader=req.headers['authorization']
    const token=authHeader && authHeader.split(' ')[1]
    if(!token){
        return res.status(401).json({message:'Unauthorized Access'})
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if (err){
            return res.status(403).json({message:'Invalid or expired token'})
        }
        if(decoded){
            req.user=decoded
            next()
        }
    })
}

module.exports=verifyToken