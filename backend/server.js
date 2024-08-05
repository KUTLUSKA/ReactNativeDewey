require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// CORS ve Body-Parser Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Veritabanı Bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'kutluhan@7',
  database: 'deweyDB'
});

// Veritabanı bağlantısını kontrol et
db.connect((err) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
    return;
  }
  console.log('Veritabanına başarıyla bağlandı');
});

// .env dosyasında saklanacak gizli anahtar
const secretKey = process.env.SECRET_KEY || 'your_secret_key';

// Register Endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).json({ message: 'Kullanıcı eklenirken hata oluştu.' });
      }
      res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.' });
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
        return res.status(500).json({ message: 'Giriş sırasında hata oluştu.' });
      }
      if (results.length > 0) {
        // Token oluştur
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.json({ token }); // Token'ı istemciye gönder
      } else {
        res.status(401).json({ message: 'Kullanıcı adı veya şifre yanlış.' });
      }
    }
  );
});

// Token doğrulama middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Token gerekli' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Geçersiz token' });
    req.user = user;
    next();
  });
};

// Dinamik Dewey Verilerini Alma Endpoint'i
app.get('/api/category/:category', (req, res) => {
  const category = req.params.category;
  const query = 'SELECT * FROM tables WHERE konu_no = ?';

  db.query(query, [category], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Kategori bulunamadı' });
    }
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
