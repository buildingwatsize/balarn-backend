module.exports = (sequelize, DataTypes) => {
  const wallet = sequelize.define('wallet', {
    name: { // wallet name
      type: DataTypes.STRING(255)
    },
    balance: {
      type: DataTypes.DOUBLE(10, 2) // MAX 10M and got 2 decision decimal.
    },
    // ## This is META
    // profit: {
    //   type: DataTypes.STRING(255)
    // },
    // alias_name: {
    //   type: DataTypes.STRING(255)
    // },
    // ## This is META
  })

  wallet.associate = (models) => {
    wallet.hasMany(models.transaction, { onDelete: 'CASCADE', foreignKey: 'wallet_id' })
  }
  return wallet
}