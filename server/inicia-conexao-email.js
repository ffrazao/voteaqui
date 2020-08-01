const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "voteaquidf@gmail.com",
    // pass: 'Laco-de-amor2020'
    pass: "Vote!QAZxsw2",
  },
});

module.exports = transporter;

// auth: {
//   user: 'lacodeamordf@gmail.com',
//   // pass: 'Laco-de-amor2020'
//   pass: 'fuxpykfclldpxzdb'
// }

// auth: {
//   user: 'asserdf@gmail.com',
//   pass: 'usuario3'
// }
