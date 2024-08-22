require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Veritabanı Bağlantısı
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'kutluhan@7',
  database: process.env.DB_NAME || 'deweyDB'
});

// Veritabanı Log
db.connect((err) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
    process.exit(1);
  }
  console.log('Veritabanına başarıyla bağlandı');
});

// JWT gizli anahtarı (gizlenecek!!)
const secretKey = process.env.SECRET_KEY || 'Verinova@7';

// Yardımcı fonksiyonlar
const handleDatabaseError = (res, err, message) => {
  console.error('Veritabanı hatası:', err);
  res.status(500).json({ message });
};

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  try {
    // Önce kullanıcı adının var olup olmadığını kontrol et
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }

      // Kullanıcı adı benzersiz, yeni kullanıcıyı ekle
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (insertErr) => {
          if (insertErr) {
            console.error('User insertion error:', insertErr);
            return res.status(500).json({ message: 'Kullanıcı eklenirken hata oluştu.' });
          }
          const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
          res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', token });
        }
      );
    });
  } catch (error) {
    console.error('Password hashing error:', error);
    res.status(500).json({ message: 'Şifre hashleme hatası' });
  }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return handleDatabaseError(res, err, 'Giriş sırasında hata oluştu.');
      if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
          res.json({ token });
        } else {
          res.status(401).json({ message: 'Kullanıcı adı veya şifre yanlış.' });
        }
      } else {
        res.status(401).json({ message: 'Kullanıcı adı veya şifre yanlış.' });
      }
    }
  );
});

// Search Endpoint
app.get('/api/search', (req, res) => {
  const { query, type } = req.query;
  if (!query) return res.status(400).json({ message: 'Arama sorgusu gerekli' });
  if (!type || (type !== 'konu_adi' && type !== 'aciklama')) {
    return res.status(400).json({ message: 'Geçerli bir arama türü gerekli (konu_adi veya aciklama)' });
  }

  const searchQuery = query.trim();
  const sqlQuery = `
    SELECT 
      dewey_no, g1, g2, g3, g4, g5, g6, g7, g8, konu_adi, aciklama, not1, not2,
      CASE
        WHEN ${type} = ? THEN 1
        WHEN ${type} LIKE ? THEN 2
        WHEN ${type} LIKE ? THEN 3
        WHEN ${type} LIKE ? THEN 4
        ELSE 5
      END AS relevance
    FROM deweys 
    WHERE 
      ${type} = ? OR
      ${type} LIKE ? OR
      ${type} LIKE ? OR
      ${type} LIKE ?
    ORDER BY relevance, LENGTH(${type})
  `;

  const params = [
    searchQuery,
    `% ${searchQuery} %`,
    `${searchQuery}%`,
    `%${searchQuery}`,
    searchQuery,
    `% ${searchQuery} %`,
    `${searchQuery}%`,
    `%${searchQuery}`
  ];

  db.query(sqlQuery, params, (err, results) => {
    if (err) return handleDatabaseError(res, err, 'Arama sırasında hata oluştu.');

    const processedResults = results.map(result => {
      const gValues = [result.g1, result.g2, result.g3, result.g4, result.g5, result.g6, result.g7, result.g8];
      const longestGValue = gValues.reduce((a, b) => (a && a.length > (b ? b.length : 0) ? a : b), null);
      const fullDeweyNo = longestGValue ? `${result.dewey_no}${longestGValue}` : result.dewey_no;

      return {
        dewey_no: fullDeweyNo,
        konu_adi: result.konu_adi,
        aciklama: result.aciklama,
        not1: result.not1,
        not2: result.not2
      };
    });

    res.json(processedResults);
  });
});

// Dewey Details Endpoint
app.get('/api/dewey/details', (req, res) => {
  const { dewey_no } = req.query;
  if (!dewey_no) return res.status(400).json({ message: 'Dewey numarası gerekli' });

  db.query(
    'SELECT dewey_no, konu_adi, aciklama, not1, not2 FROM deweys WHERE dewey_no = ?',
    [dewey_no],
    (err, results) => {
      if (err) return handleDatabaseError(res, err, 'Dewey detayları alınırken hata oluştu.');
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ message: 'Dewey numarası bulunamadı.' });
      }
    }
  );
});

// Master_Subcategories Endpoint
app.get('/api/subcategories/:mainCategory', (req, res) => {
  const { mainCategory } = req.params;
  
  console.log("Requested main category:", mainCategory);

  if (!mainCategory || mainCategory === 'undefined' || isNaN(mainCategory)) {
    return res.status(400).json({ message: 'Geçerli bir ana kategori gerekli' });
  }
  let query;
  let queryParams;
  //900 lere bir

  if (mainCategory === '900') {
    query = `
      SELECT real_dewey_no, konu_adi, not1, not2
      FROM deweys 
      WHERE real_dewey_no >= 900 AND real_dewey_no < 1000
      AND LENGTH(real_dewey_no) = 3
      AND real_dewey_no % 10 = 0 
      ORDER BY real_dewey_no
    `;
    queryParams = [];

  } else {
    const nextMainCategory = String(Number(mainCategory) + 100).padStart(3, '0');
    query = `
      SELECT real_dewey_no, konu_adi, not1, not2
      FROM deweys 
      WHERE real_dewey_no >= ? AND real_dewey_no < ? 
      AND LENGTH(real_dewey_no) = 3
      AND real_dewey_no % 10 = 0 
      ORDER BY real_dewey_no
    `;
    queryParams = [mainCategory, nextMainCategory];
  }

  console.log("Executing query:", query);
  console.log("Query parameters:", queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Alt kategoriler alınırken hata oluştu.' });
    }
    console.log("Query results:", results);
    console.log("Number of results:", results.length);
    res.json(results);
  });
});
// Level1 subcategories
app.get('/api/dewey-level1/:dewey_no', (req, res) => {
  const { dewey_no } = req.params;
  
  console.log('Requested Dewey number:', dewey_no);

  if (!dewey_no || dewey_no === 'undefined' || dewey_no.length !== 3) {
    console.log('Invalid Dewey number:', dewey_no);
    return res.status(400).json({ error: 'Geçerli bir 3 haneli Dewey numarası gerekli' });
  }

  const currentCategory = parseInt(dewey_no);
  const nextCategory = currentCategory + 10;

  console.log('Current category:', currentCategory);
  console.log('Next category:', nextCategory);

  let query;
  let queryParams;

  if (currentCategory === 990) {
    // 990'lar için özel durum
    query = `
      SELECT real_dewey_no, konu_adi, aciklama, not1, not2
      FROM deweys
      WHERE real_dewey_no >= ? AND real_dewey_no < 1000
      AND LENGTH(real_dewey_no) = 3
      ORDER BY real_dewey_no
    `;
    queryParams = [dewey_no];
  } else {
    query = `
      SELECT real_dewey_no, konu_adi, aciklama, not1, not2
      FROM deweys
      WHERE real_dewey_no >= ? AND real_dewey_no < ? AND LENGTH(real_dewey_no) = 3
      ORDER BY real_dewey_no
    `;
    queryParams = [dewey_no, nextCategory.toString()];
  }

  console.log('Executing query:', query);
  console.log('Query params:', queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error occurred' });
    }
    //log check
    
    //console.log('Query results:', results); 

    if (results.length === 0) {
      console.log('No subcategories found');
      return res.status(404).json({ message: 'No subcategories found' });
    }

    res.json(results);
  });
});
//Burada deweyno. dan sonra 0 varsa diye ayreten kontrol edip onu da resulta ekle
// Level 2 sub categories
app.get('/api/dewey-level2/:dewey_no', (req, res) => {
  const { dewey_no } = req.params;
  
  console.log('Requested Dewey number for level 2:', dewey_no);

  if (!dewey_no || dewey_no === 'undefined' || dewey_no.length !== 3) {
    console.log('Invalid Dewey number:', dewey_no);
    return res.status(400).json({ error: 'Geçerli bir 3 haneli Dewey numarası gerekli' });
  }

  const currentCategory = parseInt(dewey_no);
  const nextCategory = currentCategory + 10;

  console.log('Current category:', currentCategory);
  console.log('Next category:', nextCategory);

  let query = `
    SELECT d1.real_dewey_no, d1.konu_adi, d1.aciklama, d1.not1, d1.not2,
           EXISTS(SELECT 1 FROM deweys d2 
                  WHERE d2.real_dewey_no LIKE CONCAT(d1.real_dewey_no, '.%')
                  AND d2.real_dewey_no != d1.real_dewey_no) AS hasSubcategories
    FROM deweys d1
    WHERE CAST(d1.real_dewey_no AS DECIMAL(5,1)) >= ? 
      AND CAST(d1.real_dewey_no AS DECIMAL(5,1)) < ?
      AND d1.real_dewey_no LIKE CONCAT(?, '.%')
      AND LENGTH(SUBSTRING_INDEX(d1.real_dewey_no, '.', -1)) = 1
    ORDER BY CAST(d1.real_dewey_no AS DECIMAL(5,1))
  `;

  let queryParams = [currentCategory, nextCategory, dewey_no];

  console.log('Executing query:', query);
  console.log('Query params:', queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error occurred' });
    }

    if (results.length === 0) {
      console.log('No level 2 subcategories found');
      return res.status(404).json({ message: 'No level 2 subcategories found' });
    }

    res.json(results);
  });
});

//level3
app.get('/api/dewey-level3/:dewey_no', (req, res) => {
  const { dewey_no } = req.params;
  
  console.log('Requested Dewey number for level 3:', dewey_no);

  if (!dewey_no || dewey_no === 'undefined') {
    console.log('Invalid Dewey number:', dewey_no);
    return res.status(400).json({ error: 'Geçerli bir Dewey numarası gerekli' });
  }

  const query = `
    SELECT d1.real_dewey_no, d1.konu_adi, d1.aciklama, d1.not1, d1.not2,
           EXISTS(SELECT 1 FROM deweys d2 
                  WHERE d2.real_dewey_no LIKE CONCAT(d1.real_dewey_no, '.%')
                  AND d2.real_dewey_no != d1.real_dewey_no) AS hasSubcategories
    FROM deweys d1
    WHERE d1.real_dewey_no LIKE CONCAT(?, '%')
      AND d1.real_dewey_no != ?
      AND LENGTH(REPLACE(d1.real_dewey_no, '.', '')) <= LENGTH(REPLACE(?, '.', '')) + 1
    ORDER BY d1.real_dewey_no
  `;

  const queryParams = [dewey_no, dewey_no, dewey_no];

  console.log('Executing query:', query);
  console.log('Query params:', queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error occurred', details: err.message });
    }

    console.log('Query results:', results);

    if (results.length === 0) {
      console.log('No level 3 subcategories found');
      return res.status(404).json({ message: 'No level 3 subcategories found' });
    }

    res.json(results);
  });
});
// Level 4 subcategories
app.get('/api/dewey-level4/:dewey_no', (req, res) => {
  const { dewey_no } = req.params;
  
  console.log('Requested Dewey number for level 4:', dewey_no);

  if (!dewey_no || dewey_no === 'undefined') {
    console.log('Invalid Dewey number:', dewey_no);
    return res.status(400).json({ error: 'Geçerli bir Dewey numarası gerekli' });
  }

  const query = `
  SELECT real_dewey_no, konu_adi, aciklama, not1, not2
  FROM deweys
  WHERE real_dewey_no LIKE CONCAT(?, '%')
    AND real_dewey_no != ?
  ORDER BY real_dewey_no
`;

  const queryParams = [dewey_no, dewey_no, dewey_no];

  console.log('Executing query:', query);
  console.log('Query params:', queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error occurred', details: err.message });
    }

    console.log('Query results:', results);

    if (results.length === 0) {
      console.log('No level 4 subcategories found');
      return res.status(404).json({ message: 'No level 4 subcategories found' });
    }

    res.json(results);
  });
});
// Main Dewey Numbers Endpoint
app.get('/api/main-dewey-numbers', (req, res) => {
  const mainDeweyIds = [1, 629, 1251, 2710, 7476, 7874, 10984, 17072, 19524, 19913]; // Ana Dewey numaralarının ID'leri

  const query = 'SELECT id, dewey_no, konu_adi FROM deweys WHERE id IN (?) ORDER BY dewey_no';

  db.query(query, [mainDeweyIds], (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Ana Dewey numaraları alınırken hata oluştu.' });
    }
    res.json(results);
  });
});

// T Tables Endpoint
app.get('/api/t-tables', (req, res) => {
  const query = `
    SELECT id, tablo_no, konu_adi, aciklama
    FROM tables
    WHERE tablo_no IN ('T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7')
    ORDER BY tablo_no
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('T tabloları alınırken hata:', err);
      return res.status(500).json({ message: 'T tabloları alınırken hata oluştu.' });
    }
    res.json(results);
  });
});

// T Table Entries Endpoint
app.get('/api/t-tables/:tableNumber/entries', (req, res) => {
  const { tableNumber } = req.params;
  
  const query = `
    SELECT id, g1, g2, g3, g4, g5, g6, g7, konu_adi, aciklama
    FROM tables
    WHERE tablo_no = ?
    ORDER BY g1, g2, g3, g4, g5, g6, g7
  `;

  db.query(query, [tableNumber], (err, results) => {
    if (err) {
      console.error(`T Tablo ${tableNumber} girişleri alınırken hata:`, err);
      return res.status(500).json({ message: `T Tablo ${tableNumber} girişleri alınırken hata oluştu.` });
    }
    res.json(results);
  });
});

// T1 girişlerini getiren API endpoint'i
app.get('/api/t-tables/T1-entries', (req, res) => {
  const query = `
    SELECT tablo_no, konu_adi, aciklama
    FROM tables 
    WHERE id BETWEEN 2 AND 175
    AND g1 = '' AND g2 = '' AND g3 = '' AND g4 = '' AND g5 = '' AND g6 = '' AND g7 = ''
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('T1 girişleri alınırken hata:', err);
      return res.status(500).json({ message: 'T1 girişleri alınırken hata oluştu.' });
    }
    res.json(results);
  });
});

app.get('/api/related-categories', (req, res) => {
  const { base_number, level } = req.query;

  if (!base_number || !level) {
    return res.status(400).json({ message: 'base_number ve level parametreleri gereklidir.' });
  }

  let query;
  let queryParams;

  if (level === '1') {
    // 1. seviye için sorgu (örn: 310-319)
    query = `
      SELECT real_dewey_no, konu_adi, aciklama 
      FROM deweys 
      WHERE real_dewey_no >= ? AND real_dewey_no < ?
      ORDER BY dewey_no
    `;
    queryParams = [`${base_number}0`, `${parseInt(base_number) + 1}0`];
  } else if (level === '2') {
    // 2. seviye için sorgu (örn: 331.10-331.19)
    query = `
      SELECT real_dewey_no, konu_adi, aciklama 
      FROM deweys 
      WHERE real_dewey_no >= ? AND real_dewey_no < ?
      ORDER BY dewey_no
    `;
    queryParams = [`${base_number}0`, `${base_number}9.99`];
  } else {
    return res.status(400).json({ message: 'Geçersiz level değeri.' });
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('İlgili kategoriler alınırken hata:', err);
      return res.status(500).json({ message: 'İlgili kategoriler alınırken hata oluştu.' });
    }
    res.json(results);
  });
});


// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`im in ${port}`);
});