const mongoose = require("mongoose");
mongoose.connect("mongodb://root@106.53.115.12:27017/test")

mongoose.connection.on("connected", () => {
    console.log("mongodb数据库连接成功")
});
mongoose.connection.on("error", (error) => {
    console.log("mongodb数据库连接失败", error)
});

// 定义Schema
const kittySchema = new mongoose.Schema({
  name: String
});
// 定义实例方法
kittySchema.methods.find = async function(){
	// this这里指调用Model实例的对象。
	return this.model("Kitten").findOne();
}



// 模型定义名称，即猫具体种类
const Kitten = mongoose.model('Kitten', kittySchema);

// 实例模型，实例化一只猫
const silence = new Kitten({ name: 'Silence' });
silence.find().then((res) => {
	console.log(res);
})
// 可以直接打印出猫的名字
console.log(silence.name); // 'Silence'



Kitten.insertMany({"name": "Silence"}, (err) => {
	if(err){
		console.log(err);
		return;
	}
})