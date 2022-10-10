// import query from './config/db';
// const bcrypt = require("bcryptjs")


// const createUser = async (email: string, password: string ) => {
//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(password, salt);
 
//   const data = await query(
//     "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING id, email, password",
//     [email, hash], 
//   );
 
//   if (data.rowCount == 0) return false;
//   return data.rows[0];
// }

// const matchPassword = async (password: string, hashPassword: string) => {
//   const match = await bcrypt.compare(password, hashPassword);
//   return match
// };

// module.exports = { createUser, matchPassword };