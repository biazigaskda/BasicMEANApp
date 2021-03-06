let express     = require('express'),
    router      = express.Router()
    User        = require("../models/user"),
    passport    = require("passport"),
    jwt         = require("jsonwebtoken"),
    config      = require("../config/db");


//register
router.post('/register', (req,res, next) =>{
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if (err){
            res.json({success: false, msg:"Couldn't register user"});
        } else {
            res.json({success: true, msg:"Registered new user"});
        }
    });
});

//Auth
router.post("/authenticate", (req, res, next) =>{
    let username = req.body.username;
    let password = req.body.password;

    User.getUserByUsername(username, (err, user)=>{
        if (err){
            throw err;
        }
        if (!user){
            return res.json({success: false, msg: "User not found"});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err){
                throw err;
            }
            if (isMatch){
                let token = jwt.sign(user.toJSON(), config.secret,{
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: `JWT ${token}`,
                    user: {
                        id :user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else {
                return res.json({success: false, msg: "Wrong password"});
            }
        });
    });
}); 

//Profile
router.get("/profile", passport.authenticate('jwt', {session: false}), (req,res, next)=>{
    res.json({user: req.user});
});


module.exports = router;