const mysql = require("mysql");

// const db_config = {
//   host: "us-cdbr-east-02.cleardb.com",
//   user: "b2dd9c3cee1fce",
//   password: "f877cc83",
//   database: "heroku_f33133c167d57c0",
//   flags: "reconnect=true",
//   dateStrings: true,
// };

const db_config = {
  host: "us-mm-dca-95e55b8cdaff.g5.cleardb.net",
  user: "b2dd9c3cee1fce",
  password: "f877cc83",
  database: "heroku_f33133c167d57c0",
  flags: "reconnect=true",
  dateStrings: true,
};


var myArgs = process.argv.slice(2);

if (myArgs.includes('local')) {
  console.log('acesso BD local');
  db_config.host = "localhost";
  db_config.user = "root";
  db_config.password = "root";
}

(function () {
  var connection;

  getConexaoMySql = function () {
    return connection;
  };

  function handleDisconnect() {
    console.log("Conectando-se ao MySql");
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {
      if (err) {
        console.log("error when connecting to db:", err);
        setTimeout(handleDisconnect, 2000);
      }
    });

    connection.on("error", function (err) {
      console.log("db error", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        handleDisconnect();
      } else {
        throw err;
      }
    });
  }

  handleDisconnect();

  setInterval(function () {
    // console.log('Mantendo conexao mysql');
    connection.query("SELECT 1");
  }, 10000);
})();
