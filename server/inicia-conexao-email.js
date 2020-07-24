const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lacodeamordf@gmail.com',
    // pass: 'Laco-de-amor2020'
    pass: 'fuxpykfclldpxzdb'
  }
});

module.exports = transporter;
