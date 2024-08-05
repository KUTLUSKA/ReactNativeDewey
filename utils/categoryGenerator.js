// utils/categoryGenerator.js

/**
 * Ana kategorilerden ve her birinin alt kategorilerinden oluşan bir nesne döndürür.
 * Ana kategoriler: 000, 010, 020, ..., 900
 * Her ana kategorinin alt kategorileri: ana kategori + 1, ana kategori + 2, ..., ana kategori + 9
 */
export const generateCategories = () => {
  const categories = {};

  // Ana kategorileri oluştur
  for (let i = 0; i <= 900; i += 10) {
    const mainCategory = i.toString().padStart(3, '0');
    categories[mainCategory] = [];

    // Her ana kategori için alt kategorileri oluştur
    for (let j = 1; j <= 9; j++) {
      const subCategory = (i + j).toString().padStart(3, '0');
      categories[mainCategory].push(subCategory);
    }
  }

  return categories;
};
