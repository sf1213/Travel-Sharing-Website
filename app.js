var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    seedDB          = require("./seeds"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash")

//require routes
var campgroundRoutes = require("./routes/campground"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index")

//mongoose.connect("mongodb://localhost:27017/yelp_camp");
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"))
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

//Passport Configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUnitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ //apply to all
    res.locals.currentUser = req.user;
    
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    
    next();
})


app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server start!");
})