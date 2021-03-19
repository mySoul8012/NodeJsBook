var lastMod = require('./lastMod');
const mongoose = require("mongoose");
var Game = new mongoose.Schema({
	name:String
});
Game.plugin(lastMod, { index: true });
module.exports = () => {
	return Game;
};