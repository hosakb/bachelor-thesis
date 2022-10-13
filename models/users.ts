import pool from "../config/db";

function getRole(email: string, cb: any): void {
    pool.query(
        `SELECT role FROM users
          WHERE email = $1`,
        [email],
        (err, result) => {
          
          if (err) {
            throw new Error("Failed query the user role after login. Error: " + err);
          }

          if (result.rowCount > 1) {
            throw new Error("To many roles for user with mail: " + email);
          } 

          if (result.rows[0].role === undefined) {
            throw new Error("Failed query the user role after login. User role does not exist.");
          } 

          cb(result.rows[0].role);
    })
  };

  export {getRole};