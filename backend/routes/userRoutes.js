const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Kullanıcı girişi endpoint'i
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Basit bir sorgu örneği, gerçek projelerde şifreler hashlenmeli ve daha güvenli işlemler yapılmalı
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Veritabanı sorgusunda hata:', err);
      res.status(500).send('İç sunucu hatası');
      return;
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Giriş başarılı!' });
    } else {
      res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
  });
});

module.exports = router;
