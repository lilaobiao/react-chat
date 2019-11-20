const express = require('express')
const utils = require('utility')

const Router = express.Router()
const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')
const _filter = {'pwd':0,'__v':0}

// 清空聊天信息
// Chat.remove({},function(e,d){

// })

Router.get('/list',function(req, res){
	const { type } = req.query
	// User.remove({},function(e,d){})
	User.find({type},function(err,doc){
		if(!err){
			return res.json({code:0,data:doc})
		}else{
			return res.json({code:2})
		}
	})
})

Router.get('/getmsglist',function(req, res){
	const user = req.cookies.userid
	// 查找所有的user
	User.find({},function(err,userdoc){
		if(!err){
			// 返回users的目的，是为了前端匹配展示用户名和头像
			let users = {}
			userdoc.forEach(v=>{
				users[v._id] = {name:v.user,avatar:v.avatar}
			})
			// 用 '$or' 连接多个或查询条件，后面跟的是一个数组
			Chat.find({'$or':[{from:user},{to:user}]},function(err,doc){
				if(!err){
					return res.json({code: 0, msgs: doc, users: users})
				}else{
					return res.json({code:1})
				}
			})
		}
	})
	// User.remove({},function(e,d){})
})

Router.post('/readmsg',function(req, res){
	const to = req.cookies.userid
	const from = req.body.from
	// 查找所有的user
	Chat.update(
		{from,to}, // 更新条件
		{'$set':{read:true}}, // 更新值，也可直接写成{read:true}
		{'multi':true}, // 多条更新
		function(err,doc){
			// console.log(doc)
			if(!err){
				return res.json({code: 0, num: doc.nModified})
			}else{
				return res.json({code:1,msgs:'更新失败'})
			}
		}
	)
})




Router.post('/update',function(req,res){
	const userid = req.cookies.userid
	if (!userid) {
		return json.dumps({code:1})
	}
	const body = req.body
	User.findByIdAndUpdate(userid,body,function(err,doc){
		if(!err){
			const data = Object.assign({},{
				user:doc.user,
				type:doc.type
			},body)
			return res.json({code:0,data})
		}else{
			return res.json({code:1,msgs:'更新失败'})
		}
	})
})
Router.post('/login', function(req,res){
	const {user, pwd} = req.body
	User.findOne({user,pwd:md5Pwd(pwd)},_filter,function(err,doc){
		if (!doc) {
			return res.json({code:1,msg:'用户名或者密码错误'})
		}
		res.cookie('userid', doc._id)
		return res.json({code:0,data:doc})
	})
})
Router.post('/register', function(req, res){
	const {user, pwd, type} = req.body
	User.findOne({user},function(err,doc){
		if (doc) {
			return res.json({code:1,msg:'用户名重复'})
		}
		
		const userModel = new User({user,type,pwd:md5Pwd(pwd)})
		userModel.save(function(e,d){
			if (e) {
				return res.json({code:1,msg:'后端出错了'})
			}
			const {user, type, _id} = d
			res.cookie('userid', _id)
			return res.json({code:0,data:{user, type, _id}})
		})
	})
})
Router.get('/info',function(req, res){
	const {userid} = req.cookies
	if (!userid) {
		return res.json({code:1})
	}
	User.findOne({_id:userid} ,_filter , function(err,doc){
		if (err) {
			return res.json({code:1, msg:'后端出错了'})
		}
		if (doc) {
			return res.json({code:0,data:doc})
		}
	})
	// 用户有没有cookie
	
})

function md5Pwd(pwd){
	const salt = 'imooc_is_good_3957x8yza6!@#IUHJh~~'
	return utils.md5(utils.md5(pwd+salt))
}


module.exports = Router