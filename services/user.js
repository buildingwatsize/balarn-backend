const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config/passport');
const bcrypt = require('bcryptjs')

module.exports = (app, db) => {
  app.post('/signup', (req, res, next) => {
    passport.authenticate('register', async (err, user, info) => {
      if (err) {
        console.error(err);
        res.status(400).send({ message: "Bad Request" })
      }
      if (info !== undefined) {
        console.error(info.message);
        res.status(403).send({ message: info.message });
      } else {
        const user_id = user.dataValues.id
        console.log('User Created ID:', user_id)
        // create a default wallet
        const walletCreated = await db.wallet.create({
          name: "Main Wallet",
          balance: 0.0,
          user_id
        })
        if (!walletCreated) {
          console.error("Not Found User")
          res.status(404).send({ message: "Error: Not Found User" })
        } else {
          // console.log(walletCreated)
          res.status(201).send({ message: "User Create Success" })
        }
      }
    })(req, res, next);
  });

  app.post('/signin', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) {
        console.error(err);
        res.status(400).send({ message: "Bad Request" })
      }
      if (info !== undefined) {
        // console.error(info.message);
        res.status(403).send({ message: info.message });
      } else {
        // console.log('User Authenticated');
        const token = jwt.sign({ id: user.id, role: user.role }, config.jwtOptions.secretOrKey, {
          expiresIn: 3600,
        });
        // console.log(token)
        res.status(200).send({
          auth: true,
          message: "User Authenticated",
          token,
        });
      }
    })(req, res, next);
  });

  app.put('/change_password', (req, res, next) => {
    if (req.body.old_password === req.body.new_password) {
      res.status(400).send({ message: "New password haven't to the same as old password" })
    }
    passport.authenticate('change_password', async (err, user, info) => {
      if (err) {
        console.error(err);
        res.status(400).send({ message: "Bad Request" })
      }
      if (info !== undefined) {
        console.error(info.message);
        res.status(403).send({ message: info.message });
      } else {
        let hashedPassword = bcrypt.hashSync(req.body.new_password, user.salt);
        let updatedUser = await db.user.update({ password: hashedPassword }, { where: { id: user.dataValues.id } })
        if (updatedUser) {
          console.log("Your password is updated");
          res.status(200).send({ message: "Your password is updated" })
        } else {
          console.error(err)
          res.status(400).send(err)
        }
      }
    })(req, res, next);
  });

}
