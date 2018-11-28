var mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema({
	username: String, //who create new campgrounds
	campgroundId: String, //redirect to campground's page
	isRead: { 
		type: Boolean, 
		default: false 
	}
});

module.exports = mongoose.model("Notification", notificationSchema);