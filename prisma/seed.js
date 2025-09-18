const { PrismaClient } = require('../app/generated/prisma');
const slugify = require('slugify');

const prisma = new PrismaClient();

// Données des marques
const brandsData = [
    { name: 'Intel', logo: 'https://example.com/logos/intel.png' },
    { name: 'AMD', logo: 'https://example.com/logos/amd.png' },
    { name: 'NVIDIA', logo: 'https://example.com/logos/nvidia.png' },
    { name: 'ASUS', logo: 'https://example.com/logos/asus.png' },
    { name: 'MSI', logo: 'https://example.com/logos/msi.png' },
    { name: 'Gigabyte', logo: 'https://example.com/logos/gigabyte.png' },
    { name: 'ASRock', logo: 'https://example.com/logos/asrock.png' },
    { name: 'Corsair', logo: 'https://example.com/logos/corsair.png' },
    { name: 'G.Skill', logo: 'https://example.com/logos/gskill.png' },
    { name: 'Kingston', logo: 'https://example.com/logos/kingston.png' },
    { name: 'Crucial', logo: 'https://example.com/logos/crucial.png' },
    { name: 'Samsung', logo: 'https://example.com/logos/samsung.png' },
    { name: 'Western Digital', logo: 'https://example.com/logos/wd.png' },
    { name: 'Seagate', logo: 'https://example.com/logos/seagate.png' },
    { name: 'Toshiba', logo: 'https://example.com/logos/toshiba.png' },
    { name: 'Fractal Design', logo: 'https://example.com/logos/fractal.png' },
    { name: 'NZXT', logo: 'https://example.com/logos/nzxt.png' },
    { name: 'Cooler Master', logo: 'https://example.com/logos/coolermaster.png' },
    { name: 'Seasonic', logo: 'https://example.com/logos/seasonic.png' },
    { name: 'EVGA', logo: 'https://example.com/logos/evga.png' },
    { name: 'be quiet!', logo: 'https://example.com/logos/bequiet.png' },
    { name: 'Logitech', logo: 'https://example.com/logos/logitech.png' },
    { name: 'Razer', logo: 'https://example.com/logos/razer.png' },
    { name: 'SteelSeries', logo: 'https://example.com/logos/steelseries.png' },
    { name: 'Dell', logo: 'https://example.com/logos/dell.png' },
    { name: 'LG', logo: 'https://example.com/logos/lg.png' }
];

// Données des catégories
const categoriesData = [
    {
        name: 'Processeurs',
        logo: 'https://example.com/logos/cpu.png'
    },
    {
        name: 'Cartes mères',
        logo: 'https://example.com/logos/motherboard.png'
    },
    {
        name: 'Mémoire RAM',
        logo: 'https://example.com/logos/ram.png'
    },
    {
        name: 'Cartes graphiques',
        logo: 'https://example.com/logos/gpu.png'
    },
    {
        name: 'Disques durs',
        logo: 'https://example.com/logos/hdd.png'
    },
    {
        name: 'SSD',
        logo: 'https://example.com/logos/ssd.png'
    },
    {
        name: 'Boîtiers',
        logo: 'https://example.com/logos/case.png'
    },
    {
        name: 'Alimentations',
        logo: 'https://example.com/logos/psu.png'
    },
    {
        name: 'Périphériques',
        logo: 'https://example.com/logos/peripherals.png'
    },
    {
        name: 'Écrans',
        logo: 'https://example.com/logos/monitor.png'
    }
];

// Données des produits par catégorie avec marque
const productsData = {
    'Processeurs': [
        { name: 'Core i9-13900K', brand: 'Intel', price: 589.99, image: 'https://example.com/products/i9-13900k.jpg' },
        { name: 'Ryzen 9 7950X', brand: 'AMD', price: 699.99, image: 'https://example.com/products/ryzen-7950x.jpg' },
        { name: 'Core i7-13700K', brand: 'Intel', price: 419.99, image: 'https://example.com/products/i7-13700k.jpg' },
        { name: 'Ryzen 7 7800X3D', brand: 'AMD', price: 449.99, image: 'https://example.com/products/ryzen-7800x3d.jpg' },
        { name: 'Core i5-13600K', brand: 'Intel', price: 319.99, image: 'https://example.com/products/i5-13600k.jpg' },
        { name: 'Ryzen 5 7600X', brand: 'AMD', price: 279.99, image: 'https://example.com/products/ryzen-7600x.jpg' }
    ],
    'Cartes mères': [
        { name: 'ROG STRIX Z790-E Gaming', brand: 'ASUS', price: 459.99, image: 'https://example.com/products/asus-z790-e.jpg' },
        { name: 'MAG B650 TOMAHAWK WiFi', brand: 'MSI', price: 219.99, image: 'https://example.com/products/msi-b650-tomahawk.jpg' },
        { name: 'Z790 AORUS ELITE AX', brand: 'Gigabyte', price: 299.99, image: 'https://example.com/products/gigabyte-z790-elite.jpg' },
        { name: 'B650M PRO B WiFi', brand: 'ASRock', price: 129.99, image: 'https://example.com/products/asrock-b650m-pro.jpg' },
        { name: 'TUF Gaming B550-PLUS', brand: 'ASUS', price: 159.99, image: 'https://example.com/products/asus-b550-plus.jpg' }
    ],
    'Mémoire RAM': [
        { name: 'Vengeance LPX 32GB DDR4-3200', brand: 'Corsair', price: 89.99, image: 'https://example.com/products/corsair-lpx-32gb.jpg' },
        { name: 'Trident Z5 32GB DDR5-6000', brand: 'G.Skill', price: 179.99, image: 'https://example.com/products/gskill-z5-32gb.jpg' },
        { name: 'Fury Beast 16GB DDR4-3200', brand: 'Kingston', price: 49.99, image: 'https://example.com/products/kingston-fury-16gb.jpg' },
        { name: 'Ballistix 64GB DDR4-3600', brand: 'Crucial', price: 199.99, image: 'https://example.com/products/crucial-ballistix-64gb.jpg' },
        { name: 'Vengeance RGB Pro 16GB DDR4-3600', brand: 'Corsair', price: 69.99, image: 'https://example.com/products/corsair-rgb-pro-16gb.jpg' }
    ],
    'Cartes graphiques': [
        { name: 'GeForce RTX 4090', brand: 'NVIDIA', price: 1599.99, image: 'https://example.com/products/rtx-4090.jpg' },
        { name: 'Radeon RX 7900 XTX', brand: 'AMD', price: 999.99, image: 'https://example.com/products/rx-7900xtx.jpg' },
        { name: 'GeForce RTX 4070 Ti', brand: 'NVIDIA', price: 799.99, image: 'https://example.com/products/rtx-4070ti.jpg' },
        { name: 'Radeon RX 7800 XT', brand: 'AMD', price: 499.99, image: 'https://example.com/products/rx-7800xt.jpg' },
        { name: 'GeForce RTX 4060', brand: 'NVIDIA', price: 299.99, image: 'https://example.com/products/rtx-4060.jpg' },
        { name: 'ROG Strix RTX 4080', brand: 'ASUS', price: 1199.99, image: 'https://example.com/products/asus-rtx-4080.jpg' }
    ],
    'Disques durs': [
        { name: 'Barracuda 2TB 7200RPM', brand: 'Seagate', price: 54.99, image: 'https://example.com/products/seagate-2tb.jpg' },
        { name: 'Blue 1TB 7200RPM', brand: 'Western Digital', price: 39.99, image: 'https://example.com/products/wd-blue-1tb.jpg' },
        { name: 'P300 3TB 7200RPM', brand: 'Toshiba', price: 79.99, image: 'https://example.com/products/toshiba-p300-3tb.jpg' },
        { name: 'IronWolf 4TB NAS', brand: 'Seagate', price: 119.99, image: 'https://example.com/products/seagate-ironwolf-4tb.jpg' }
    ],
    'SSD': [
        { name: '980 PRO 1TB NVMe', brand: 'Samsung', price: 89.99, image: 'https://example.com/products/samsung-980-pro-1tb.jpg' },
        { name: 'Black SN850X 2TB NVMe', brand: 'Western Digital', price: 179.99, image: 'https://example.com/products/wd-sn850x-2tb.jpg' },
        { name: 'MX4 500GB SATA', brand: 'Crucial', price: 49.99, image: 'https://example.com/products/crucial-mx4-500gb.jpg' },
        { name: 'NV2 1TB NVMe', brand: 'Kingston', price: 59.99, image: 'https://example.com/products/kingston-nv2-1tb.jpg' },
        { name: '990 EVO 2TB NVMe', brand: 'Samsung', price: 149.99, image: 'https://example.com/products/samsung-990-evo-2tb.jpg' }
    ],
    'Boîtiers': [
        { name: 'Define 7 ATX Mid Tower', brand: 'Fractal Design', price: 169.99, image: 'https://example.com/products/fractal-define-7.jpg' },
        { name: 'H510 Elite Mid Tower', brand: 'NZXT', price: 149.99, image: 'https://example.com/products/nzxt-h510-elite.jpg' },
        { name: '4000D Airflow Mid Tower', brand: 'Corsair', price: 104.99, image: 'https://example.com/products/corsair-4000d.jpg' },
        { name: 'MasterBox Q300L mITX', brand: 'Cooler Master', price: 39.99, image: 'https://example.com/products/cm-q300l.jpg' },
        { name: 'H7 Flow Mid Tower', brand: 'NZXT', price: 139.99, image: 'https://example.com/products/nzxt-h7-flow.jpg' }
    ],
    'Alimentations': [
        { name: 'RM850x 850W 80+ Gold Modular', brand: 'Corsair', price: 139.99, image: 'https://example.com/products/corsair-rm850x.jpg' },
        { name: 'Focus GX-750 750W 80+ Gold', brand: 'Seasonic', price: 119.99, image: 'https://example.com/products/seasonic-gx750.jpg' },
        { name: 'SuperNOVA 650 P6 80+ Platinum', brand: 'EVGA', price: 99.99, image: 'https://example.com/products/evga-650-p6.jpg' },
        { name: 'Straight Power 11 600W 80+ Gold', brand: 'be quiet!', price: 89.99, image: 'https://example.com/products/bequiet-sp11-600w.jpg' },
        { name: 'HX1000 1000W 80+ Platinum', brand: 'Corsair', price: 219.99, image: 'https://example.com/products/corsair-hx1000.jpg' }
    ],
    'Périphériques': [
        { name: 'MX Master 3S Wireless Mouse', brand: 'Logitech', price: 99.99, image: 'https://example.com/products/logitech-mx-master-3s.jpg' },
        { name: 'K95 RGB Platinum Mechanical', brand: 'Corsair', price: 199.99, image: 'https://example.com/products/corsair-k95-rgb.jpg' },
        { name: 'DeathAdder V3 Gaming Mouse', brand: 'Razer', price: 69.99, image: 'https://example.com/products/razer-deathadder-v3.jpg' },
        { name: 'Apex Pro Mechanical Keyboard', brand: 'SteelSeries', price: 179.99, image: 'https://example.com/products/steelseries-apex-pro.jpg' },
        { name: 'G Pro X Superlight 2', brand: 'Logitech', price: 159.99, image: 'https://example.com/products/logitech-gpro-x2.jpg' }
    ],
    'Écrans': [
        { name: 'TUF Gaming VG27AQ 27" 1440p', brand: 'ASUS', price: 329.99, image: 'https://example.com/products/asus-vg27aq.jpg' },
        { name: 'S2721DGF 27" 1440p 165Hz', brand: 'Dell', price: 299.99, image: 'https://example.com/products/dell-s2721dgf.jpg' },
        { name: '27GN950-B 4K 144Hz Nano IPS', brand: 'LG', price: 799.99, image: 'https://example.com/products/lg-27gn950b.jpg' },
        { name: 'Odyssey G7 32" 1440p Curved', brand: 'Samsung', price: 599.99, image: 'https://example.com/products/samsung-g7-32.jpg' },
        { name: 'ROG Swift PG279QM 27" 240Hz', brand: 'ASUS', price: 699.99, image: 'https://example.com/products/asus-pg279qm.jpg' }
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
                    brandsId: brand.id,
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