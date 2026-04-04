import { Sequelize } from "sequelize";
const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "ecommerce",
});
export default sequelize;