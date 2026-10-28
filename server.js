const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('addressbook.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT
    )
  `);
});

// Home page: Show contacts
app.get('/', (req, res) => {
  db.all('SELECT * FROM contacts', (err, contacts) => {
    res.render('index', { contacts, contact: null });
  });
});

// Add Contact
app.post('/add', (req, res) => {
  const { name, phone, email } = req.body;
  db.run('INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
    [name, phone, email], () => res.redirect('/'));
});

// Edit Contact - Show form
app.get('/edit/:id', (req, res) => {
  db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, contact) => {
    res.render('index', { contacts: [], contact });
  });
});

// Edit Contact - Update
app.post('/edit/:id', (req, res) => {
  const { name, phone, email } = req.body;
  db.run('UPDATE contacts SET name=?, phone=?, email=? WHERE id=?',
    [name, phone, email, req.params.id], () => res.redirect('/'));
});

// Delete Contact
app.post('/delete/:id', (req, res) => {
  db.run('DELETE FROM contacts WHERE id=?', [req.params.id], () => res.redirect('/'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Address Book app running on http://localhost:${PORT}`);
});