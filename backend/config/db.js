const mysql = require('mysql2');

// Veritabanı bağlantısı
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',     
  password: 'kutluhan@7', 
  database: 'DeweyDB'  
});

// Bağlantıyı aç
connection.connect((err) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
    return;
  }
  console.log('Veritabanına başarıyla bağlandı.');
});

module.exports = connection;
