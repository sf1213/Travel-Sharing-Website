require('dotenv').config();

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
    flash           = require("connect-flash");
    


//require routes
var campgroundRoutes = require("./routes/campground"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index");


var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url);
//mongoose.connect("mongodb://songfang:121391ylf@ds033317.mlab.com:33317/yelpcamp");
//mongoose.connect("mongodb://localhost:27017/yelp_camp");
//mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });




app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
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





// ---------------------------------
// ---chat-------------------------
// --------------------------------
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);


app.get("/chatroom", function(req, res){
    res.render("chatroom");
})

var users = [];
var connections = [];

io.on("connection", function (socket) {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);
  
  
  //Disconnect
  socket.on("disconnect", function(data){
    // if(!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    
    connections.splice(connections.indexOf(socket),1);
    console.log("Disconnected : %s sockets connect", connections.length);
  });
  
  
  //send nessage
  socket.on("send message", function(data){

    io.sockets.emit("new message", {msg : data, user : socket.username});
  })
  
  //new user
  socket.on("new user", function(data, callback) {
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUsernames();
  })
  
  //update usernames
  function updateUsernames(){
    io.sockets.emit("get users", users);
  }
  
});


server.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server start!");
})