const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})

// // Menambah 1 data
// const contact1 = new Contact({
//   nama: 'Tobaclove',
//   noHP: '0899464868464',
//   email: 'tobaclove@gmail.com',
// })

// // Simpan ke collection

// contact1.save().then((contact) => console.log(contact))
