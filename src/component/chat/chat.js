/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import {List, InputItem, NavBar, Icon, Grid} from 'antd-mobile'
import {connect} from 'react-redux'
import {getMsgList, sendMsg, recvMsg, readMsg} from '../../redux/chat.redux'
import { getChatId } from '../../util'
// // 引入socket.io客户端
// import io from 'socket.io-client'
// // 因为存在跨域，所以需要手动连接一下
// const socket = io('ws://localhost:9093')

@connect(
    state => state,
    {getMsgList,sendMsg,recvMsg,readMsg}
)
class Chat extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            text:'',
            msg:[],
            showEmoji:false
        }
    }

    componentDidMount(){ // 实时更新消息
        // 如果没有未读信息，不请求
        if(!this.props.chat.chatmsg.length){
            this.props.getMsgList()
            this.props.recvMsg()
        }
        this.fixCarousel()
    }

    // 在离开时把对方给我的未读消息全部变为已读
    componentWillUnmount(){ // 实时更新消息
        const to = this.props.match.params.user
        this.props.readMsg(to)
    }

    // 修复表情包幻灯片bug
    fixCarousel(){
        setTimeout(function(){
            window.dispatchEvent(new Event('resize'))
        },0)
    }
    
    handleSubmit(){
        const from = this.props.user._id
        const to = this.props.match.params.user
        const msg = this.state.text
        this.props.sendMsg({from,to,msg})
        this.setState({
            text:'',
            showEmoji:false
        })
    }
	render(){
        const emoji = `😃_😄_😁_😆_😅_😂_😉_😊_😇_😍_😘_😚_😋_😲_😳_😨_😰 _😥_😢_😭_😱_😖_😣_😞_😓_😩_😫_😤_😡_😠_👘_👙_👚_👛_👜_👝_🎒_👞_👟_👠_👡_👢_👑_👒_🎩_🎓_💄_💍_💼_👱_👨_😈_👿_💀_☠_💩_👹_👺_👻_👽_👾 _😺_😸_😹_😻_😼_😽_🙀_😿_😾_💋_👋`
        const emoji2 = "😁😂😃😄👿😉😊😖😔😓😒😏😍😌😘😚😜😝😞😠😡😢😲😱😰😭😪😨😥😣😳😷😋☁🌈🦄☁🌅🐥🌙🌄🐣🔥🐽🌱🌏🌔🐲🍄🌑🌼🎋☘️💧🍅🍆🍉🍊🍎🍓🍔🍟🍞🍝🍜🍛🍚🍙🍘🍡🍢🍦🍧🍰🍱🍲🍏🍍🍸🍑🍻🍒🍺🍈🍶🍇🍌☕🍵🍳🌽🍖🍭🍹🍕🍴🍫🌰🍩🍤🍨🍮🍷🎀🎁🎂🎃🎄🎍🎑🎎👑🎓✨🎈🎉🎇🎆🎏🎐🎌💍❤️💔💕💞💛💜"
        const emojiArr = emoji.split('_').map(v=>({text:v}))
        // console.log(this.props)
        const userId = this.props.match.params.user
        const Item = List.Item
        const users = this.props.chat.users
        // 聊天id
        const chatId = getChatId(userId,this.props.user._id)
        // 匹配出跟当前用户的聊天记录
        const chatMsgs = this.props.chat.chatmsg.filter(v=>v.chatid === chatId)
        if(!users[userId]){
            return null
        }

        // console.log(this.props.chat.chatmsg)
        return (
            <div id="chat-page">
                <NavBar 
                mode='dark' 
                className="stick-header"
                icon={<Icon type="left"/>}
                onLeftClick={()=>{
                    this.props.history.goBack()
                }}>
                    {users[userId].name}
                </NavBar>
                <div className="full-scroll">
                    {chatMsgs.map(v=>{
                        const avatar = require(`../img/${users[v.from].avatar}.png`)
                        return v.from === userId ? (
                            <List key={v._id}>
                                <Item thumb={avatar}>{v.content}</Item>
                            </List>
                        ) : (
                            <List key={v._id}>
                                <Item
                                    extra={<img src={avatar}/>}
                                    className='chat-me'
                                >{v.content}</Item>
                            </List>
                        )
                    })}
                </div>
                <div className="stick-footer">
                    <List>
                        <InputItem
                            placeholder="请输入聊天内容"
                            value={this.state.text}
                            onChange={v => {
                                this.setState({text:v})
                            }}
                            extra={
                                <div>
                                    <span 
                                        style={{marginRight:15}}
                                        onClick={()=>{
                                            this.setState({
                                                showEmoji:!this.state.showEmoji
                                            })
                                            this.fixCarousel()
                                        }}
                                    >😃</span>
                                    <span onClick={() => this.handleSubmit()}>发送</span>
                                </div>
                            }
                                
                        ></InputItem>
                    </List>
                    {this.state.showEmoji ? <Grid
                        data={emojiArr}
                        columnNum={9}
                        carouselMaxRow={4}
                        isCarousel={true}
                        onClick={el=>{
                            this.setState({
                                text:this.state.text+el.text
                            })
                        }}
                    ></Grid> : null}
                    
                </div>
            </div>
        )
    }
}

export default Chat