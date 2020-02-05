const passport = require('passport');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

module.exports = (app, db) => {
  app.get('/transaction/:wallet_id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const user_id = req.user.id
      const wallet_id = req.params.wallet_id
      console.log(wallet_id)

      const wallet = await db.wallet.findOne({
        where: { id: wallet_id, user_id }
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Wallet is Not Found" })
      } else {
        const transaction = await db.transaction.findAll({
          where: { wallet_id },
          attributes: { exclude: ['wallet_id'] },
          order: [['createdAt', 'DESC']]
        })
        if (!transaction) {
          res.status(404).send({ message: "Error: Transaction is Not Found" })
        } else {
          console.log(transaction)
          res.status(200).send(transaction)
        }
      }
    }
  )

  app.post('/transaction',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const user_id = req.user.id
      const wallet = await db.wallet.findOne({
        where: { id: req.body.wallet_id, user_id }
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Wallet is Not Found" })
      } else {
        const txTypeList = [
          { name: "deposit", type: "increment" },
          { name: "interest", type: "increment" },
          { name: "withdraw", type: "decrement" },
          { name: "transfer", type: "decrement" },
          { name: "pay", type: "decrement" },
        ]
        let txType = req.body.type
        let foundType = txTypeList.find(item => item.name === txType)
        let wallet_updating_balance = foundType.type === "increment" ? wallet.balance + parseFloat(req.body.amount) : wallet.balance - parseFloat(req.body.amount)
        const transaction = await db.transaction.create({
          type: txType,
          amount: req.body.amount,
          balance: wallet_updating_balance,
          wallet_id: req.body.wallet_id
        })
        if (!transaction) {
          res.status(500).send({ message: "Error: Cannot Create Transaction" })
        } else {
          let updatedWallet = wallet.update({
            balance: wallet_updating_balance
          }, { where: { wallet_id: req.body.wallet_id } })
          if (!updatedWallet) {
            res.status(500).send({ message: "Error: Cannot Update Wallet Balance" })
          } else {
            res.status(201).send({ message: "Create Success", ...transaction.dataValues })
          }
        }
      }
    }
  )

  // ! DANGER API
  app.put('/transaction',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const id = req.body.id // transaction id
      const user_id = req.user.id
      const wallet_id = req.body.wallet_id
      const wallet = await db.wallet.findOne({
        where: { id: wallet_id, user_id }
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Wallet is Not Found" })
      } else {
        const transaction = await db.transaction.findOne({
          where: { wallet_id, id }
        })
        if (!transaction) {
          res.status(404).send({ message: "Error: Not Found Transaction" })
        } else {
          let updatedTransaction = transaction.update({
            type: req.body.type,
            amount: req.body.amount,
            balance: req.body.balance,
          })
          if (!updatedTransaction) {
            res.status(500).send({ message: "Error: Cannot Update Wallet Balance" })
          } else {
            res.status(200).send({ message: "Edit Success", ...updatedTransaction.dataValues })
          }
        }
      }
    }
  )

  app.delete('/transaction',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const id = req.body.id
      const user_id = req.user.id
      const wallet_id = req.body.wallet_id
      const wallet = await db.wallet.findOne({
        where: { id: wallet_id, user_id }
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Wallet is Not Found" })
      } else {
        const transactionFound = await db.transaction.findOne({
          where: { id, wallet_id: wallet_id }
        })
        if (!transactionFound) {
          res.status(404).send({ message: "Error: Not Found" })
        } else {
          const transaction = await transactionFound.destroy()
          console.log(transaction)
          res.status(200).send({ message: "Delete Success" })
        }
      }
    }
  )

  app.delete('/transaction/all',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      const user_id = req.user.id
      const wallet_id = req.body.wallet_id
      const wallet = await db.wallet.findOne({
        where: { id: wallet_id, user_id }
      })
      if (!wallet) {
        res.status(404).send({ message: "Error: Wallet is Not Found" })
      } else {
        const transactionFound = await db.transaction.findAll({
          where: { wallet_id: wallet_id }
        })
        if (!transactionFound) {
          res.status(404).send({ message: "Error: Not Found" })
        } else {
          console.log(transactionFound)
          let listTransaction = transactionFound.map(item => item.id)
          const deletedTransaction = await db.transaction.destroy({
            where: {
              id: listTransaction
            }
          })
          console.log(deletedTransaction)
          // res.status(200).send({ message: transactionFound })
          res.status(200).send({ message: "Delete Success" })
        }
      }
    }
  )
}