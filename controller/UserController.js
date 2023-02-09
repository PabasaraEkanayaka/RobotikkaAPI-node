const nodemailer = require("nodemailer");
const UserSchema= require('../model/User');
const bcrypt = require('bcrypt');
const {hash} = require("bcrypt");
const jwt = require('jsonwebtoken');

const registerUser= (req,resp)=>{
    UserSchema.findOne({email:req.body.email}).then(result=>{
        if (result===null){
            bcrypt.hash(req.body.password, 10, function(err, hash) {

                const user = new UserSchema({
                    fullName:req.body.fullName,
                    email:req.body.email,
                    password:hash
                });
                user.save().then(async result=>{
                    let token = jwt.sign({ email: result.email,fullName:result.fullName }, process.env.PRIVATE_KEY);
                    let responseObject={
                        message:'user created',
                        email:result.email,
                        token:'token'
                    }

                    let transporter = nodemailer.createTransport({
                        host: "smtp.ethereal.email",
                        port: 587,
                        secure: false,
                        auth: {
                            user: process.env.SENDER_EMAIL,
                            pass: process.env.EMAIL_APP_KEY
                        }
                    });

                    await transporter.sendMail({
                        from: '"Fred Foo 👻" <education.testlearn@gmail.com>', // sender address
                        to: req.body.email, // list of receivers
                        subject: "Hello ✔", // Subject line
                        text: "Registration Completed", // plain text body
                        html: "<b>Registration Completed!</b>", // html body
                    });

                    resp.status(201).json(responseObject);
                }).catch(error=>{
                    resp.status(500).json(error);
                });
            });
        }else{
            resp.status(404).json({'message':'already exists!'});
        }

    }).catch(error=>{
        resp.status(500).json(error);
    })
}
module.exports={registerUser}