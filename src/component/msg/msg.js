import React from 'react'
import {connect} from 'react-redux'
import {List, Badge} from 'antd-mobile'

@connect(
	state=>state
)
class Msg extends React.Component{

	// 一进入dashboard就要获取消息数据
	componentDidMount(){
		
    }
    
    getLast(arr){
        return arr[arr.length - 1 ]
    }
	
	render(){
        const msgGroup = {}
        this.props.chat.chatmsg.forEach(v => {
            msgGroup[v.chatid] = msgGroup[v.chatid] || []
            msgGroup[v.chatid].push(v)
        });
        // const chatList = Object.values(msgGroup)
        // 对分组进行排序，让最后接收到的消息列表显示在最前面
        const chatList = Object.values(msgGroup).sort((a,b) => {
            const aLast = this.getLast(a).create_time
            const bLast = this.getLast(b).create_time
            return bLast - aLast
        })
        const userId = this.props.user._id
        const users = this.props.chat.users
        const Item = List.Item
        const Brief = Item.Brief
        return (
            <div>
                <List>
                    {chatList.map(v=>{
                        // 拿到最后一条消息
                        const last  = this.getLast(v)
                        // 展示用户名，始终显示对方的名字
                        const tId = last.from === userId ? last.to : last.from
                        const cuser = users[tId]
                        if(!cuser){
                            return null
                        }
                        // to是当前用户且未读的
                        const unReadNum = v.filter(v=>v.to === userId && !v.read ).length
                        return(
                            <Item 
                                key={last._id} 
                                extra={<Badge text={unReadNum}></Badge>}
                                thumb={require(`../img/${cuser.avatar}.png`)}
                                arrow="horizontal"
                                onClick={()=>{
                                    this.props.history.push(`/chat/${tId}`)
                                }}>
                                    <Brief>{cuser.name}</Brief>
                                {last.content}
                            </Item>
                        )
                    })}
                    
                </List>
            </div>
        )
    }
}

export default Msg