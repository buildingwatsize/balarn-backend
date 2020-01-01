const passport = require('passport');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

module.exports = (app, db) => {
  app.get('/wallet',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const user_id = req.user.id
      const wallet = await db.wallet.findAll({
        where: { user_id },
        include: [{
          model: db.transaction
        }]
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Not Found" })
      } else {
        console.log(wallet)
        res.status(200).send(wallet)
      }
    }
  )

  app.post('/wallet',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const user_id = req.user.id
      const wallet = await db.wallet.create({
        name: req.body.name,
        balance: 0.0,
        user_id
      })
      console.log(wallet)
      res.status(201).send({ message: "Create Success", ...wallet.dataValues })
    }
  )

  app.put('/wallet',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const id = req.body.id
      const user_id = req.user.id

      const walletFound = await db.wallet.findOne({
        where: { user_id, id }
      })
      if (!walletFound) {
        res.status(404).send({ message: "Error: Not Found" })
      } else {
        const wallet = await walletFound.update({
          name: req.body.name,
          balance: req.body.balance
        })
        console.log(wallet)
        res.status(200).send({ message: "Update Success" })
      }
    }
  )

  app.delete('/wallet',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const id = req.body.id
      const user_id = req.user.id

      const walletFound = await db.wallet.findOne({
        where: { user_id, id }
      })
      if (!walletFound) {
        res.status(404).send({ message: "Error: Not Found" })
      } else {
        const wallet = await walletFound.destroy()
        console.log(wallet)
        res.status(200).send({ message: "Delete Success" })
      }
    }
  )
}