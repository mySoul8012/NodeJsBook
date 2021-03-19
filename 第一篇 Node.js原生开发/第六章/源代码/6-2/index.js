const mongoose = require("mongoose");
var lastMod = require('./lastMod');
mongoose.connect("mongodb://root@106.53.115.12:27017/test")


var GameSchema = new mongoose.Schema({
	name:String
});
GameSchema.plugin(lastMod, { index: true });

const Game =  mongoose.model('Game', GameSchema);

let myWorld = new Game({name: "myWorld"});

myWorld.save((err) => {
	console.log(err);
})