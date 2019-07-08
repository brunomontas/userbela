import React, { Component } from 'react'
import Chatkit from '@pusher/chatkit-client'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import TypingIndicator from './components/TypingIndicator'
import WhosOnlineList from './components/WhosOnlineList'


class ChatScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUser: {},
     currentRoom: {},
     messages: [],
     usersWhoAreTyping: [],
    }
    this.sendMessage = this.sendMessage.bind(this)
    this.sendTypingEvent = this.sendTypingEvent.bind(this)
  }

    sendTypingEvent() {
        this.state.currentUser
          .isTypingIn({ roomId: this.state.currentRoom.id })
          .catch(error => console.error('error', error))
      }

    sendMessage(text) {
        this.state.currentUser.sendMessage({
          text,
          roomId: this.state.currentRoom.id,
        })
      }

  componentDidMount () {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: 'v1:us1:a9debf51-0968-43ba-b2e0-9da8a3351d1e',
      userId: this.props.currentUsername,
      tokenProvider: new Chatkit.TokenProvider({
        url: 'http://localhost:3001/authenticate',
      }),
    })

    chatManager
      .connect()
      .then(currentUser =>{
        this.setState({ currentUser })
        currentUser.createRoom({
          id: currentUser.name,
          name: currentUser.name,
          private: false,
          addUserIds: ['Bela_adormecida'],
          
        }
        ).then(room => {
          console.log(`Created room called ${room.name}`)
        })
        .catch(err => {
          console.log(`Error creating room ${err}`)
        })
        return currentUser
      })
      .then(currentUser =>{
        currentUser.joinRoom({ roomId: '21534362' })
      .then(room => {
        console.log(`Joined room with ID: ${room.id}`)
      })
      .catch(err => {
        console.log(`Error joining room ${'21534362'}: ${err}`)
      })
        return currentUser
      })
      .then(currentUser => {
        this.setState({ currentUser })
        return currentUser.subscribeToRoom({
          roomId: currentUser.name,
          messageLimit: 100,
          hooks: {
            onMessage: message => {
              this.setState({
                messages: [...this.state.messages, message],
              })
            },
            onUserStartedTyping: user => {
                    this.setState({
                    usersWhoAreTyping: [...this.state.usersWhoAreTyping, user.name],
                    })
                },
                onUserStoppedTyping: user => {
                    this.setState({
                    usersWhoAreTyping: this.state.usersWhoAreTyping.filter(
                        username => username !== user.name
                    ),
                  })
                },
                onPresenceChange: () => this.forceUpdate(),
          },
        })
      })
      .then(currentRoom => {
        console.log("im'here lalalalla")
        this.setState({ currentRoom })
       })
      .catch(error => console.error('error', error))
  }
  render() {

    const styles = {
        container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        },
        chatContainer: {
        display: 'flex',
        flex: 1,
        },
        whosOnlineListContainer: {
        width: '300px',
        flex: 'none',
        padding: 20,
        backgroundColor: '#2c303b',
        color: 'white',
        },
        chatListContainer: {
        padding: 20,
        width: '85%',
        display: 'flex',
        flexDirection: 'column',
        },
    }

    return (
        <div style={styles.container}>
        <div style={styles.chatContainer}>
            <aside style={styles.whosOnlineListContainer}>
            <WhosOnlineList
              currentUser={this.state.currentUser}
              users={this.state.currentRoom.users}
            />
            </aside>
            <section style={styles.chatListContainer}>
            <MessageList
              messages={this.state.messages}
              style={styles.chatList}
            />
            <TypingIndicator usersWhoAreTyping={this.state.usersWhoAreTyping} />
            <SendMessageForm onSubmit={this.sendMessage} onChange={this.sendTypingEvent}/>
            </section>
        </div>
        </div>
    )
  }
}

export default ChatScreen