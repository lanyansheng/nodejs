var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient ;
var db_str ='mongodb://localhost:27017/lan'; 
var fs=require('fs')
var upload =require('./upload')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register',function(req,res) {
	var obj = {user:req.body.user,psw:req.body.psw  } ;
	let status = req.body.status ;
	mongodb.connect(db_str,(err,database)=>{
		// 1为老师
		if(status == '1'){    
			database.collection('teacher',(err,coll)=>{
				coll.find({user:obj.user}).toArray(function(err,data){
					if(data.length > 0){
							res.send("0") ;
					}else{
						coll.insertOne(obj,()=>{
						res.send('1')
						database.close()
						})
					}			
				})
			})
		}
		// 2为学生
		else if(status == '2'){    
			database.collection('student',(err,coll)=>{
				coll.find({user:obj.user}).toArray(function(err,data){
					if(data.length > 0){
							res.send("0") ;
					}else{
						coll.insertOne(obj,()=>{
						res.send('2')
						database.close()
						})
					}			
				})
			})
		}
		else{
			res.send('error!') 
			database.close() 
		}
	})
})

router.post('/login',function(req,res){
		var obj = {user:req.body.user,psw:req.body.psw  } ;
		let status = req.body.status ;
		mongodb.connect(db_str,(err,database)=>{
		if(status == '1'){    
			database.collection('teacher',(err,coll)=>{
				coll.find(obj).toArray(function(err,data){
					if(data.length > 0){
						req.session.username = data[0].user ;
							res.send('1')						
					}else{						
						res.send("0") ;						
					}		
					database.close()
				})
			})
		}
		else if(status == '2'){    
			database.collection('student',(err,coll)=>{
				coll.find(obj).toArray(function(err,data){
					if(data.length > 0){
						req.session.username = data[0].user ;
							res.send('2')						
					}else{						
						res.send("0") ;						
					}		
					database.close()
				})
			})
		}
	})
})
//判断是否有该老师的个人信息
router.post('/message',function(req,res){
var username = req.query.id ;
		console.log(username);		
		mongodb.connect(db_str,(err,database)=>{
			database.collection('info',(err,coll)=>{
					coll.find({username:username}).toArray((err,data)=>{						
						if(data.length > 0){							
							res.send("1") ;
						}else{						
							res.send("0") ;
						}
						database.close()
					})
			})
		})
	})
// 保存老师的个人信息
router.post('/save',function(req,res) {
	let str = req.body ; 
	mongodb.connect(db_str,(err,database)=>{
		database.collection('info',(err,coll)=>{
			coll.insertOne(str,()=>{
				res.send("1") 
				database.close()  
			})
		})
	})	
})
// 保存学生的个人信息
router.post('/save_stuinfo',function(req,res) {
	let str = req.body ; 
	mongodb.connect(db_str,(err,database)=>{
		database.collection('stuinfo',(err,coll)=>{
			coll.insertOne(str,()=>{
				res.send("1") 
				database.close()  
			})
		})
	})	
})
// 修改老师的个人信息
router.post('/change',function(req,res) {
	let str = req.body ; 
	console.log(str);
	mongodb.connect(db_str,(err,database)=>{
		database.collection('info',(err,coll)=>{
			coll.update({username:req.session.username},{$set:{name:str.name,age:str.age,subject:str.subject,grade:str.grade}}) ;
			res.send("1");
			database.close() ;
		})
	})	
})

router.post('/liuyan',function(req,res){
	let str = req.body ;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{
			coll.insertOne(str,()=>{
				res.send('1') ;	
				database.close() ;
			})
		})
	})
})
// 得到点击的标题对应的内容
router.post('/check',function(req,res){
	let str = req.body ;
	str = str._id ;
//	str = {ObjectId(str)} ;
	console.log(str);
	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{
			coll.find({}).toArray((err,data)=>{
				data.map(function(item,i){
					if(item._id == str){
						res.send(item.content) ;
						database.close() ;
					}
				})
			})
		})
	})
})
// 富文本用
router.post('/uploadImg',function(req,res){
	upload(req,res) 
})
// 删除留言
router.post('/delete',function(req,res){
	let i = req.query.id ;	
	console.log(i);
	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{
			coll.find({}).sort({_id:-1}).toArray((err,data)=>{	
				console.log(data[i]);
				coll.remove(data[i]) ;
				database.close() ;
				res.send("1");
			})
		})
	})
})
// 删除对应的学生成绩
router.post('/delchengji',function(req,res){
	let i = req.query.id ;	
	console.log(i);
	mongodb.connect(db_str,(err,database)=>{
		database.collection('chengji',(err,coll)=>{
			coll.find({}).sort({_id:-1}).toArray((err,data)=>{	
				console.log(data[i]);
				coll.remove(data[i]) ;
				database.close() ;
				res.send("1");
			})
		})
	})
})
// 保存学生成绩
router.post('/score',function(req,res){
	let str = req.body ;
//	var name =str.Name ;

	mongodb.connect(db_str,(err,database)=>{
		database.collection('chengji',(err,coll)=>{
			coll.find({Name:str.Name,Class:str.Class,Grade:str.Grade}).toArray((err,data)=>{
			//	console.log(data);
				if(data.length > 0 ){
					res.send('2');
					database.close() ;
				}else{
						coll.insertOne(str,()=>{
						res.send('1') ;	
						database.close() ;
					})
				}
			})

		})
	})
})
// 查找登录的该账号对应的学生的成绩
router.post('/searchchengji',function(req,res){
	let str = req.body ;
//	var name =str.Name ;

	mongodb.connect(db_str,(err,database)=>{
		database.collection('chengji',(err,coll)=>{
			coll.find({Name:str.Name,Class:str.Class,Grade:str.Grade}).toArray((err,data)=>{
			//	console.log(data);
				if(data.length > 0 ){
					//	req.session.userid = data[0]._id ;
				
						res.send(data[0]._id); 
						database.close()
				}else{
					res.send('1')
					database.close()
				}
		})
	})
})
})
// 为了把登录学生端的账号对应的学生的成绩的_id保存到session中，在留言模块跳转到成绩时要用这个_id
router.post('/getuserid',function(req,res){
	let str = req.body ;
//	var name =str.Name ;

	mongodb.connect(db_str,(err,database)=>{
		database.collection('chengji',(err,coll)=>{
			coll.find({Name:str.Name,Class:str.Class,Grade:str.Grade}).toArray((err,data)=>{		
				if(data.length > 0 ){
					// 保存_id到session 中
						req.session.userid = data[0]._id ;	
						console.log(req.session.userid) ;
						res.send('1')
						database.close()
				}else{
						res.send('2')
						database.close()
				}
		})
	})
})
})

module.exports = router;