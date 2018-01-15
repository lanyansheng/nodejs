var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient ;
var async = require('async') ;
var db_str ='mongodb://localhost:27017/lan';
/* GET home page. */

/*
 	 *	 
	 *  数据库名称 lan 
	 * 	集合名字以及存储数据： 
	 * 	teacher: 老师的账号及密码 
	 * 	student: 学生的账号及密码
	 * 	chengji: 学生的成绩（班级，年级，名字，数学，成绩）
	 * 	info: 老师的个人信息
	 * 	stuinfo:学生的个人信息
	 * 	liuyan : 学生以及老师的留言
	 * 
*/
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/register',function(req,res) {
	res.render('register',{});
})

router.get('/home',function(req,res) {
		var status = req.query.status ;
		if(status == 1 ){
				res.render('teachome',{username:req.session.username});
		}
		if(status == 2 ){
//				res.render('studhome',{username:req.session.username});
			mongodb.connect(db_str,(err,database)=>{
				database.collection('stuinfo',(err,coll)=>{
					coll.find({username:req.session.username}).toArray((err,data)=>{
						console.log(data) ;
						if(data.length == 0){
							res.render('addstuinfo',{username:req.session.username}) ;
							database.close() ;
						}else{							
							res.render('studhome',{username:data[0].username,Name:data[0].Name,Age:data[0].age,Class:data[0].Class,Grade:data[0].Grade});
						}
					})
				})
			})
		}
})

router.get('/home/message',function(req,res){
	var status = req.query.status ;
	// 无数据时跳到上传个人信息界面
		if(status == 1 ){
				res.render('message',{username:req.session.username});
		}
	// 有数据展示个人信息
		if(status == 2 ){
			console.log(req.session.username);
		mongodb.connect(db_str,(err,database)=>{
		database.collection('info',(err,coll)=>{
			coll.find({username:req.session.username}).toArray((err,data)=>{
				console.log(data);
					res.render('msshow',{username:data[0].username,name:data[0].name,age:data[0].age,subject:data[0].subject,grade:data[0].grade}) ;			
					database.close() ;
			})
		})
	})
		}
			
})
// 重新登录
router.get('/relogin',function(req,res){
	req.session.destroy(function(err){
		if(!err){
			//res.render('login',{}) ;
			res.redirect('/') ;
		}
	})
})
// 修改个人信息渲染层
router.get('/home/message/change',function(req,res){
	mongodb.connect(db_str,(err,database)=>{
		database.collection('info',(err,coll)=>{
			coll.find({username:req.session.username}).toArray((err,data)=>{
				
					res.render('change',{username:data[0].username,name:data[0].name,age:data[0].age,subject:data[0].subject,grade:data[0].grade}) ;			
					database.close() ;
			})
		})
	})
	
})

router.get('/home/liuyan',function(req,res){
		var pagenum = req.query.pagenum ;
		pagenum = pagenum?pagenum:1 ;
		
//		总共多少条数据
		var count = 0 ;
//		每页的留言条数
		var pagesize = 3 ;
//    总共多少页
		var page = 0 ;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{
// 异步，先遍历集合，得到总数据，页数
			async.series([
				function(callback){
					coll.find({}).toArray((err,data)=>{
						count = data.length ; 
						page = Math.ceil(count/pagesize) ; 
						page = 0 ? 1:page ;
						pagenum = pagenum < 1?1:pagenum ;
						pagenum = pagenum > page?page:pagenum ;
						callback(null,'') ;
					})
				},
				function(callback){
				// 得到要展示当前页面的数据	
					coll.find({}).sort({_id:-1}).limit(pagesize).skip((pagenum-1)*pagesize).toArray((err,data)=>{
						callback(null,data) ;					
					})
				}
			],function(err,result){
				
				res.render('liuyan',{username:req.session.username,data:result[1],count:count,pagesize:pagesize,pagenum:pagenum,page:page}) ;
				database.close() ;
			})
			
		})
	})
})
// 内容详情，鸡肋
router.get('/home/detail' , function(req,res){
	
	let i = req.query.id ;

	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{
			coll.find({}).sort({_id:-1}).toArray((err,data)=>{			
					res.render('detail',{username:req.session.username,con:data[i].content}) ;			
					database.close() ;
			})
		})
	})
})

router.get('/home/chengji',function(req,res){
		var pagenum = req.query.pagenum ;
		pagenum = pagenum?pagenum:1 ;
		
//		总共多少条数据
		var count = 0 ;
//		每页的留言条数
		var pagesize = 3 ;
//    总共多少页
		var page = 0 ;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('chengji',(err,coll)=>{

			async.series([
				function(callback){
					coll.find({}).toArray((err,data)=>{
						count = data.length ; 
						page = Math.ceil(count/pagesize) ; 
						page = 0 ? 1:page ;
						pagenum = pagenum < 1?1:pagenum ;
						pagenum = pagenum > page?page:pagenum ;
						callback(null,'') ;
					})
				},
				function(callback){
					
					coll.find({}).sort({_id:-1}).limit(pagesize).skip((pagenum-1)*pagesize).toArray((err,data)=>{
						
						callback(null,data) ;
						
					})
				}
			],function(err,result){
//				console.log(Number(result[1][0].Math)+Number(result[1][0].Chinese)) ;
				var arr = [] ;
				if(result[1]){
					for(var i =0 ; i < result[1].length ; i ++){
						// 算出当前页面展示的成绩之和，即总分
						arr.push(Number(result[1][i].Math)+Number(result[1][i].Chinese)) ;
					}
				}
				res.render('chengji',{username:req.session.username,data:result[1],count:count,pagesize:pagesize,pagenum:pagenum,page:page,arr:arr}) ;
				database.close() ;
			})
			
		})
	})
})
// 展示学生的个人成绩
router.get('/home/showchengji',function(req,res){
		var _id = req.query.id ;
		// 得到数据库里对应的该生成绩的_id 值
		console.log(_id);
		mongodb.connect(db_str,(err,database)=>{
			database.collection('chengji',(err,coll)=>{
				coll.find({}).toArray((err,data)=>{
					//判断数据库里有没有这个学生的成绩
					
						if(data.length>0){
								data.map((item,i)=>{
									
										if(_id == item._id){
//											res.redirect('/home/showchengji?'+_id) ; 
											var Total =Number(item.Math)+Number(item.Chinese) ;
												res.render('showchengji',{username:req.session.username,Name:item.Name,Grade:item.Grade,Class:item.Class,Math:item.Math,Chinese:item.Chinese,Total:Total}) 
												
												database.close() 
										}
								})
						}else{
									
						}
						
				})
			})
		})
})

router.get('/home/stuliuyan',function(req,res){
		var pagenum = req.query.pagenum ;
		pagenum = pagenum?pagenum:1 ;
		
//		总共多少条数据
		var count = 0 ;
//		每页的留言条数
		var pagesize = 3 ;
//    总共多少页
		var page = 0 ;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('liuyan',(err,coll)=>{

			async.series([
				function(callback){
					coll.find({}).toArray((err,data)=>{
						count = data.length ; 
						page = Math.ceil(count/pagesize) ; 
						page = 0 ? 1:page ;
						pagenum = pagenum < 1?1:pagenum ;
						pagenum = pagenum > page?page:pagenum ;
						callback(null,'') ;
					})
				},
				function(callback){
					
					coll.find({}).sort({_id:-1}).limit(pagesize).skip((pagenum-1)*pagesize).toArray((err,data)=>{
						callback(null,data) ;					
					})
				}
			],function(err,result){
//				console.log(req.session.userid);
				res.render('stuliuyan',{username:req.session.username,data:result[1],count:count,pagesize:pagesize,pagenum:pagenum,page:page,id:req.session.userid}) ;
				database.close() ;
			})
			
		})
	})
})

module.exports = router;