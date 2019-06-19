const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'test',
  host: '192.168.1.6',
  database: 'stezy',
  password: 'test',
  port: 5432,
})

/*pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})*/

exports.getAllServices = () =>{
    let sqlQuery = `select * from services`;
    return pool.query(sqlQuery);
}