var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user")

var Notification = require("../models/notification");
var { isLoggedIn } = require('../middleware');

//root route
router.get("/", function(req,res){
    res.render("landing");
})



//================
//Authetication
//================

//show register page
router.get("/register", function(req, res){
    res.render("register");
})

//handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            // console.log(err);
            req.flash("error", err.message);
            return res.render("register")
        }
        //log in
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp! " + user.username);
            res.redirect("/campgrounds");
        })
    })
})


//show login form
router.get("/login", function(req, res) {
    res.render("login");
})

//handle login logic + login
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res) {
    
})


//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!")
    res.redirect("/campgrounds");
})


//================
//User
//================

//user profile
router.get("/users/:id", async function(req, res) {
    try {
        let user = await User.findById(req.params.id).populate("followers").exec();
        res.render("profile" , { user });
    }catch(err) {
        req.flash("err", err.message);
        return res.redirect("back");
    }
})

// follow user
router.get('/follow/:id', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);//the user to be followed
    user.followers.push(req.user._id); //the user who wants to follow
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } } //new in the front
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});


module.exports = router;