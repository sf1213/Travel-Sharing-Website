var express = require("express");
var router = express.Router();
var Campground = require("../models/campground")
var middleware = require("../middleware") //automatically require index.js

//Index: show all campgrounds
router.get("/", function(req,res){
    //Get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds : allCampgrounds})
        }
    });
})

//Create: add new camground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id : req.user._id,
        username: req.user.username
    }
    var newCampgruond = {name : name, price : price, image : image, description : desc, author : author};
    //Create a new campground and save to DB
    Campground.create(newCampgruond, function(err, newlyCreated){
        if(err) {
            console.log(err);
        }else{
               //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
})


//New : show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new")
})


//Show : shows more info about one campground
router.get("/:id", function(req, res) {
    //find campground woth provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
        if(err) {
            console.log(err);
        }else {
            //console.log(foundCamp);
            res.render("campgrounds/show", {campground : foundCamp});
        }
    });

    //render show template with that ground
    //res.render("show");
});


//Edit Campground Route
router.get("/:id/edit", middleware.checkCampOwnership, function(req, res) {
    //is user logged in?
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
        });
})


//Update Campground Route
router.put("/:id", middleware.checkCampOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
    //redirect to show page
})


//Destroy Rounte
router.delete("/:id", middleware.checkCampOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
})



//middleware


//check ownership


module.exports = router;