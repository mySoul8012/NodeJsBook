let url = require("./config.js")
var mongoose = require('mongoose'); 
mongoose.connect(url.url);//连接上 myblog 数据库
// 添加数据库监听事件
mongoose.connection.on("connected", () => {
    console.log("mongodb数据库连接成功")
});
mongoose.connection.on("error", (error) => {
    console.log("mongodb数据库连接失败", error)
});
module.exports = mongoose;