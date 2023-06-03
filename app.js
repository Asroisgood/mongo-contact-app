const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

// Setup Method Override
app.use(methodOverride('_method'))

// Setup EJS
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// konfigurasi flash
app.use(cookieParser('secret'))
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
)
app.use(flash())

// Halaman Home
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Halaman Home',
    layout: 'layouts/main-layout',
  })
})

// Halaman About
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'About Me',
  })
})

// Halaman Contact
app.get('/contact', async (req, res) => {
  const contacts = await Contact.find()

  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Contact',
    contacts,
    msg: req.flash('msg'),
  })
})

// halaman form tambah kontak
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    layout: 'layouts/main-layout',
    title: 'Form Tambah Kontak',
  })
})

// proses Tambah data kontak
app.post(
  '/contact',
  [
    body('nama').custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value })
      if (duplikat) {
        throw new Error('Nama kontak sudah digunakan, coba nama lain!')
      }
      return true
    }),
    check('email', 'E-mail tidak valid!')
      .optional({ checkFalsy: true })
      .isEmail(),
    check('noHP', 'Nomor HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        layout: 'layouts/main-layout',
        title: 'Form Tambah Kontak',
        errors: errors.array(),
      })
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirim flash message
        req.flash('msg', `Kontak [ ${req.body.nama} ] telah berhasil disimpan!`)
        res.redirect('/contact')
      })
    }
  }
)

app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash('msg', `Kontak [ ${req.body.nama} ] telah berhasil dihapus!`)
    res.redirect('/contact')
  })
})

// form edit kontak
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render('edit-contact', {
    title: 'Form Edit Data Kontak',
    layout: 'layouts/main-layout',
    contact,
  })
})

// proses update/edit
app.put(
  '/contact',
  [
    body('nama').custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value })
      if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama kontak sudah digunakan, coba nama lain!')
      }
      return true
    }),
    check('email', 'E-mail tidak valid!')
      .optional({ checkFalsy: true })
      .isEmail(),
    check('noHP', 'Nomor HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        layout: 'layouts/main-layout',
        title: 'Form Edit Kontak',
        errors: errors.array(),
        contact: req.body,
      })
    } else {
      Contact.updateOne(
        {
          _id: req.body._id,
        },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            noHP: req.body.noHP,
          },
        }
      ).then((result) => {
        req.flash('msg', `Kontak [ ${req.body.nama} ] telah berhasil diedit!`)
        res.redirect('/contact')
      })
    }
  }
)

// halaman detail kontak
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Detail Kontak',
    contact,
  })
})

app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`)
})
