let mongoose = require("../connect.js")
// 创建数据库相应模型
const userSchema = new mongoose.Schema({
    name: { type: String}
});
let userModel = mongoose.model('ming', userSchema);
module.exports = userModel;