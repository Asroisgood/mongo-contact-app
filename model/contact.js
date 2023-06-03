const mongoose = require('mongoose')

const Contact = mongoose.model('Contact', {
  nama: {
    type: String,
    requred: true,
  },
  noHP: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
})

module.exports = Contact
