// const express = require('express')
// const bodyParser = require('body-parser')
// const cookieParser = require('cookie-parser')

// const userRouter = require('./user')

// const app = express()
// app.use(cookieParser())
// app.use(bodyParser.json())
// app.use('/user',userRouter)
// app.listen(9093,function(){
// 	console.log('Node app start at port 9093')
// })


const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const userRouter = require('./user')
const model = require('./model')
const Chat = model.getModel('chat')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

io.on('connection',function(socket){
	// console.log('user login')
	socket.on('sendmsg',function(data){
		// console.log('收到消息',data)
		const {from,to,msg} = data
		const chatid = [from,to].sort().join('_')
		// 插入数据库
		Chat.create({chatid,from,to,content:msg},function(err,doc){
			// console.log(doc)
			if(!err){
				io.emit('receivemsg',Object.assign({},doc._doc))
			}
		})
		
	})
})

app.use(cookieParser())
app.use(bodyParser.json())
app.use('/user',userRouter)

server.listen(9093,function(){
	console.log('Node app start at port 9093')
})

// nodemon server/server.js



