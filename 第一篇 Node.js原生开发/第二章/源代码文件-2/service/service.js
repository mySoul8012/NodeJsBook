const userModel = require("../module/user.js")
let myDate = new Date();
let user = new userModel({
	"name": "ming"
})


// 异步调用mongoose相关存储，查询API
var userFunction = new Promise(function(resolve, reject){
    if(myDate.getDate() == 8){
    	user.save((err) => {
		console.log(err)
		// 查询数据库相应数据
		userModel.find({}, (err, docs) => {
			if(err){
				console.log(err);
				return;
			}
		resolve(docs)
			})
		})
    }
});
 

module.exports = userFunction;