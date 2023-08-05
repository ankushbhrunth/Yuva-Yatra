if(process.env.NODE_ENV !=='production'){
    require('dotenv').config();
}


const express=require('express');
const app= express();
const path =require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const ExpressError=require('./utils/ExpressError')
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const localStrategy=require('passport-local')
const User=require('./models/user')
const userRoutes=require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');

mongoose.connect('mongodb://localhost:27017/Yuva-Yatra');
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected")
})

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))


app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());

const sessionConfig={
    name:'session',
    secret:'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,          //while deploying uncomment 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.get('/fakeUser',async(req,res)=>{
    const user = new User({email:'hbjh@gmail.com',username:'Ankush'});
    const newUser= await User.register(user,'chicken');
    res.send(newUser);
})

app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes);


app.get('/',(req,res)=>{
    res.render('home.ejs')
}); 

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found ',404))
})

app.use((err,req,res,next)=>{
    const{statusCode=500}=err;
    if(!err.message)err.message="oh no !something went wrong!!"
    res.status(statusCode).render('error.ejs',{err});
})
app.listen(3000,()=>{
    console.log('Serving on port 3000')
})
