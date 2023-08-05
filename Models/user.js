const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});



//this gives us the unique username and adds a passord and user name in schema 
UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',UserSchema)