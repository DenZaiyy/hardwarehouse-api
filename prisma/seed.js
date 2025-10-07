// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('../app/generated/prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const slugify = require('slugify');

const prisma = new PrismaClient();

// Données des marques
const brandsData = [
    { name: 'Intel', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'AMD', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'NVIDIA', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'ASUS', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'MSI', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Gigabyte', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'ASRock', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Corsair', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'G.Skill', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Kingston', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Crucial', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Samsung', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Western Digital', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Seagate', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Toshiba', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Fractal Design', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'NZXT', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Cooler Master', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Seasonic', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'EVGA', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'be quiet!', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Logitech', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Razer', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'SteelSeries', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'Dell', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' },
    { name: 'LG', logo: 'https://res.cloudinary.com/dy2lo18vx/image/upload/v1759838805/Nvidia-Logo_uk8j79.png' }
];

// Données des catégories
const categoriesData = [
    {
        name: 'Processeurs',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Cartes mères',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Mémoire RAM',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Cartes graphiques',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Disques durs',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'SSD',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Boîtiers',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Alimentations',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Périphériques',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    },
    {
        name: 'Écrans',
        logo: 'https://images.unsplash.com/photo-1716062890647-60feae0609d0'
    }
];

// Données des produits par catégorie avec marque
const productsData = {
    'Processeurs': [
        { name: 'Core i9-13900K', brand: 'Intel', price: 589.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Ryzen 9 7950X', brand: 'AMD', price: 699.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Core i7-13700K', brand: 'Intel', price: 419.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Ryzen 7 7800X3D', brand: 'AMD', price: 449.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Core i5-13600K', brand: 'Intel', price: 319.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Ryzen 5 7600X', brand: 'AMD', price: 279.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Cartes mères': [
        { name: 'ROG STRIX Z790-E Gaming', brand: 'ASUS', price: 459.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'MAG B650 TOMAHAWK WiFi', brand: 'MSI', price: 219.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Z790 AORUS ELITE AX', brand: 'Gigabyte', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'B650M PRO B WiFi', brand: 'ASRock', price: 129.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'TUF Gaming B550-PLUS', brand: 'ASUS', price: 159.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Mémoire RAM': [
        { name: 'Vengeance LPX 32GB DDR4-3200', brand: 'Corsair', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Trident Z5 32GB DDR5-6000', brand: 'G.Skill', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Fury Beast 16GB DDR4-3200', brand: 'Kingston', price: 49.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Ballistix 64GB DDR4-3600', brand: 'Crucial', price: 199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Vengeance RGB Pro 16GB DDR4-3600', brand: 'Corsair', price: 69.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Cartes graphiques': [
        { name: 'GeForce RTX 4090', brand: 'NVIDIA', price: 1599.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Radeon RX 7900 XTX', brand: 'AMD', price: 999.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'GeForce RTX 4070 Ti', brand: 'NVIDIA', price: 799.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Radeon RX 7800 XT', brand: 'AMD', price: 499.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'GeForce RTX 4060', brand: 'NVIDIA', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'ROG Strix RTX 4080', brand: 'ASUS', price: 1199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Disques durs': [
        { name: 'Barracuda 2TB 7200RPM', brand: 'Seagate', price: 54.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Blue 1TB 7200RPM', brand: 'Western Digital', price: 39.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'P300 3TB 7200RPM', brand: 'Toshiba', price: 79.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'IronWolf 4TB NAS', brand: 'Seagate', price: 119.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'SSD': [
        { name: '980 PRO 1TB NVMe', brand: 'Samsung', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Black SN850X 2TB NVMe', brand: 'Western Digital', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'MX4 500GB SATA', brand: 'Crucial', price: 49.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'NV2 1TB NVMe', brand: 'Kingston', price: 59.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: '990 EVO 2TB NVMe', brand: 'Samsung', price: 149.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Boîtiers': [
        { name: 'Define 7 ATX Mid Tower', brand: 'Fractal Design', price: 169.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'H510 Elite Mid Tower', brand: 'NZXT', price: 149.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: '4000D Airflow Mid Tower', brand: 'Corsair', price: 104.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'MasterBox Q300L mITX', brand: 'Cooler Master', price: 39.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'H7 Flow Mid Tower', brand: 'NZXT', price: 139.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Alimentations': [
        { name: 'RM850x 850W 80+ Gold Modular', brand: 'Corsair', price: 139.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Focus GX-750 750W 80+ Gold', brand: 'Seasonic', price: 119.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'SuperNOVA 650 P6 80+ Platinum', brand: 'EVGA', price: 99.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Straight Power 11 600W 80+ Gold', brand: 'be quiet!', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'HX1000 1000W 80+ Platinum', brand: 'Corsair', price: 219.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Périphériques': [
        { name: 'MX Master 3S Wireless Mouse', brand: 'Logitech', price: 99.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'K95 RGB Platinum Mechanical', brand: 'Corsair', price: 199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'DeathAdder V3 Gaming Mouse', brand: 'Razer', price: 69.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Apex Pro Mechanical Keyboard', brand: 'SteelSeries', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'G Pro X Superlight 2', brand: 'Logitech', price: 159.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ],
    'Écrans': [
        { name: 'TUF Gaming VG27AQ 27" 1440p', brand: 'ASUS', price: 329.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'S2721DGF 27" 1440p 165Hz', brand: 'Dell', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: '27GN950-B 4K 144Hz Nano IPS', brand: 'LG', price: 799.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'Odyssey G7 32" 1440p Curved', brand: 'Samsung', price: 599.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { name: 'ROG Swift PG279QM 27" 240Hz', brand: 'ASUS', price: 699.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' }
    ]
};

async function main() {
    console.log('🌱 Début du seeding...');

    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.stocks.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.categories.deleteMany({});
    await prisma.brands.deleteMany({});

    console.log('🏷️ Création des marques...');
    const createdBrands = {};

    // Créer les marques
    for (const brandData of brandsData) {
        const brand = await prisma.brands.create({
            data: {
                name: brandData.name,
                slug: slugify(brandData.name, { lower: true, strict: true, locale: 'fr' }),
                logo: brandData.logo,
            },
        });
        createdBrands[brandData.name] = brand;
        console.log(`✅ Marque créée: ${brand.name} (${brand.slug})`);
    }

    console.log('📂 Création des catégories...');
    const createdCategories = {};

    // Créer les catégories
    for (const categoryData of categoriesData) {
        const category = await prisma.categories.create({
            data: {
                name: categoryData.name,
                slug: slugify(categoryData.name, { lower: true, strict: true, locale: 'fr' }),
                logo: categoryData.logo,
            },
        });
        createdCategories[categoryData.name] = category;
        console.log(`✅ Catégorie créée: ${category.name} (${category.slug})`);
    }

    console.log('🛍️ Création des produits...');
    let totalProducts = 0;

    // Créer les produits pour chaque catégorie
    for (const [categoryName, products] of Object.entries(productsData)) {
        const category = createdCategories[categoryName];

        if (!category) {
            console.warn(`⚠️ Catégorie non trouvée: ${categoryName}`);
            continue;
        }

        for (const productData of products) {
            const brand = createdBrands[productData.brand];

            if (!brand) {
                console.warn(`⚠️ Marque non trouvée: ${productData.brand}`);
                continue;
            }

            const product = await prisma.products.create({
                data: {
                    name: productData.name,
                    slug: slugify(productData.name, { lower: true, strict: true, locale: 'fr' }),
                    price: productData.price,
                    image: productData.image,
                    categoryId: category.id,
                    brandId: brand.id,
                },
            });

            // Créer un stock aléatoire pour chaque produit
            const randomStock = Math.floor(Math.random() * 50) + 1; // Stock entre 1 et 50
            await prisma.stocks.create({
                data: {
                    productId: product.id,
                    quantity: randomStock,
                },
            });

            totalProducts++;
            console.log(`✅ Produit créé: ${productData.brand} ${product.name} (stock: ${randomStock})`);
        }
    }

    console.log('\n📊 Résumé du seeding:');
    console.log(`🏷️ Marques créées: ${Object.keys(createdBrands).length}`);
    console.log(`📂 Catégories créées: ${Object.keys(createdCategories).length}`);
    console.log(`🛍️ Produits créés: ${totalProducts}`);
    console.log(`📦 Stocks créés: ${totalProducts}`);
    console.log('\n🎉 Seeding terminé avec succès!');

    // Afficher quelques statistiques
    console.log('\n📈 Statistiques par catégorie:');
    for (const categoryName of Object.keys(productsData)) {
        const productCount = productsData[categoryName].length;
        console.log(`  - ${categoryName}: ${productCount} produits`);
    }

    console.log('\n🏷️ Statistiques par marque:');
    const brandStats = {};
    for (const products of Object.values(productsData)) {
        for (const product of products) {
            brandStats[product.brand] = (brandStats[product.brand] || 0) + 1;
        }
    }

    Object.entries(brandStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([brand, count]) => {
            console.log(`  - ${brand}: ${count} produits`);
        });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Erreur durant le seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });