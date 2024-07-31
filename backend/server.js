const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// CORS ve Body-Parser Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Veritabanı Bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // MySQL kullanıcı adınızı buraya yazın
  password: 'kutluhan@7', // MySQL şifrenizi buraya yazın
  database: 'deweyDB' // Veritabanı adınızı buraya yazın
});

// Veritabanı bağlantısını kontrol et
db.connect((err) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
    return;
  }
  console.log('Veritabanına başarıyla bağlandı');
});

// Register Endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).send({ message: 'Kullanıcı eklenirken hata oluştu.' });
      }
      res.status(201).send({ message: 'Kullanıcı başarıyla kaydedildi.' });
    }
  );
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).send({ message: 'Giriş sırasında hata oluştu.' });
      }
      if (results.length > 0) {
        res.send({ message: 'Giriş başarılı' });
      } else {
        res.status(401).send({ message: 'Kullanıcı adı veya şifre yanlış.' });
      }
    }
  );
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
