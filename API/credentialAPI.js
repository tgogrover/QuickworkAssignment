//requiring all pakages
const express=require('express');
const router=express.Router();
const passport=require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const session = require('cookie-session')

 //
passport.serializeUser((user, done)=>{
    
    done(null, user);
  });
  
passport.deserializeUser((user, done)=>{
  
    //Instead of user this function usually recives the id 
    //then we use the id to select the user from the database and pass the user obj to the done callback
    // we can later access this data in any routes in: req.user
  
  
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `http://localhost:${process.env.PORT}/api/google/`,
  },
  (request, accessToken, refreshToken, profile, done)=>{
    
    // use the profile info (mainly profile id) to check if the user is registerd in our database
    // If yes select the user and pass him to the done callback
    // If not create the user and then select him/her and pass to callback
    return done(null, profile);
}
));

//req.body's express middleware(to get data in req.body. same work as body-parser )
router.use(express.urlencoded({ extended: false }))
router.use(express.json())

//making cookie-session
router.use(session({
  name: 'quickwork-session',
  keys: ['key1', 'key2']
}))

//middleware for auhorized user(checking if logined user is authorized (or) not as req.user is given after authentication only)
const LoginUser = (req, res, next) => {
  if (req.user) {
      next();
  } else {
    //if not authorized user then give response with statusCode=401 
      res.sendStatus(401);
  }
}

// Initializes passport and passport sessions
router.use(passport.initialize());
router.use(passport.session());


//making scratch folder for local-storage
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


//routes for failed login(if there is issue) and logout success
router.get('/logoutSuccess', (req, res) => res.send('Logout Succesfull'))
router.get('/failedLogin', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the authorized user is logged in user can acess his/her this route giving
//his/her gmail and name
router.get('/authorizedUser', LoginUser, (req, res) => res.send(`Name=${req.user.displayName}, Email=${req.user.email}`))

// Authentication  Routes
router.get('/google/auth', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/api/google/', passport.authenticate('google', { failureRedirect: '/failedLogin' }),
(req, res)=>{
  //storing logined user email and his/her name in scratch folder
  localStorage.setItem('loginEmail',req.user.email)
  localStorage.setItem('loginName',  req.user.displayName)
  // Successful authentication, redirect /authorizedUser
  res.redirect('/authorizedUser');
}
);

//logout route 
router.get('/logout', (req, res) => {
  //deleting sessions
  req.session = null;
  req.logout();
  res.redirect('/logoutSuccess');
  //removing logined user email and his/her name in scratch folder
  localStorage.removeItem('loginEmail')
  localStorage.removeItem('loginName')
})






module.exports=router