// 引入socket.io客户端
import io from 'socket.io-client'
import axios from 'axios'
// 因为存在跨域，所以需要手动连接一下
const socket = io('ws://localhost:9093')

const MSG_LIST = 'MSG_LIST'
const MSG_RECV = 'MSG_RECV'
const MSG_READ = 'MSG_READ'

const initState={
    chatmsg:[],
    users:{},
	unread:0
}
// reducer
export function chat(state=initState, action){
	switch(action.type){
		case MSG_LIST:
			return {
                ...state,
                users:action.payload.users,
                chatmsg:action.payload.msgs,
                // 未读数量等于read = false 并且 to 等于 当前用户
                unread:action.payload.msgs.filter(v => !v.read && v.to === action.payload.userId).length
            }
		case MSG_RECV:
            const n = action.payload.to === action.userId ? 1 : 0
			return {
                ...state, 
                chatmsg:[...state.chatmsg,action.payload],
                unread:state.unread + n
            }
		case MSG_READ:
            const { from, num } = action.payload
			return {
                ...state, 
                chatmsg:state.chatmsg.map(v => ({...v, read:v.from === from ? true : v.read})),
                unread:state.unread - num
            }
		default:
			return state
	}
} 

function msgList(msgs,users,userId){
    return {type: MSG_LIST, payload: {msgs,users,userId}}
}

export function getMsgList(){
    return (dispatch,getState) => {
        axios.get('/user/getmsglist')
        .then(res=>{
            // 这里通过第二个参数可以拿到redux里的state
            // console.log(getState())
            if(res.status === 200 && res.data.code === 0){
                const userId = getState().user._id
                dispatch(msgList(res.data.msgs,res.data.users,userId))
            }
        })
    }
}

export function sendMsg({from,to,msg}){
    return dispatch => {
        socket.emit('sendmsg',{from,to,msg})
    }
}

function msgRecv(msg,userId){
    // userId可放在外面，也可放到payload里面
    return {type: MSG_RECV, payload: msg, userId}
}

export function recvMsg(){
    return (dispatch,getState) => {
        socket.on('receivemsg',function(data){
            const userId = getState().user._id
            dispatch(msgRecv(data,userId))
        })
    }
}

function msgRead(obj){
    return {type: MSG_READ, payload: obj}
}

export function readMsg(from){
    return (dispatch,getState) => {
        axios.post('/user/readmsg',{from})
        .then(res=>{
            // 这里通过第二个参数可以拿到redux里的state
            // console.log(getState())
            if(res.status === 200 && res.data.code === 0){
                const userId = getState().user._id
                dispatch(msgRead({from,userId,num:res.data.num}))
            }
        })
    }
}

