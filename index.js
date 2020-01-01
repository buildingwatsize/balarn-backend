const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const passport = require('passport');

const env = process.env.NODE_ENV || 'development'
const config = require('./config/config.json')[env];
const PORT = config.app_port

const app = express();

const userService = require('./services/user');
const walletService = require('./services/wallet')
const transactionService = require('./services/transaction')
// const commentService = require('./services/comment')
const db = require('./models');

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors())

require('./config/passport')

db.sequelize.sync({ force: false, alter: false }).then(() => {

  userService(app, db);
  walletService(app, db)
  transactionService(app, db)
  // commentService(app, db)

  // app.get('/protected', passport.authenticate('jwt', { session: false }),
  //   function (req, res) {
  //     res.send(req.user);
  //   });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  });
})