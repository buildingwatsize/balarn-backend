module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    username: { // email
      type: DataTypes.STRING(255)
    },
    password: {
      type: DataTypes.STRING(255)
    },
    // ## This is META
    // name: {
    //   type: DataTypes.STRING(100)
    // },
    // profile_img_url: {
    //   type: DataTypes.STRING(500)
    // },
    // ## This is META
    role: {
      type: DataTypes.ENUM("admin", "free", "premium")
    }
  })

  user.associate = (models) => {
    user.hasMany(models.wallet, { onDelete: 'CASCADE', foreignKey: 'user_id' })
  }
  return user
}