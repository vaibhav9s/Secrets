require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose =  require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

main().catch(err=> console.log(err));
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

    const userSchema = new mongoose.Schema({
        email: String,
        password: String    
    });

    const User = mongoose.model("User", userSchema);

    app.get("/", function(req, res){
        res.render("home");
    });
    
    app.get("/login", function(req, res){
        res.render("login");
    });
    
    app.get("/register", function(req, res){
        res.render("register");
    });

    app.post("/register", async(req, res)=> {

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const newUser = new User ({
                email: req.body.username,
                password: hash
            });
            
            if(err){
                console.log(err)
            }else{
                newUser.save();
                res.render("secrets");
            }
        });
    });

    app.post("/login", async(req, res)=> {
        const username = req.body.username;
        const password = req.body.password;

        try {
            const foundUser = await User.findOne({email: username});
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result === true){
                    res.render("secrets");
                }
            });
        } catch (err) {
            console.log(err);
        }
    });
}


app.listen(3000, function(){
    console.log("Server started in port 3000.");
});