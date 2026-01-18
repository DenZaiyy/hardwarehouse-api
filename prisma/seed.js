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
        { name: 'Core i9-13900K', brand: 'Intel', price: 589.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Ryzen 9 7950X', brand: 'AMD', price: 699.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Core i7-13700K', brand: 'Intel', price: 419.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Ryzen 7 7800X3D', brand: 'AMD', price: 449.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Core i5-13600K', brand: 'Intel', price: 319.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Ryzen 5 7600X', brand: 'AMD', price: 279.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Cartes mères': [
        { name: 'ROG STRIX Z790-E Gaming', brand: 'ASUS', price: 459.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'MAG B650 TOMAHAWK WiFi', brand: 'MSI', price: 219.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Z790 AORUS ELITE AX', brand: 'Gigabyte', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'B650M PRO B WiFi', brand: 'ASRock', price: 129.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'TUF Gaming B550-PLUS', brand: 'ASUS', price: 159.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Mémoire RAM': [
        { name: 'Vengeance LPX 32GB DDR4-3200', brand: 'Corsair', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Trident Z5 32GB DDR5-6000', brand: 'G.Skill', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Fury Beast 16GB DDR4-3200', brand: 'Kingston', price: 49.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Ballistix 64GB DDR4-3600', brand: 'Crucial', price: 199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Vengeance RGB Pro 16GB DDR4-3600', brand: 'Corsair', price: 69.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Cartes graphiques': [
        { name: 'GeForce RTX 4090', brand: 'NVIDIA', price: 1599.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Radeon RX 7900 XTX', brand: 'AMD', price: 999.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'GeForce RTX 4070 Ti', brand: 'NVIDIA', price: 799.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Radeon RX 7800 XT', brand: 'AMD', price: 499.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'GeForce RTX 4060', brand: 'NVIDIA', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'ROG Strix RTX 4080', brand: 'ASUS', price: 1199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Disques durs': [
        { name: 'Barracuda 2TB 7200RPM', brand: 'Seagate', price: 54.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Blue 1TB 7200RPM', brand: 'Western Digital', price: 39.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'P300 3TB 7200RPM', brand: 'Toshiba', price: 79.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'IronWolf 4TB NAS', brand: 'Seagate', price: 119.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'SSD': [
        { name: '980 PRO 1TB NVMe', brand: 'Samsung', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Black SN850X 2TB NVMe', brand: 'Western Digital', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'MX4 500GB SATA', brand: 'Crucial', price: 49.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'NV2 1TB NVMe', brand: 'Kingston', price: 59.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: '990 EVO 2TB NVMe', brand: 'Samsung', price: 149.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Boîtiers': [
        { name: 'Define 7 ATX Mid Tower', brand: 'Fractal Design', price: 169.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'H510 Elite Mid Tower', brand: 'NZXT', price: 149.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: '4000D Airflow Mid Tower', brand: 'Corsair', price: 104.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'MasterBox Q300L mITX', brand: 'Cooler Master', price: 39.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'H7 Flow Mid Tower', brand: 'NZXT', price: 139.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Alimentations': [
        { name: 'RM850x 850W 80+ Gold Modular', brand: 'Corsair', price: 139.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Focus GX-750 750W 80+ Gold', brand: 'Seasonic', price: 119.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'SuperNOVA 650 P6 80+ Platinum', brand: 'EVGA', price: 99.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Straight Power 11 600W 80+ Gold', brand: 'be quiet!', price: 89.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'HX1000 1000W 80+ Platinum', brand: 'Corsair', price: 219.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Périphériques': [
        { name: 'MX Master 3S Wireless Mouse', brand: 'Logitech', price: 99.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'K95 RGB Platinum Mechanical', brand: 'Corsair', price: 199.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'DeathAdder V3 Gaming Mouse', brand: 'Razer', price: 69.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Apex Pro Mechanical Keyboard', brand: 'SteelSeries', price: 179.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'G Pro X Superlight 2', brand: 'Logitech', price: 159.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ],
    'Écrans': [
        { name: 'TUF Gaming VG27AQ 27" 1440p', brand: 'ASUS', price: 329.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'S2721DGF 27" 1440p 165Hz', brand: 'Dell', price: 299.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: '27GN950-B 4K 144Hz Nano IPS', brand: 'LG', price: 799.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'Odyssey G7 32" 1440p Curved', brand: 'Samsung', price: 599.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true },
        { name: 'ROG Swift PG279QM 27" 240Hz', brand: 'ASUS', price: 699.99, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', active: true }
    ]
};

async function main() {
    console.log('🌱 Début du seeding...');

    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.productAttributeValues.deleteMany({});
    await prisma.stocks.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.categoryAttributes.deleteMany({});
    await prisma.attributes.deleteMany({});
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

    // Données des attributs par catégorie
    const attributesData = {
        'Processeurs': [
            { name: 'Socket', type: 'TEXT', required: true },
            { name: 'Nombre de cœurs', type: 'NUMBER', required: true },
            { name: 'Nombre de threads', type: 'NUMBER', required: true },
            { name: 'Fréquence de base (GHz)', type: 'NUMBER', required: true },
            { name: 'Cache L3 (MB)', type: 'NUMBER', required: false },
            { name: 'TDP (W)', type: 'NUMBER', required: false },
            { name: 'Graphiques intégrés', type: 'BOOLEAN', required: false }
        ],
        'Cartes mères': [
            { name: 'Socket', type: 'TEXT', required: true },
            { name: 'Format', type: 'SELECT', required: true },
            { name: 'Chipset', type: 'TEXT', required: true },
            { name: 'Slots mémoire', type: 'NUMBER', required: true },
            { name: 'Mémoire maximale (GB)', type: 'NUMBER', required: true },
            { name: 'WiFi intégré', type: 'BOOLEAN', required: false },
            { name: 'Bluetooth intégré', type: 'BOOLEAN', required: false }
        ],
        'Mémoire RAM': [
            { name: 'Type DDR', type: 'SELECT', required: true },
            { name: 'Fréquence (MHz)', type: 'NUMBER', required: true },
            { name: 'Capacité (GB)', type: 'NUMBER', required: true },
            { name: 'Latence CAS', type: 'NUMBER', required: false },
            { name: 'RGB', type: 'BOOLEAN', required: false }
        ],
        'Cartes graphiques': [
            { name: 'Chipset GPU', type: 'TEXT', required: true },
            { name: 'VRAM (GB)', type: 'NUMBER', required: true },
            { name: 'Type VRAM', type: 'TEXT', required: true },
            { name: 'Fréquence de base (MHz)', type: 'NUMBER', required: false },
            { name: 'Connecteurs d\'alimentation', type: 'TEXT', required: false },
            { name: 'Ray Tracing', type: 'BOOLEAN', required: false }
        ],
        'Disques durs': [
            { name: 'Capacité (TB)', type: 'NUMBER', required: true },
            { name: 'Vitesse de rotation (RPM)', type: 'NUMBER', required: true },
            { name: 'Interface', type: 'TEXT', required: true },
            { name: 'Cache (MB)', type: 'NUMBER', required: false }
        ],
        'SSD': [
            { name: 'Capacité (GB)', type: 'NUMBER', required: true },
            { name: 'Interface', type: 'TEXT', required: true },
            { name: 'Lecture séquentielle (MB/s)', type: 'NUMBER', required: false },
            { name: 'Écriture séquentielle (MB/s)', type: 'NUMBER', required: false },
            { name: 'Type de mémoire', type: 'TEXT', required: false }
        ],
        'Boîtiers': [
            { name: 'Format', type: 'SELECT', required: true },
            { name: 'Matériau', type: 'TEXT', required: false },
            { name: 'Ventilateurs inclus', type: 'NUMBER', required: false },
            { name: 'Panneau transparent', type: 'BOOLEAN', required: false }
        ],
        'Alimentations': [
            { name: 'Puissance (W)', type: 'NUMBER', required: true },
            { name: 'Certification', type: 'TEXT', required: true },
            { name: 'Modulaire', type: 'BOOLEAN', required: false },
            { name: 'Format', type: 'TEXT', required: false }
        ],
        'Périphériques': [
            { name: 'Type', type: 'SELECT', required: true },
            { name: 'Sans fil', type: 'BOOLEAN', required: false },
            { name: 'RGB', type: 'BOOLEAN', required: false },
            { name: 'Interface', type: 'TEXT', required: false }
        ],
        'Écrans': [
            { name: 'Taille (pouces)', type: 'NUMBER', required: true },
            { name: 'Résolution', type: 'TEXT', required: true },
            { name: 'Taux de rafraîchissement (Hz)', type: 'NUMBER', required: true },
            { name: 'Type de dalle', type: 'TEXT', required: false },
            { name: 'Incurvé', type: 'BOOLEAN', required: false },
            { name: 'G-Sync/FreeSync', type: 'TEXT', required: false }
        ]
    };

    console.log('🏷️ Création des attributs et associations avec les catégories...');
    let totalAttributes = 0;
    let totalCategoryAttributes = 0;

    // Créer les attributs et les associer aux catégories
    for (const [categoryName, attributes] of Object.entries(attributesData)) {
        const category = createdCategories[categoryName];

        if (!category) {
            console.warn(`⚠️ Catégorie non trouvée pour les attributs: ${categoryName}`);
            continue;
        }

        for (const [index, attributeData] of attributes.entries()) {
            // Créer l'attribut
            const attribute = await prisma.attributes.create({
                data: {
                    name: attributeData.name,
                    type: attributeData.type,
                },
            });

            // Associer l'attribut à la catégorie
            await prisma.categoryAttributes.create({
                data: {
                    categoryId: category.id,
                    attributeId: attribute.id,
                    required: attributeData.required,
                    displayOrder: index + 1,
                },
            });

            totalAttributes++;
            totalCategoryAttributes++;
            console.log(`✅ Attribut créé: ${attributeData.name} (${attributeData.type}) pour ${categoryName}`);
        }
    }

    console.log('🛍️ Création des produits...');
    let totalProducts = 0;
    const createdProducts = [];

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

            // Créer le produit
            const product = await prisma.products.create({
                data: {
                    name: productData.name,
                    slug: slugify(productData.name, { lower: true, strict: true, locale: 'fr' }),
                    price: productData.price,
                    image: productData.image,
                    categoryId: category.id,
                    brandId: brand.id,
                    active: productData.active
                },
            });

            // Créer le stock pour ce produit
            const randomStock = Math.floor(Math.random() * 50) + 1; // Stock entre 1 et 50
            const randomMinStock = Math.floor(Math.random() * 30) + 1;
            
            await prisma.stocks.create({
                data: {
                    productId: product.id,
                    quantity: randomStock,
                    minQuantity: randomMinStock,
                },
            });

            // Stocker le produit créé pour les attributs
            createdProducts.push({
                product: product,
                categoryName: categoryName,
                productData: productData
            });

            totalProducts++;
            console.log(`✅ Produit créé: ${productData.brand} ${product.name} (stock: ${randomStock})`);
        }
    }

    console.log('🏷️ Création des valeurs d\'attributs pour les produits...');
    let totalProductAttributeValues = 0;

    // Créer les valeurs d'attributs pour chaque produit
    for (const productInfo of createdProducts) {
        const { product, categoryName } = productInfo;
        
        // Récupérer les attributs de cette catégorie
        const categoryAttributes = await prisma.categoryAttributes.findMany({
            where: {
                category: {
                    name: categoryName
                }
            },
            include: {
                attribute: true
            }
        });

        // Générer des valeurs d'attributs selon le type de produit
        for (const categoryAttribute of categoryAttributes) {
            const attribute = categoryAttribute.attribute;
            let value = '';

            // Générer des valeurs réalistes selon la catégorie et l'attribut
            if (categoryName === 'Processeurs') {
                if (attribute.name === 'Socket') {
                    value = product.name.includes('Intel') ? (product.name.includes('13') ? 'LGA1700' : 'LGA1151') : 
                           (product.name.includes('7000') ? 'AM5' : 'AM4');
                } else if (attribute.name === 'Nombre de cœurs') {
                    value = product.name.includes('i9') || product.name.includes('7950') ? '16' :
                           product.name.includes('i7') || product.name.includes('7800') ? '8' : '6';
                } else if (attribute.name === 'Nombre de threads') {
                    value = product.name.includes('i9') || product.name.includes('7950') ? '24' :
                           product.name.includes('i7') || product.name.includes('7800') ? '16' : '12';
                } else if (attribute.name === 'Fréquence de base (GHz)') {
                    value = (3.0 + Math.random() * 2.0).toFixed(1);
                } else if (attribute.name === 'Cache L3 (MB)') {
                    value = product.name.includes('i9') || product.name.includes('7950') ? '36' : '24';
                } else if (attribute.name === 'TDP (W)') {
                    value = product.name.includes('i9') || product.name.includes('7950') ? '125' : '65';
                } else if (attribute.name === 'Graphiques intégrés') {
                    value = product.name.includes('Intel') ? 'true' : 'false';
                }
            } else if (categoryName === 'Cartes graphiques') {
                if (attribute.name === 'Chipset GPU') {
                    value = product.name.includes('RTX') ? product.name.split(' ')[1] + ' ' + product.name.split(' ')[2] :
                           product.name.includes('RX') ? 'Radeon ' + product.name.split(' ')[1] + ' ' + product.name.split(' ')[2] : 'Unknown';
                } else if (attribute.name === 'VRAM (GB)') {
                    value = product.name.includes('4090') ? '24' :
                           product.name.includes('4080') || product.name.includes('7900') ? '16' :
                           product.name.includes('4070') || product.name.includes('7800') ? '12' : '8';
                } else if (attribute.name === 'Type VRAM') {
                    value = product.name.includes('RTX') ? 'GDDR6X' : 'GDDR6';
                } else if (attribute.name === 'Fréquence de base (MHz)') {
                    value = (1500 + Math.random() * 700).toFixed(0);
                } else if (attribute.name === 'Ray Tracing') {
                    value = product.name.includes('RTX') || product.name.includes('7900') || product.name.includes('7800') ? 'true' : 'false';
                }
            } else if (categoryName === 'Mémoire RAM') {
                if (attribute.name === 'Type DDR') {
                    value = product.name.includes('DDR5') ? 'DDR5' : 'DDR4';
                } else if (attribute.name === 'Fréquence (MHz)') {
                    value = product.name.includes('DDR5') ? '6000' :
                           product.name.includes('3600') ? '3600' : '3200';
                } else if (attribute.name === 'Capacité (GB)') {
                    value = product.name.includes('64GB') ? '64' :
                           product.name.includes('32GB') ? '32' : '16';
                } else if (attribute.name === 'RGB') {
                    value = product.name.includes('RGB') ? 'true' : 'false';
                }
            } else if (categoryName === 'Écrans') {
                if (attribute.name === 'Taille (pouces)') {
                    value = product.name.includes('27') ? '27' :
                           product.name.includes('32') ? '32' : '24';
                } else if (attribute.name === 'Résolution') {
                    value = product.name.includes('4K') ? '3840x2160' : '2560x1440';
                } else if (attribute.name === 'Taux de rafraîchissement (Hz)') {
                    value = product.name.includes('240Hz') ? '240' :
                           product.name.includes('165Hz') ? '165' :
                           product.name.includes('144Hz') ? '144' : '60';
                } else if (attribute.name === 'Incurvé') {
                    value = product.name.includes('Curved') ? 'true' : 'false';
                }
            } else {
                // Valeurs génériques pour les autres catégories
                if (attribute.type === 'BOOLEAN') {
                    value = Math.random() > 0.5 ? 'true' : 'false';
                } else if (attribute.type === 'NUMBER') {
                    value = (Math.random() * 100 + 1).toFixed(0);
                } else {
                    value = `Valeur ${attribute.name}`;
                }
            }

            if (value) {
                await prisma.productAttributeValues.create({
                    data: {
                        productId: product.id,
                        categoryAttributeId: categoryAttribute.id,
                        value: value
                    }
                });
                totalProductAttributeValues++;
            }
        }
        
        console.log(`✅ Attributs créés pour: ${product.name}`);
    }

    console.log('\n📊 Résumé du seeding:');
    console.log(`🏷️ Marques créées: ${Object.keys(createdBrands).length}`);
    console.log(`📂 Catégories créées: ${Object.keys(createdCategories).length}`);
    console.log(`🏷️ Attributs créés: ${totalAttributes}`);
    console.log(`🔗 Associations catégorie-attribut créées: ${totalCategoryAttributes}`);
    console.log(`🛍️ Produits créés: ${totalProducts}`);
    console.log(`📦 Stocks créés: ${totalProducts}`);
    console.log(`🎯 Valeurs d'attributs créées: ${totalProductAttributeValues}`);
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