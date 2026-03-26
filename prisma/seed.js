// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const slugify = require('slugify');

const prisma = new PrismaClient();

const productIdentifiers = {
    'core i9-13900k': {
        mpn: 'BX8071513900K',
        ean13: '5032037258647',
    },
    'ryzen 9 7950x': {
        mpn: '100-100000514WOF',
        ean13: '0730143314534',
    },
    'core i7-13700k': {
        mpn: 'BX8071513700K',
        ean13: '5032037258708',
    },
    'ryzen 7 7800x3d': {
        mpn: '100-100000910WOF',
        ean13: '0730143314930',
    },
    'ryzen 5 7600x': {
        mpn: '100-100000593WOF',
        ean13: '0730143314442',
    },
    'rog strix z790-e gaming wifi': {
        mpn: '90MB1CL0-M0EAY0',
        ean13: '4711081938538',
    },
    'mag b650 tomahawk wifi': {
        mpn: '7D75-001R',
        ean13: '4711377010153',
    },
    'tuf gaming b550-plus': {
        mpn: '90MB14G0',
        ean13: '4718017749435',
    },
    '980 pro 1tb nvme': {
        mpn: 'MZ-V8P1T0BW',
        ean13: null,
    },
    'nv2 1tb nvme': {
        mpn: 'SNV2S/1000G',
        ean13: null,
    },
    's2721dgf 27" 1440p 165hz': {
        mpn: '210-AXEH',
        ean13: '5397184200803',
    },
};

function normalizeName(value) {
    return value.trim().toLowerCase();
}

function buildSku({ categoryName, brandName, productName }) {
    const categoryCodeMap = {
        Processeurs: 'CPU',
        'Cartes mères': 'MB',
        'Mémoire RAM': 'RAM',
        'Cartes graphiques': 'GPU',
        'Disques durs': 'HDD',
        SSD: 'SSD',
        'Boîtiers': 'CASE',
        Alimentations: 'PSU',
        'Périphériques': 'PERI',
        'Écrans': 'MON',
    };

    const categoryCode = categoryCodeMap[categoryName] ?? 'PRD';
    const brandCode = slugify(brandName, { lower: false, strict: true, locale: 'fr' })
        .toUpperCase()
        .slice(0, 6);

    const productCode = slugify(productName, { lower: false, strict: true, locale: 'fr' })
        .toUpperCase()
        .slice(0, 24);

    return `${categoryCode}-${brandCode}-${productCode}`;
}

function buildImageSet(seed) {
    return {
        thumbnail: `https://picsum.photos/400/400?random=${seed}`,
        images: [
            `https://picsum.photos/800/800?random=${seed}`,
            `https://picsum.photos/800/800?random=${seed + 1}`,
            `https://picsum.photos/800/800?random=${seed + 2}`,
        ],
    };
}

// Données des marques
const brandsData = [
    { name: 'Intel', logo: 'https://picsum.photos/200/200?random=1' },
    { name: 'AMD', logo: 'https://picsum.photos/200/200?random=2' },
    { name: 'NVIDIA', logo: 'https://picsum.photos/200/200?random=3' },
    { name: 'ASUS', logo: 'https://picsum.photos/200/200?random=4' },
    { name: 'MSI', logo: 'https://picsum.photos/200/200?random=5' },
    { name: 'Gigabyte', logo: 'https://picsum.photos/200/200?random=6' },
    { name: 'ASRock', logo: 'https://picsum.photos/200/200?random=7' },
    { name: 'Corsair', logo: 'https://picsum.photos/200/200?random=8' },
    { name: 'G.Skill', logo: 'https://picsum.photos/200/200?random=9' },
    { name: 'Kingston', logo: 'https://picsum.photos/200/200?random=10' },
    { name: 'Crucial', logo: 'https://picsum.photos/200/200?random=11' },
    { name: 'Samsung', logo: 'https://picsum.photos/200/200?random=12' },
    { name: 'Western Digital', logo: 'https://picsum.photos/200/200?random=13' },
    { name: 'Seagate', logo: 'https://picsum.photos/200/200?random=14' },
    { name: 'Toshiba', logo: 'https://picsum.photos/200/200?random=15' },
    { name: 'Fractal Design', logo: 'https://picsum.photos/200/200?random=16' },
    { name: 'NZXT', logo: 'https://picsum.photos/200/200?random=17' },
    { name: 'Cooler Master', logo: 'https://picsum.photos/200/200?random=18' },
    { name: 'Seasonic', logo: 'https://picsum.photos/200/200?random=19' },
    { name: 'EVGA', logo: 'https://picsum.photos/200/200?random=20' },
    { name: 'be quiet!', logo: 'https://picsum.photos/200/200?random=21' },
    { name: 'Logitech', logo: 'https://picsum.photos/200/200?random=22' },
    { name: 'Razer', logo: 'https://picsum.photos/200/200?random=23' },
    { name: 'SteelSeries', logo: 'https://picsum.photos/200/200?random=24' },
    { name: 'Dell', logo: 'https://picsum.photos/200/200?random=25' },
    { name: 'LG', logo: 'https://picsum.photos/200/200?random=26' },
];

// Données des catégories
const categoriesData = [
    { name: 'Processeurs', logo: 'https://picsum.photos/300/300?random=101' },
    { name: 'Cartes mères', logo: 'https://picsum.photos/300/300?random=102' },
    { name: 'Mémoire RAM', logo: 'https://picsum.photos/300/300?random=103' },
    { name: 'Cartes graphiques', logo: 'https://picsum.photos/300/300?random=104' },
    { name: 'Disques durs', logo: 'https://picsum.photos/300/300?random=105' },
    { name: 'SSD', logo: 'https://picsum.photos/300/300?random=106' },
    { name: 'Boîtiers', logo: 'https://picsum.photos/300/300?random=107' },
    { name: 'Alimentations', logo: 'https://picsum.photos/300/300?random=108' },
    { name: 'Périphériques', logo: 'https://picsum.photos/300/300?random=109' },
    { name: 'Écrans', logo: 'https://picsum.photos/300/300?random=110' },
];

function buildProduct(seed) {
    return {
        name: seed.name,
        brand: seed.brand,
        price: seed.price,
        thumbnail: seed.thumbnail,
        images: seed.images,
        shortDescription: seed.shortDescription,
        description: seed.description,
        active: true,
    };
}

function cpuDescription(name, brand) {
    return `Le processeur ${brand} ${name} offre d'excellentes performances pour le gaming, la productivité et les usages avancés. Il s'intègre parfaitement dans une configuration moderne orientée performance et évolutivité.`;
}

function motherboardDescription(name, brand) {
    return `La carte mère ${brand} ${name} propose une plateforme stable et moderne avec une connectique complète, un étage d'alimentation solide et une bonne compatibilité pour les configurations gaming et polyvalentes.`;
}

function ramDescription(name, brand) {
    return `Le kit mémoire ${brand} ${name} améliore la réactivité globale du système avec un bon équilibre entre fréquence, capacité et stabilité. Il convient parfaitement à une configuration gaming ou créative.`;
}

function gpuDescription(name, brand) {
    return `La carte graphique ${brand} ${name} est conçue pour offrir de solides performances en jeu avec prise en charge des technologies graphiques modernes. Elle convient aussi bien au gaming qu'aux usages créatifs accélérés par GPU.`;
}

function hddDescription(name, brand) {
    return `Le disque dur ${brand} ${name} constitue une solution fiable pour le stockage massif, les sauvegardes et les bibliothèques multimédias. Il est adapté à un usage quotidien comme à un environnement domestique avancé.`;
}

function ssdDescription(name, brand) {
    return `Le SSD ${brand} ${name} apporte un excellent niveau de réactivité au système avec de bonnes performances de lecture et d'écriture. Il constitue un très bon choix pour un PC gaming ou bureautique moderne.`;
}

function caseDescription(name, brand) {
    return `Le boîtier ${brand} ${name} combine design, airflow et facilité de montage. Il convient à différents types de configurations et met l'accent sur la compatibilité et l'organisation interne.`;
}

function psuDescription(name, brand) {
    return `L'alimentation ${brand} ${name} fournit une puissance stable et efficace pour sécuriser l'ensemble de la configuration. Elle convient parfaitement aux PC gaming et aux stations de travail exigeantes.`;
}

function peripheralDescription(name, brand) {
    return `Le périphérique ${brand} ${name} a été pensé pour offrir confort, précision et fiabilité, aussi bien pour le gaming que pour la productivité quotidienne.`;
}

function monitorDescription(name, brand) {
    return `L'écran ${brand} ${name} offre une expérience visuelle fluide et détaillée, adaptée au gaming comme à la productivité. Il combine une bonne qualité d'image avec des caractéristiques modernes.`;
}

function generateCpuProducts() {
    const models = [
        { brand: 'Intel', name: 'Core i5-13400F', price: 209.99 },
        { brand: 'Intel', name: 'Core i5-13600K', price: 319.99 },
        { brand: 'Intel', name: 'Core i5-14600K', price: 349.99 },
        { brand: 'Intel', name: 'Core i7-13700K', price: 419.99 },
        { brand: 'Intel', name: 'Core i7-14700K', price: 469.99 },
        { brand: 'Intel', name: 'Core i9-13900K', price: 589.99 },
        { brand: 'Intel', name: 'Core i9-14900K', price: 649.99 },
        { brand: 'Intel', name: 'Core i7-12700KF', price: 299.99 },
        { brand: 'Intel', name: 'Core i5-12600K', price: 249.99 },
        { brand: 'Intel', name: 'Core i3-13100F', price: 129.99 },

        { brand: 'AMD', name: 'Ryzen 5 5600', price: 129.99 },
        { brand: 'AMD', name: 'Ryzen 5 5600X', price: 159.99 },
        { brand: 'AMD', name: 'Ryzen 5 7600', price: 239.99 },
        { brand: 'AMD', name: 'Ryzen 5 7600X', price: 279.99 },
        { brand: 'AMD', name: 'Ryzen 7 5700X', price: 199.99 },
        { brand: 'AMD', name: 'Ryzen 7 5800X3D', price: 309.99 },
        { brand: 'AMD', name: 'Ryzen 7 7700X', price: 349.99 },
        { brand: 'AMD', name: 'Ryzen 7 7800X3D', price: 449.99 },
        { brand: 'AMD', name: 'Ryzen 9 7900X', price: 479.99 },
        { brand: 'AMD', name: 'Ryzen 9 7950X', price: 699.99 },
        { brand: 'AMD', name: 'Ryzen 9 7950X3D', price: 749.99 },
        { brand: 'AMD', name: 'Ryzen 7 8700G', price: 329.99 },
        { brand: 'AMD', name: 'Ryzen 5 8600G', price: 239.99 },
        { brand: 'Intel', name: 'Core Ultra 7 265K', price: 489.99 },
        { brand: 'Intel', name: 'Core Ultra 5 245K', price: 359.99 },
        { brand: 'AMD', name: 'Ryzen 9 9900X', price: 559.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(2000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Processeur ${model.brand} ${model.name} pour gaming et productivité`,
            description: cpuDescription(model.name, model.brand),
        });
    });
}

function generateMotherboardProducts() {
    const models = [
        { brand: 'ASUS', name: 'ROG STRIX Z790-E Gaming WiFi', price: 459.99 },
        { brand: 'ASUS', name: 'TUF Gaming B550-PLUS', price: 159.99 },
        { brand: 'ASUS', name: 'PRIME B760-PLUS', price: 149.99 },
        { brand: 'ASUS', name: 'ROG STRIX B650-A Gaming WiFi', price: 249.99 },
        { brand: 'ASUS', name: 'TUF Gaming X670E-PLUS WiFi', price: 329.99 },

        { brand: 'MSI', name: 'MAG B650 TOMAHAWK WiFi', price: 219.99 },
        { brand: 'MSI', name: 'PRO B760-P WiFi', price: 169.99 },
        { brand: 'MSI', name: 'MAG Z790 TOMAHAWK MAX WiFi', price: 319.99 },
        { brand: 'MSI', name: 'PRO B650M-A WiFi', price: 149.99 },
        { brand: 'MSI', name: 'MPG X670E Carbon WiFi', price: 429.99 },

        { brand: 'Gigabyte', name: 'Z790 AORUS ELITE AX', price: 299.99 },
        { brand: 'Gigabyte', name: 'B650 AORUS ELITE AX', price: 229.99 },
        { brand: 'Gigabyte', name: 'B760 Gaming X AX', price: 179.99 },
        { brand: 'Gigabyte', name: 'X670 AORUS ELITE AX', price: 299.99 },
        { brand: 'Gigabyte', name: 'B550 AORUS ELITE V2', price: 139.99 },

        { brand: 'ASRock', name: 'B650M PRO RS WiFi', price: 159.99 },
        { brand: 'ASRock', name: 'B650M PRO B WiFi', price: 129.99 },
        { brand: 'ASRock', name: 'Z790 Steel Legend WiFi', price: 279.99 },
        { brand: 'ASRock', name: 'B760M Steel Legend WiFi', price: 189.99 },
        { brand: 'ASRock', name: 'X670E Pro RS', price: 289.99 },

        { brand: 'ASUS', name: 'PRIME X670-P WiFi', price: 279.99 },
        { brand: 'MSI', name: 'MAG B550 TOMAHAWK', price: 159.99 },
        { brand: 'Gigabyte', name: 'Z690 UD AX DDR4', price: 199.99 },
        { brand: 'ASRock', name: 'B550 Phantom Gaming 4', price: 109.99 },
        { brand: 'ASUS', name: 'ROG STRIX B760-F Gaming WiFi', price: 249.99 },
        { brand: 'MSI', name: 'PRO Z790-A MAX WiFi', price: 269.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(3000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Carte mère ${model.brand} ${model.name} pour configuration moderne`,
            description: motherboardDescription(model.name, model.brand),
        });
    });
}

function generateRamProducts() {
    const models = [
        { brand: 'Corsair', name: 'Vengeance LPX 16GB DDR4-3200', price: 49.99 },
        { brand: 'Corsair', name: 'Vengeance LPX 32GB DDR4-3200', price: 89.99 },
        { brand: 'Corsair', name: 'Vengeance RGB Pro 16GB DDR4-3600', price: 69.99 },
        { brand: 'Corsair', name: 'Vengeance RGB DDR5 32GB 6000', price: 149.99 },
        { brand: 'Corsair', name: 'Dominator Platinum RGB 32GB DDR5-6200', price: 219.99 },

        { brand: 'G.Skill', name: 'Trident Z5 32GB DDR5-6000', price: 179.99 },
        { brand: 'G.Skill', name: 'Trident Z Neo 32GB DDR5-6000', price: 189.99 },
        { brand: 'G.Skill', name: 'Ripjaws V 16GB DDR4-3200', price: 44.99 },
        { brand: 'G.Skill', name: 'Ripjaws S5 32GB DDR5-5600', price: 139.99 },
        { brand: 'G.Skill', name: 'Flare X5 32GB DDR5-6000', price: 159.99 },

        { brand: 'Kingston', name: 'Fury Beast 16GB DDR4-3200', price: 49.99 },
        { brand: 'Kingston', name: 'Fury Beast 32GB DDR5-5600', price: 129.99 },
        { brand: 'Kingston', name: 'Fury Renegade 32GB DDR5-6400', price: 199.99 },
        { brand: 'Kingston', name: 'Fury Beast RGB 16GB DDR4-3600', price: 69.99 },
        { brand: 'Kingston', name: 'ValueRAM 16GB DDR4-3200', price: 39.99 },

        { brand: 'Crucial', name: 'Pro 32GB DDR5-5600', price: 119.99 },
        { brand: 'Crucial', name: 'Ballistix 32GB DDR4-3600', price: 109.99 },
        { brand: 'Crucial', name: 'Ballistix 64GB DDR4-3600', price: 199.99 },
        { brand: 'Crucial', name: 'Pro 64GB DDR5-6000', price: 239.99 },
        { brand: 'Crucial', name: 'Classic 16GB DDR4-3200', price: 42.99 },

        { brand: 'Corsair', name: 'Vengeance 64GB DDR5-6000', price: 249.99 },
        { brand: 'G.Skill', name: 'Trident Z5 RGB 48GB DDR5-6800', price: 289.99 },
        { brand: 'Kingston', name: 'Fury Beast 64GB DDR5-6000', price: 259.99 },
        { brand: 'Crucial', name: 'Pro 96GB DDR5-5600', price: 349.99 },
        { brand: 'Corsair', name: 'Vengeance LPX 64GB DDR4-3200', price: 169.99 },
        { brand: 'G.Skill', name: 'Ripjaws V 32GB DDR4-3600', price: 99.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(4000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Mémoire ${model.brand} ${model.name} pour PC gaming et productif`,
            description: ramDescription(model.name, model.brand),
        });
    });
}

function generateGpuProducts() {
    const models = [
        { brand: 'NVIDIA', name: 'GeForce RTX 4060 8GB', price: 299.99 },
        { brand: 'NVIDIA', name: 'GeForce RTX 4060 Ti 8GB', price: 399.99 },
        { brand: 'NVIDIA', name: 'GeForce RTX 4070 12GB', price: 599.99 },
        { brand: 'NVIDIA', name: 'GeForce RTX 4070 Ti SUPER 16GB', price: 849.99 },
        { brand: 'NVIDIA', name: 'GeForce RTX 4080 SUPER 16GB', price: 1099.99 },
        { brand: 'NVIDIA', name: 'GeForce RTX 4090 24GB', price: 1599.99 },

        { brand: 'AMD', name: 'Radeon RX 7600 8GB', price: 279.99 },
        { brand: 'AMD', name: 'Radeon RX 7700 XT 12GB', price: 449.99 },
        { brand: 'AMD', name: 'Radeon RX 7800 XT 16GB', price: 499.99 },
        { brand: 'AMD', name: 'Radeon RX 7900 GRE 16GB', price: 599.99 },
        { brand: 'AMD', name: 'Radeon RX 7900 XT 20GB', price: 799.99 },
        { brand: 'AMD', name: 'Radeon RX 7900 XTX 24GB', price: 999.99 },

        { brand: 'ASUS', name: 'Dual GeForce RTX 4060 OC 8GB', price: 329.99 },
        { brand: 'ASUS', name: 'TUF Gaming Radeon RX 7800 XT OC 16GB', price: 559.99 },
        { brand: 'ASUS', name: 'ROG Strix RTX 4080 SUPER OC 16GB', price: 1299.99 },

        { brand: 'MSI', name: 'Ventus 2X RTX 4060 Ti OC 8GB', price: 429.99 },
        { brand: 'MSI', name: 'Gaming X Slim RTX 4070 SUPER 12GB', price: 699.99 },
        { brand: 'MSI', name: 'Gaming Trio RX 7900 XTX 24GB', price: 1099.99 },

        { brand: 'Gigabyte', name: 'Gaming OC RTX 4070 12GB', price: 649.99 },
        { brand: 'Gigabyte', name: 'AORUS Master RTX 4090 24GB', price: 1799.99 },
        { brand: 'Gigabyte', name: 'Gaming OC RX 7800 XT 16GB', price: 539.99 },

        { brand: 'ASRock', name: 'Phantom Gaming RX 7700 XT 12GB', price: 469.99 },
        { brand: 'ASRock', name: 'Challenger RX 7600 8GB', price: 289.99 },
        { brand: 'ASRock', name: 'Taichi RX 7900 XTX 24GB', price: 1149.99 },

        { brand: 'EVGA', name: 'FTW3 RTX 3080 10GB', price: 699.99 },
        { brand: 'EVGA', name: 'XC3 RTX 3070 8GB', price: 529.99 },
        { brand: 'MSI', name: 'SUPRIM X RTX 4080 SUPER 16GB', price: 1349.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(5000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Carte graphique ${model.brand} ${model.name} pour gaming moderne`,
            description: gpuDescription(model.name, model.brand),
        });
    });
}

function generateHddProducts() {
    const models = [
        { brand: 'Seagate', name: 'Barracuda 1TB 7200RPM', price: 39.99 },
        { brand: 'Seagate', name: 'Barracuda 2TB 7200RPM', price: 54.99 },
        { brand: 'Seagate', name: 'Barracuda 4TB 5400RPM', price: 89.99 },
        { brand: 'Seagate', name: 'IronWolf 4TB NAS', price: 119.99 },
        { brand: 'Seagate', name: 'IronWolf 8TB NAS', price: 219.99 },
        { brand: 'Seagate', name: 'SkyHawk 4TB Surveillance', price: 109.99 },
        { brand: 'Seagate', name: 'Exos X18 12TB Enterprise', price: 289.99 },
        { brand: 'Seagate', name: 'BarraCuda Pro 6TB 7200RPM', price: 179.99 },

        { brand: 'Western Digital', name: 'Blue 1TB 7200RPM', price: 39.99 },
        { brand: 'Western Digital', name: 'Blue 2TB 7200RPM', price: 59.99 },
        { brand: 'Western Digital', name: 'Black 4TB Performance', price: 189.99 },
        { brand: 'Western Digital', name: 'Red Plus 4TB NAS', price: 129.99 },
        { brand: 'Western Digital', name: 'Red Plus 8TB NAS', price: 239.99 },
        { brand: 'Western Digital', name: 'Purple 6TB Surveillance', price: 169.99 },
        { brand: 'Western Digital', name: 'Gold 10TB Enterprise', price: 329.99 },

        { brand: 'Toshiba', name: 'P300 1TB 7200RPM', price: 42.99 },
        { brand: 'Toshiba', name: 'P300 3TB 7200RPM', price: 79.99 },
        { brand: 'Toshiba', name: 'P300 6TB 7200RPM', price: 139.99 },
        { brand: 'Toshiba', name: 'X300 8TB Performance', price: 219.99 },
        { brand: 'Toshiba', name: 'N300 4TB NAS', price: 119.99 },
        { brand: 'Toshiba', name: 'N300 8TB NAS', price: 229.99 },
        { brand: 'Toshiba', name: 'S300 4TB Surveillance', price: 99.99 },
        { brand: 'Seagate', name: 'IronWolf Pro 12TB NAS', price: 349.99 },
        { brand: 'Western Digital', name: 'Ultrastar DC HC550 16TB', price: 449.99 },
        { brand: 'Toshiba', name: 'MG09 18TB Enterprise', price: 499.99 },
        { brand: 'Western Digital', name: 'Blue 4TB 5400RPM', price: 99.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(6000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Disque dur ${model.brand} ${model.name} pour stockage et sauvegarde`,
            description: hddDescription(model.name, model.brand),
        });
    });
}

function generateSsdProducts() {
    const models = [
        { brand: 'Samsung', name: '980 500GB NVMe', price: 49.99 },
        { brand: 'Samsung', name: '980 PRO 1TB NVMe', price: 89.99 },
        { brand: 'Samsung', name: '990 EVO 2TB NVMe', price: 149.99 },
        { brand: 'Samsung', name: '990 PRO 2TB NVMe', price: 199.99 },
        { brand: 'Samsung', name: '870 EVO 1TB SATA', price: 79.99 },

        { brand: 'Western Digital', name: 'Blue SN580 1TB NVMe', price: 69.99 },
        { brand: 'Western Digital', name: 'Blue SN580 2TB NVMe', price: 129.99 },
        { brand: 'Western Digital', name: 'Black SN770 1TB NVMe', price: 84.99 },
        { brand: 'Western Digital', name: 'Black SN850X 2TB NVMe', price: 179.99 },
        { brand: 'Western Digital', name: 'Blue SA510 1TB SATA', price: 69.99 },

        { brand: 'Kingston', name: 'NV2 500GB NVMe', price: 39.99 },
        { brand: 'Kingston', name: 'NV2 1TB NVMe', price: 59.99 },
        { brand: 'Kingston', name: 'KC3000 1TB NVMe', price: 89.99 },
        { brand: 'Kingston', name: 'KC3000 2TB NVMe', price: 159.99 },
        { brand: 'Kingston', name: 'A400 960GB SATA', price: 54.99 },

        { brand: 'Crucial', name: 'BX500 1TB SATA', price: 59.99 },
        { brand: 'Crucial', name: 'MX500 1TB SATA', price: 74.99 },
        { brand: 'Crucial', name: 'P3 1TB NVMe', price: 64.99 },
        { brand: 'Crucial', name: 'P3 Plus 2TB NVMe', price: 124.99 },
        { brand: 'Crucial', name: 'T500 2TB NVMe', price: 169.99 },

        { brand: 'Samsung', name: '970 EVO Plus 1TB NVMe', price: 79.99 },
        { brand: 'Western Digital', name: 'Green SN350 1TB NVMe', price: 54.99 },
        { brand: 'Kingston', name: 'NV3 2TB NVMe', price: 119.99 },
        { brand: 'Crucial', name: 'MX500 500GB SATA', price: 49.99 },
        { brand: 'Samsung', name: '870 EVO 2TB SATA', price: 139.99 },
        { brand: 'Western Digital', name: 'Black SN850X 1TB NVMe', price: 119.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(7000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `SSD ${model.brand} ${model.name} pour système rapide et réactif`,
            description: ssdDescription(model.name, model.brand),
        });
    });
}

function generateCaseProducts() {
    const models = [
        { brand: 'Fractal Design', name: 'Define 7 ATX Mid Tower', price: 169.99 },
        { brand: 'Fractal Design', name: 'Meshify 2 Compact TG', price: 129.99 },
        { brand: 'Fractal Design', name: 'North Charcoal TG', price: 149.99 },
        { brand: 'Fractal Design', name: 'Pop Air RGB TG', price: 109.99 },
        { brand: 'Fractal Design', name: 'Torrent Compact TG', price: 159.99 },

        { brand: 'NZXT', name: 'H5 Flow Mid Tower', price: 99.99 },
        { brand: 'NZXT', name: 'H6 Flow RGB', price: 139.99 },
        { brand: 'NZXT', name: 'H7 Flow Mid Tower', price: 139.99 },
        { brand: 'NZXT', name: 'H9 Flow Dual Chamber', price: 179.99 },
        { brand: 'NZXT', name: 'H510 Elite Mid Tower', price: 149.99 },

        { brand: 'Cooler Master', name: 'MasterBox Q300L mATX', price: 39.99 },
        { brand: 'Cooler Master', name: 'TD500 Mesh V2', price: 109.99 },
        { brand: 'Cooler Master', name: 'NR200P Mini-ITX', price: 99.99 },
        { brand: 'Cooler Master', name: 'HAF 500 ATX', price: 129.99 },
        { brand: 'Cooler Master', name: 'MasterBox 520 Mesh', price: 94.99 },

        { brand: 'Corsair', name: '4000D Airflow Mid Tower', price: 104.99 },
        { brand: 'Corsair', name: '3000D Airflow', price: 79.99 },
        { brand: 'Corsair', name: '5000D Airflow', price: 159.99 },
        { brand: 'Corsair', name: '6500X Dual Chamber', price: 199.99 },
        { brand: 'Corsair', name: 'iCUE 4000X RGB', price: 139.99 },

        { brand: 'be quiet!', name: 'Pure Base 500DX', price: 99.99 },
        { brand: 'be quiet!', name: 'Shadow Base 800 FX', price: 179.99 },
        { brand: 'be quiet!', name: 'Silent Base 802', price: 169.99 },
        { brand: 'Fractal Design', name: 'Focus 2 RGB TG', price: 89.99 },
        { brand: 'NZXT', name: 'H7 Elite RGB', price: 199.99 },
        { brand: 'Corsair', name: '7000D Airflow Full Tower', price: 249.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(8000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Boîtier ${model.brand} ${model.name} pour configuration gaming`,
            description: caseDescription(model.name, model.brand),
        });
    });
}

function generatePsuProducts() {
    const models = [
        { brand: 'Corsair', name: 'RM650e 650W 80+ Gold', price: 89.99 },
        { brand: 'Corsair', name: 'RM750e 750W 80+ Gold', price: 99.99 },
        { brand: 'Corsair', name: 'RM850x 850W 80+ Gold Modular', price: 139.99 },
        { brand: 'Corsair', name: 'HX1000 1000W 80+ Platinum', price: 219.99 },
        { brand: 'Corsair', name: 'CX550 550W 80+ Bronze', price: 64.99 },

        { brand: 'Seasonic', name: 'Focus GX-650 650W 80+ Gold', price: 99.99 },
        { brand: 'Seasonic', name: 'Focus GX-750 750W 80+ Gold', price: 119.99 },
        { brand: 'Seasonic', name: 'Focus GX-850 850W 80+ Gold', price: 139.99 },
        { brand: 'Seasonic', name: 'Vertex GX-1000 1000W 80+ Gold', price: 199.99 },
        { brand: 'Seasonic', name: 'Prime TX-850 850W 80+ Titanium', price: 249.99 },

        { brand: 'EVGA', name: '600 BR 600W 80+ Bronze', price: 59.99 },
        { brand: 'EVGA', name: '750 GT 750W 80+ Gold', price: 109.99 },
        { brand: 'EVGA', name: 'SuperNOVA 650 P6 80+ Platinum', price: 99.99 },
        { brand: 'EVGA', name: 'SuperNOVA 850 G7 80+ Gold', price: 149.99 },
        { brand: 'EVGA', name: 'SuperNOVA 1000 G6 80+ Gold', price: 189.99 },

        { brand: 'be quiet!', name: 'System Power 10 550W 80+ Bronze', price: 59.99 },
        { brand: 'be quiet!', name: 'Pure Power 12 M 750W 80+ Gold', price: 119.99 },
        { brand: 'be quiet!', name: 'Straight Power 11 600W 80+ Gold', price: 89.99 },
        { brand: 'be quiet!', name: 'Straight Power 12 850W 80+ Platinum', price: 169.99 },
        { brand: 'be quiet!', name: 'Dark Power 13 1000W 80+ Titanium', price: 279.99 },

        { brand: 'Cooler Master', name: 'MWE Bronze V2 650W', price: 69.99 },
        { brand: 'Cooler Master', name: 'MWE Gold 750 V2', price: 99.99 },
        { brand: 'Cooler Master', name: 'V850 Gold i 850W', price: 149.99 },
        { brand: 'Corsair', name: 'SF750 750W 80+ Platinum SFX', price: 169.99 },
        { brand: 'Seasonic', name: 'Core GX-650 650W Gold', price: 89.99 },
        { brand: 'be quiet!', name: 'Pure Power 12 M 850W 80+ Gold', price: 139.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(9000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Alimentation ${model.brand} ${model.name} pour configuration stable`,
            description: psuDescription(model.name, model.brand),
        });
    });
}

function generatePeripheralProducts() {
    const models = [
        { brand: 'Logitech', name: 'MX Master 3S Wireless Mouse', price: 99.99 },
        { brand: 'Logitech', name: 'G Pro X Superlight 2', price: 159.99 },
        { brand: 'Logitech', name: 'G502 X Lightspeed', price: 129.99 },
        { brand: 'Logitech', name: 'G915 TKL Lightspeed', price: 199.99 },
        { brand: 'Logitech', name: 'MX Keys S', price: 119.99 },
        { brand: 'Logitech', name: 'G Pro Mechanical Keyboard', price: 129.99 },
        { brand: 'Logitech', name: 'Lift Vertical Mouse', price: 69.99 },

        { brand: 'Razer', name: 'DeathAdder V3 Gaming Mouse', price: 69.99 },
        { brand: 'Razer', name: 'Basilisk V3 Pro', price: 169.99 },
        { brand: 'Razer', name: 'Viper V3 Pro', price: 179.99 },
        { brand: 'Razer', name: 'BlackWidow V4 Pro', price: 229.99 },
        { brand: 'Razer', name: 'Huntsman V3 Pro TKL', price: 249.99 },
        { brand: 'Razer', name: 'Ornata V3 X', price: 49.99 },

        { brand: 'SteelSeries', name: 'Apex Pro TKL Mechanical Keyboard', price: 199.99 },
        { brand: 'SteelSeries', name: 'Apex Pro Mini Wireless', price: 229.99 },
        { brand: 'SteelSeries', name: 'Aerox 3 Wireless', price: 99.99 },
        { brand: 'SteelSeries', name: 'Prime Mini Wireless', price: 89.99 },
        { brand: 'SteelSeries', name: 'Rival 5 RGB Mouse', price: 59.99 },
        { brand: 'SteelSeries', name: 'Apex 7 Red Switch', price: 159.99 },

        { brand: 'Corsair', name: 'K95 RGB Platinum Mechanical', price: 199.99 },
        { brand: 'Corsair', name: 'K70 RGB Pro', price: 169.99 },
        { brand: 'Corsair', name: 'Dark Core RGB Pro SE', price: 109.99 },
        { brand: 'Corsair', name: 'M65 RGB Ultra', price: 79.99 },
        { brand: 'Corsair', name: 'K55 RGB Pro XT', price: 79.99 },
        { brand: 'Razer', name: 'Naga V2 HyperSpeed', price: 109.99 },
        { brand: 'Logitech', name: 'G305 Lightspeed', price: 49.99 },
        { brand: 'SteelSeries', name: 'Arctis Nova 1X', price: 69.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(10000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Périphérique ${model.brand} ${model.name} pour jeu et productivité`,
            description: peripheralDescription(model.name, model.brand),
        });
    });
}

function generateMonitorProducts() {
    const models = [
        { brand: 'ASUS', name: 'TUF Gaming VG27AQ 27" 1440p 165Hz', price: 329.99 },
        { brand: 'ASUS', name: 'ROG Swift PG279QM 27" 240Hz', price: 699.99 },
        { brand: 'ASUS', name: 'ProArt PA278QV 27" QHD', price: 289.99 },
        { brand: 'ASUS', name: 'TUF Gaming VG249Q3A 24" 180Hz', price: 189.99 },
        { brand: 'ASUS', name: 'ROG Strix XG27ACS 27" 180Hz', price: 279.99 },

        { brand: 'Dell', name: 'S2721DGF 27" 1440p 165Hz', price: 299.99 },
        { brand: 'Dell', name: 'G2724D 27" 1440p 165Hz', price: 269.99 },
        { brand: 'Dell', name: 'U2723QE 27" 4K IPS Black', price: 529.99 },
        { brand: 'Dell', name: 'P2422H 24" Full HD', price: 179.99 },
        { brand: 'Dell', name: 'Alienware AW2723DF 27" 280Hz', price: 649.99 },

        { brand: 'LG', name: '27GN950-B 4K 144Hz Nano IPS', price: 799.99 },
        { brand: 'LG', name: '27GP850-B 27" 1440p 180Hz', price: 349.99 },
        { brand: 'LG', name: '32GR93U-B 32" 4K 144Hz', price: 649.99 },
        { brand: 'LG', name: '24GN65R-B 24" 144Hz IPS', price: 179.99 },
        { brand: 'LG', name: '34GP83A-B 34" Ultrawide 160Hz', price: 699.99 },

        { brand: 'Samsung', name: 'Odyssey G5 27" 1440p 165Hz', price: 249.99 },
        { brand: 'Samsung', name: 'Odyssey G7 32" 1440p Curved 240Hz', price: 599.99 },
        { brand: 'Samsung', name: 'Odyssey G8 OLED 34" Ultrawide', price: 1099.99 },
        { brand: 'Samsung', name: 'ViewFinity S6 27" QHD', price: 269.99 },
        { brand: 'Samsung', name: 'Odyssey Neo G7 43" 4K', price: 899.99 },

        { brand: 'MSI', name: 'MAG 274QRF-QD E2 27" 180Hz', price: 329.99 },
        { brand: 'MSI', name: 'G274QPX 27" 240Hz', price: 399.99 },
        { brand: 'MSI', name: 'MP273A 27" Full HD', price: 149.99 },

        { brand: 'Gigabyte', name: 'M27Q 27" 170Hz KVM', price: 299.99 },
        { brand: 'Gigabyte', name: 'M32U 32" 4K 144Hz', price: 699.99 },
        { brand: 'Gigabyte', name: 'GS27Q 27" 170Hz', price: 239.99 },
    ];

    return models.map((model, index) => {
        const { thumbnail, images } = buildImageSet(11000 + index * 3);
        return buildProduct({
            ...model,
            thumbnail,
            images,
            shortDescription: `Écran ${model.brand} ${model.name} pour gaming et productivité`,
            description: monitorDescription(model.name, model.brand),
        });
    });
}

function generateProductsData() {
    return {
        'Processeurs': generateCpuProducts(),
        'Cartes mères': generateMotherboardProducts(),
        'Mémoire RAM': generateRamProducts(),
        'Cartes graphiques': generateGpuProducts(),
        'Disques durs': generateHddProducts(),
        'SSD': generateSsdProducts(),
        'Boîtiers': generateCaseProducts(),
        'Alimentations': generatePsuProducts(),
        'Périphériques': generatePeripheralProducts(),
        'Écrans': generateMonitorProducts(),
    };
}

const productsData = generateProductsData();

async function main() {
    console.log('🌱 Début du seeding...');

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

    const attributesData = {
        Processeurs: [
            { name: 'Socket', type: 'TEXT', required: true },
            { name: 'Nombre de cœurs', type: 'NUMBER', required: true },
            { name: 'Nombre de threads', type: 'NUMBER', required: true },
            { name: 'Fréquence de base (GHz)', type: 'NUMBER', required: true },
            { name: 'Cache L3 (MB)', type: 'NUMBER', required: false },
            { name: 'TDP (W)', type: 'NUMBER', required: false },
            { name: 'Graphiques intégrés', type: 'BOOLEAN', required: false },
        ],
        'Cartes mères': [
            { name: 'Socket', type: 'TEXT', required: true },
            { name: 'Format', type: 'SELECT', required: true },
            { name: 'Chipset', type: 'TEXT', required: true },
            { name: 'Slots mémoire', type: 'NUMBER', required: true },
            { name: 'Mémoire maximale (GB)', type: 'NUMBER', required: true },
            { name: 'WiFi intégré', type: 'BOOLEAN', required: false },
            { name: 'Bluetooth intégré', type: 'BOOLEAN', required: false },
        ],
        'Mémoire RAM': [
            { name: 'Type DDR', type: 'SELECT', required: true },
            { name: 'Fréquence (MHz)', type: 'NUMBER', required: true },
            { name: 'Capacité (GB)', type: 'NUMBER', required: true },
            { name: 'Latence CAS', type: 'NUMBER', required: false },
            { name: 'RGB', type: 'BOOLEAN', required: false },
        ],
        'Cartes graphiques': [
            { name: 'Chipset GPU', type: 'TEXT', required: true },
            { name: 'VRAM (GB)', type: 'NUMBER', required: true },
            { name: 'Type VRAM', type: 'TEXT', required: true },
            { name: 'Fréquence de base (MHz)', type: 'NUMBER', required: false },
            { name: 'Connecteurs d\'alimentation', type: 'TEXT', required: false },
            { name: 'Ray Tracing', type: 'BOOLEAN', required: false },
        ],
        'Disques durs': [
            { name: 'Capacité (TB)', type: 'NUMBER', required: true },
            { name: 'Vitesse de rotation (RPM)', type: 'NUMBER', required: true },
            { name: 'Interface', type: 'TEXT', required: true },
            { name: 'Cache (MB)', type: 'NUMBER', required: false },
        ],
        SSD: [
            { name: 'Capacité (GB)', type: 'NUMBER', required: true },
            { name: 'Interface', type: 'TEXT', required: true },
            { name: 'Lecture séquentielle (MB/s)', type: 'NUMBER', required: false },
            { name: 'Écriture séquentielle (MB/s)', type: 'NUMBER', required: false },
            { name: 'Type de mémoire', type: 'TEXT', required: false },
        ],
        'Boîtiers': [
            { name: 'Format', type: 'SELECT', required: true },
            { name: 'Matériau', type: 'TEXT', required: false },
            { name: 'Ventilateurs inclus', type: 'NUMBER', required: false },
            { name: 'Panneau transparent', type: 'BOOLEAN', required: false },
        ],
        Alimentations: [
            { name: 'Puissance (W)', type: 'NUMBER', required: true },
            { name: 'Certification', type: 'TEXT', required: true },
            { name: 'Modulaire', type: 'BOOLEAN', required: false },
            { name: 'Format', type: 'TEXT', required: false },
        ],
        'Périphériques': [
            { name: 'Type', type: 'SELECT', required: true },
            { name: 'Sans fil', type: 'BOOLEAN', required: false },
            { name: 'RGB', type: 'BOOLEAN', required: false },
            { name: 'Interface', type: 'TEXT', required: false },
        ],
        'Écrans': [
            { name: 'Taille (pouces)', type: 'NUMBER', required: true },
            { name: 'Résolution', type: 'TEXT', required: true },
            { name: 'Taux de rafraîchissement (Hz)', type: 'NUMBER', required: true },
            { name: 'Type de dalle', type: 'TEXT', required: false },
            { name: 'Incurvé', type: 'BOOLEAN', required: false },
            { name: 'G-Sync/FreeSync', type: 'TEXT', required: false },
        ],
    };

    console.log('🏷️ Création des attributs et associations avec les catégories...');
    let totalAttributes = 0;
    let totalCategoryAttributes = 0;

    for (const [categoryName, attributes] of Object.entries(attributesData)) {
        const category = createdCategories[categoryName];

        if (!category) {
            console.warn(`⚠️ Catégorie non trouvée pour les attributs: ${categoryName}`);
            continue;
        }

        for (const [index, attributeData] of attributes.entries()) {
            const attribute = await prisma.attributes.create({
                data: {
                    name: attributeData.name,
                    type: attributeData.type,
                },
            });

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

            const normalizedProductName = normalizeName(productData.name);
            const identifiers = productIdentifiers[normalizedProductName] ?? null;

            const product = await prisma.products.create({
                data: {
                    name: productData.name,
                    slug: slugify(`${productData.brand}-${productData.name}`, {
                        lower: true,
                        strict: true,
                        locale: 'fr',
                    }),
                    thumbnail: productData.thumbnail,
                    images: productData.images,
                    shortDescription: productData.shortDescription,
                    description: productData.description,

                    sku: buildSku({
                        categoryName,
                        brandName: productData.brand,
                        productName: productData.name,
                    }),
                    mpn: identifiers?.mpn ?? null,
                    ean13: identifiers?.ean13 ?? null,

                    price: productData.price,
                    categoryId: category.id,
                    brandId: brand.id,
                    active: productData.active,
                },
            });

            const randomStock = Math.floor(Math.random() * 50) + 1;
            const randomMinStock = Math.floor(Math.random() * 15) + 1;

            await prisma.stocks.create({
                data: {
                    productId: product.id,
                    quantity: randomStock,
                    minQuantity: randomMinStock,
                },
            });

            createdProducts.push({
                product,
                categoryName,
                brandName: productData.brand,
                productData,
            });

            totalProducts++;
            console.log(`✅ Produit créé: ${productData.brand} ${product.name} (stock: ${randomStock})`);
        }
    }

    console.log('🏷️ Création des valeurs d\'attributs pour les produits...');
    let totalProductAttributeValues = 0;

    for (const productInfo of createdProducts) {
        const { product, categoryName, brandName } = productInfo;

        const categoryAttributes = await prisma.categoryAttributes.findMany({
            where: {
                category: {
                    name: categoryName,
                },
            },
            include: {
                attribute: true,
            },
        });

        for (const categoryAttribute of categoryAttributes) {
            const attribute = categoryAttribute.attribute;
            let value = '';

            if (categoryName === 'Processeurs') {
                if (attribute.name === 'Socket') {
                    value = brandName === 'Intel' ? 'LGA1700' : 'AM5';
                } else if (attribute.name === 'Nombre de cœurs') {
                    value = ['6', '8', '12', '16'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Nombre de threads') {
                    value = ['12', '16', '24', '32'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Fréquence de base (GHz)') {
                    value = (3.2 + Math.random() * 2).toFixed(1);
                } else if (attribute.name === 'Cache L3 (MB)') {
                    value = ['24', '30', '32', '36', '64', '96'][Math.floor(Math.random() * 6)];
                } else if (attribute.name === 'TDP (W)') {
                    value = ['65', '105', '120', '125', '170'][Math.floor(Math.random() * 5)];
                } else if (attribute.name === 'Graphiques intégrés') {
                    value = Math.random() > 0.4 ? 'true' : 'false';
                }
            } else if (categoryName === 'Cartes graphiques') {
                if (attribute.name === 'Chipset GPU') {
                    value = ['RTX 4060', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090', 'RX 7800 XT', 'RX 7900 XTX'][Math.floor(Math.random() * 6)];
                } else if (attribute.name === 'VRAM (GB)') {
                    value = ['8', '12', '16', '24'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Type VRAM') {
                    value = Math.random() > 0.5 ? 'GDDR6' : 'GDDR6X';
                } else if (attribute.name === 'Fréquence de base (MHz)') {
                    value = String(1500 + Math.floor(Math.random() * 800));
                } else if (attribute.name === 'Connecteurs d\'alimentation') {
                    value = ['1x8-pin', '2x8-pin', '12VHPWR'][Math.floor(Math.random() * 3)];
                } else if (attribute.name === 'Ray Tracing') {
                    value = 'true';
                }
            } else if (categoryName === 'Mémoire RAM') {
                if (attribute.name === 'Type DDR') {
                    value = Math.random() > 0.45 ? 'DDR5' : 'DDR4';
                } else if (attribute.name === 'Fréquence (MHz)') {
                    value = ['3200', '3600', '5200', '5600', '6000'][Math.floor(Math.random() * 5)];
                } else if (attribute.name === 'Capacité (GB)') {
                    value = ['16', '32', '64'][Math.floor(Math.random() * 3)];
                } else if (attribute.name === 'Latence CAS') {
                    value = ['16', '18', '30', '32', '36'][Math.floor(Math.random() * 5)];
                } else if (attribute.name === 'RGB') {
                    value = Math.random() > 0.5 ? 'true' : 'false';
                }
            } else if (categoryName === 'Écrans') {
                if (attribute.name === 'Taille (pouces)') {
                    value = ['24', '27', '32', '34'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Résolution') {
                    value = ['1920x1080', '2560x1440', '3840x2160'][Math.floor(Math.random() * 3)];
                } else if (attribute.name === 'Taux de rafraîchissement (Hz)') {
                    value = ['75', '144', '165', '240'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Type de dalle') {
                    value = ['IPS', 'VA', 'Fast IPS', 'Nano IPS'][Math.floor(Math.random() * 4)];
                } else if (attribute.name === 'Incurvé') {
                    value = Math.random() > 0.65 ? 'true' : 'false';
                } else if (attribute.name === 'G-Sync/FreeSync') {
                    value = ['FreeSync', 'G-SYNC Compatible', 'Adaptive Sync'][Math.floor(Math.random() * 3)];
                }
            } else {
                if (attribute.type === 'BOOLEAN') {
                    value = Math.random() > 0.5 ? 'true' : 'false';
                } else if (attribute.type === 'NUMBER') {
                    value = String(Math.floor(Math.random() * 100) + 1);
                } else if (attribute.type === 'SELECT') {
                    value = `Option ${Math.floor(Math.random() * 5) + 1}`;
                } else {
                    value = `Valeur ${attribute.name}`;
                }
            }

            if (value) {
                await prisma.productAttributeValues.create({
                    data: {
                        productId: product.id,
                        categoryAttributeId: categoryAttribute.id,
                        value,
                    },
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

    console.log('\n📈 Statistiques par catégorie:');
    for (const categoryName of Object.keys(productsData)) {
        console.log(`  - ${categoryName}: ${productsData[categoryName].length} produits`);
    }

    console.log('\n🏷️ Statistiques par marque:');
    const brandStats = {};

    for (const products of Object.values(productsData)) {
        for (const product of products) {
            brandStats[product.brand] = (brandStats[product.brand] || 0) + 1;
        }
    }

    Object.entries(brandStats)
        .sort(([, a], [, b]) => b - a)
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