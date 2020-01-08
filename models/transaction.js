module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    type: { // email
      type: DataTypes.ENUM("deposit", "withdraw", "transfer", "pay", "interest")
    },
    amount: {
      type: DataTypes.DOUBLE(10, 2) // MAX 10M and got 2 decision decimal.
    },
    balance: {
      type: DataTypes.DOUBLE(10, 2) // MAX 10M and got 2 decision decimal.
    },
  })
  
  return transaction
}