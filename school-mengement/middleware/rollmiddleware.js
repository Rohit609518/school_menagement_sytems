const rolmiddleware = (...allowedRoles) =>{
    return (req,res,next) =>{

        if(!req.user){
            return res.status(401).json({
                message:"not authrize"
            });
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                   message: "Access denied. You don't have permission."
            })
        };

        next();
    }
}

module.exports = rolmiddleware ;