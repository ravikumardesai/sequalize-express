require("dotenv").config()
const Sequelize = require("sequelize")

// console.log(process.env.DATABASENAME,process.env.DATABASEUSERNAME,process.env.DATABASEPASSWORD);

const sequelize = new Sequelize(process.env.DATABASENAME,process.env.DATABASEUSERNAME,process.env.DATABASEPASSWORD,{
    host: 'localhost',
    dialect:'mysql' 
})


module.exports = sequelize