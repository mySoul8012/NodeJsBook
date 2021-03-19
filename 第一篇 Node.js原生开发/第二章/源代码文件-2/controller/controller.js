const service = require("../service/service.js")
// 引入http模块
var http = require("http");
var url1 = require("http")

// 创建HTTP服务器
var server = http.createServer(function(request, response) {
   	if(request.url == "/index.html"){
	    /* 设置相应的头部 */
	    response.writeHead(200, {
	        "content-Type" : "text/plain"
	    });

	    /* 设置相应的数据 */

	    service.then((res) => {
	 		response.write(res.toString());
	    	response.end();
	    })
	}
});

// 设置服务器端口
server.listen(8000, function(){
    console.log("Creat server on http://127.0.0.1:8000/");
})