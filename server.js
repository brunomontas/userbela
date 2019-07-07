const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Chatkit = require('@pusher/chatkit-server')

const app = express()

const chatkit = new Chatkit.default({
    instanceLocator: 'v1:us1:a9debf51-0968-43ba-b2e0-9da8a3351d1e',
    key: '124020ca-4ab9-4422-8960-0b62e9c9a14f:Ud+afxfyCEgtD1hUZFo3aTn1/G33RYCRdlKd5LSI+CE=',
  })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post('/users', (req, res) => {
    const { username } = req.body
    chatkit
      .createUser({
        id: username,
        name: username
      })
      .then(() => res.sendStatus(201))
      .catch(error => {
        if (error.error === 'services/chatkit/user_already_exists') {
          res.sendStatus(200)
        } else {
          res.status(error.status).json(error)
        }
      })
  })
  
  app.post('/authenticate', (req, res) => {
    const authData = chatkit.authenticate({ userId: req.query.user_id })
    res.status(authData.status).send(authData.body)
  })

const PORT = 3001
app.listen(PORT, err => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Running on port ${PORT}`)
  }
})
