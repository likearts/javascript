const app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	mysql = require('mysql');

var DBconnected = false;

/**
######################################
	## index 페이지 설정 ##
######################################
**/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/**
######################################
	## 웹서버 실행 ##
######################################
**/
http.listen(8000, function(){
  console.log('Http server started with :8000');
});

/**
######################################
	## SOCKET 접속 ##
######################################
**/
io.on('connection', function(client){
  var sid = client.id, ip = client.request.connection.remoteAddress;
  console.log('신규 사용자 접속', sid, ip );
  console.log('connection :', client.request.connection._peername);

  // 접속종료
  client.on('disconnect',function(data){
  	console.log('사용자 접종',data);
  })
  // 게시물 추출 ( 전체 )
  client.on('get list',function(data){
  	console.log('bbs_list');
  	query('bbs_list',data);
  })
  // 게시물 등록 
  client.on('set row',function(data){
  	console.log('get row');
  	query('set_row',data);
  });
});
	
/** 
######################################
	## MySQL 접속 ##
######################################
**/
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "apmsetup",
  database: 'likearts'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  DBconnected = true;
});
	

function getUser(){
	//switch()
}


// 조건에 맞는 쿼리 실행
function query ( str, data ) {
	if(!DBconnected) {
		console.log( 'db 접속 에러')
		return;
	}
	switch( str ){
		case "bbs_list":
			getBBSList();
		break;
		case "set_row":
			setRow(data);
		break;
	}
}
	
// date 반환
function getDate(){
	return new Date().toISOString();
}

// 목록 추출
function getBBSList(){
	con.query('select * from bbs order by no desc', function (err, result) {
    if (err) throw err;
    console.log("Result: " + result );
    io.emit('get list : result',{data:result});
  });
}

// 등록
function setRow(data){
	var sql = "insert into bbs (subject,content,name, date) values('"+data.subject+"','"+data.content+"','"+data.name+"','"+getDate()+"')";
	con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);

    setTimeout(function(){
    	query('bbs_list');
    },300);

  });
}