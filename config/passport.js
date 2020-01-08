const bcrypt = require('bcryptjs')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt

const db = require('../models')

const BCRYPT_SALT_ROUNDS = 11;
let jwtOptions = {};
jwtOptions.secretOrKey = 'chinnawat.chimdee'

passport.use(
  'register',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      let userFound = await db.user.findOne({
        where: { username: username }
      })
      if (!userFound) {
        let salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
        let hashedPassword = bcrypt.hashSync(password, salt);
        let createdUser = await db.user.create({ username, password: hashedPassword, role: "free" })
        if (createdUser) {
          console.log("user created");
          return done(null, createdUser);
        } else {
          console.error(err)
          return done(err)
        }
      } else {
        console.log("Username already taken");
        return done(null, false, { message: 'Username already taken' });
      }
    }
  )
);

passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      let userFound = await db.user.findOne({ where: { username } })
      if (!userFound) {
        console.log("Not Found Username")
        return done(null, false, { message: 'Username not found or wrong password' });
      } else {
        bcrypt.compare(password, userFound.password, (err, response) => {
          console.log("response", { response })
          if (err) {
            console.error(err)
            return done(err)
          }
          if (!response) {
            console.error("Username not found or wrong password")
            return done(null, false, { message: 'Username not found or wrong password' });
          }
          console.log('User Authenticated');
          return done(null, userFound);
        })
      }
    },
  ),
);

passport.use(
  'change_password',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'old_password',
      session: false,
    },
    async (username, password, done) => {
      let userFound = await db.user.findOne({
        where: { username: username }
      })
      if (!userFound) {
        console.error("Not Found User")
        return done(null, false, { message: "Username not found."})
      } else {
        bcrypt.compare(password, userFound.password, (err, response) => {
          console.log("response", { response })
          if (err) {
            console.error(err)
            return done(err)
          }
          if (!response) {
            console.error("Username not found or wrong password")
            return done(null, false, { message: 'Username not found or wrong password' });
          }
          console.log('User Authenticated');
          let salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
          return done(null, {...userFound, salt});
        })
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtOptions.secretOrKey,
};

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      db.user.findOne({
        where: {
          id: jwt_payload.id,
        },
      }).then(user => {
        if (user) {
          console.log('user found in db in passport');
          return done(null, user);
        } else {
          console.error('user not found in db');
          return done(null, false);
        }
      });
    } catch (err) {
      console.error(err)
      return done(err);
    }
  }),
);

module.exports = { jwtOptions, BCRYPT_SALT_ROUNDS }
