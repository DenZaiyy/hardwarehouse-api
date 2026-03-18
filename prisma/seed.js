// eslint-disable-next-line @typescript-eslint/no-require-imports
const {PrismaClient} = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const slugify = require('slugify');

const prisma = new PrismaClient();

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
    { name: 'LG', logo: 'https://picsum.photos/200/200?random=26' }
];

// Données des catégories
const categoriesData = [
    {
        name: 'Processeurs',
        logo: 'https://picsum.photos/300/300?random=101'
    },
    {
        name: 'Cartes mères',
        logo: 'https://picsum.photos/300/300?random=102'
    },
    {
        name: 'Mémoire RAM',
        logo: 'https://picsum.photos/300/300?random=103'
    },
    {
        name: 'Cartes graphiques',
        logo: 'https://picsum.photos/300/300?random=104'
    },
    {
        name: 'Disques durs',
        logo: 'https://picsum.photos/300/300?random=105'
    },
    {
        name: 'SSD',
        logo: 'https://picsum.photos/300/300?random=106'
    },
    {
        name: 'Boîtiers',
        logo: 'https://picsum.photos/300/300?random=107'
    },
    {
        name: 'Alimentations',
        logo: 'https://picsum.photos/300/300?random=108'
    },
    {
        name: 'Périphériques',
        logo: 'https://picsum.photos/300/300?random=109'
    },
    {
        name: 'Écrans',
        logo: 'https://picsum.photos/300/300?random=110'
    }
];

// Données des produits par catégorie avec marque
const productsData = {
    'Processeurs': [
        { 
            name: 'Core i9-13900K', 
            brand: 'Intel', 
            price: 589.99, 
            thumbnail: 'https://picsum.photos/400/400?random=201', 
            images: [
                'https://picsum.photos/800/800?random=201',
                'https://picsum.photos/800/800?random=202',
                'https://picsum.photos/800/800?random=203'
            ],
            shortDescription: 'Processeur Intel Core i9 haute performance pour gaming et création',
            description: 'Le processeur Intel Core i9-13900K offre des performances exceptionnelles avec ses 24 cœurs (8P+16E) et 32 threads. Avec une fréquence de base de 3.0 GHz et un boost jusqu\'à 5.8 GHz, il est parfait pour le gaming en 4K, le streaming et les tâches de création de contenu intensives.',
            active: true 
        },
        { 
            name: 'Ryzen 9 7950X', 
            brand: 'AMD', 
            price: 699.99, 
            thumbnail: 'https://picsum.photos/400/400?random=204', 
            images: [
                'https://picsum.photos/800/800?random=204',
                'https://picsum.photos/800/800?random=205',
                'https://picsum.photos/800/800?random=206'
            ],
            shortDescription: 'Processeur AMD Ryzen 9 16 cœurs pour les professionnels',
            description: 'Le Ryzen 9 7950X est le processeur phare d\'AMD avec 16 cœurs et 32 threads. Basé sur l\'architecture Zen 4 en 5nm, il offre des performances exceptionnelles en création de contenu, rendu 3D et multitâche intensif. Compatible socket AM5 avec support DDR5.',
            active: true 
        },
        { 
            name: 'Core i7-13700K', 
            brand: 'Intel', 
            price: 419.99, 
            thumbnail: 'https://picsum.photos/400/400?random=207', 
            images: [
                'https://picsum.photos/800/800?random=207',
                'https://picsum.photos/800/800?random=208'
            ],
            shortDescription: 'Processeur Intel Core i7 équilibré pour gaming et productivité',
            description: 'Le Core i7-13700K combine 8 cœurs de performance et 8 cœurs d\'efficience pour un total de 24 threads. Idéal pour le gaming en haute résolution et les applications de productivité. Fréquence boost jusqu\'à 5.4 GHz.',
            active: true 
        },
        { 
            name: 'Ryzen 7 7800X3D', 
            brand: 'AMD', 
            price: 449.99, 
            thumbnail: 'https://picsum.photos/400/400?random=209', 
            images: [
                'https://picsum.photos/800/800?random=209',
                'https://picsum.photos/800/800?random=210'
            ],
            shortDescription: 'Processeur gaming AMD avec cache 3D V-Cache révolutionnaire',
            description: 'Le Ryzen 7 7800X3D intègre la technologie 3D V-Cache d\'AMD qui triple le cache L3 pour des performances gaming exceptionnelles. Avec 8 cœurs et 16 threads, il offre les meilleures performances par cœur pour le gaming.',
            active: true 
        },
        { 
            name: 'Core i5-13600K', 
            brand: 'Intel', 
            price: 319.99, 
            thumbnail: 'https://picsum.photos/400/400?random=211', 
            images: [
                'https://picsum.photos/800/800?random=211',
                'https://picsum.photos/800/800?random=212'
            ],
            shortDescription: 'Processeur Intel Core i5 excellent rapport qualité-prix',
            description: 'Le Core i5-13600K offre 6 cœurs de performance et 8 cœurs d\'efficience pour 20 threads au total. Parfait pour le gaming en 1440p et les tâches de productivité courantes. Excellent choix pour les builds gaming milieu de gamme.',
            active: true 
        },
        { 
            name: 'Ryzen 5 7600X', 
            brand: 'AMD', 
            price: 279.99, 
            thumbnail: 'https://picsum.photos/400/400?random=213', 
            images: [
                'https://picsum.photos/800/800?random=213',
                'https://picsum.photos/800/800?random=214'
            ],
            shortDescription: 'Processeur AMD Ryzen 5 performant et économique',
            description: 'Le Ryzen 5 7600X avec 6 cœurs et 12 threads est parfait pour le gaming et les applications courantes. Architecture Zen 4 moderne avec support DDR5 et PCIe 5.0. Excellent choix pour les builds gaming abordables.',
            active: true 
        }
    ],
    'Cartes mères': [
        { 
            name: 'ROG STRIX Z790-E Gaming', 
            brand: 'ASUS', 
            price: 459.99, 
            thumbnail: 'https://picsum.photos/400/400?random=215', 
            images: [
                'https://picsum.photos/800/800?random=215',
                'https://picsum.photos/800/800?random=216',
                'https://picsum.photos/800/800?random=217'
            ],
            shortDescription: 'Carte mère ASUS ROG haut de gamme pour processeurs Intel Z790',
            description: 'La ROG STRIX Z790-E Gaming est une carte mère premium d\'ASUS conçue pour les processeurs Intel de 13e génération. Elle offre un VRM robuste, WiFi 6E, Bluetooth 5.3, ports USB 3.2, et un design gaming avec éclairage RGB Aura Sync.',
            active: true 
        },
        { 
            name: 'MAG B650 TOMAHAWK WiFi', 
            brand: 'MSI', 
            price: 219.99, 
            thumbnail: 'https://picsum.photos/400/400?random=218', 
            images: [
                'https://picsum.photos/800/800?random=218',
                'https://picsum.photos/800/800?random=219'
            ],
            shortDescription: 'Carte mère MSI B650 complète avec WiFi intégré',
            description: 'La MAG B650 TOMAHAWK WiFi de MSI offre un excellent équilibre entre fonctionnalités et prix pour les processeurs AMD Ryzen 7000. Inclut WiFi 6E, USB 3.2, PCIe 5.0, et un design élégant avec refroidissement optimisé.',
            active: true 
        },
        { 
            name: 'Z790 AORUS ELITE AX', 
            brand: 'Gigabyte', 
            price: 299.99, 
            thumbnail: 'https://picsum.photos/400/400?random=220', 
            images: [
                'https://picsum.photos/800/800?random=220',
                'https://picsum.photos/800/800?random=221'
            ],
            shortDescription: 'Carte mère Gigabyte Z790 avec connectivité avancée',
            description: 'La Z790 AORUS ELITE AX combine performance et connectivité moderne. Compatible avec les processeurs Intel 12e et 13e gen, elle propose WiFi 6E, Ethernet 2.5G, PCIe 5.0, et le RGB Fusion 2.0 de Gigabyte.',
            active: true 
        },
        { 
            name: 'B650M PRO B WiFi', 
            brand: 'ASRock', 
            price: 129.99, 
            thumbnail: 'https://picsum.photos/400/400?random=222', 
            images: [
                'https://picsum.photos/800/800?random=222'
            ],
            shortDescription: 'Carte mère ASRock micro-ATX abordable avec WiFi',
            description: 'La B650M PRO B WiFi est une carte mère micro-ATX compacte et abordable pour les processeurs AMD Ryzen 7000. Malgré son prix attractif, elle inclut WiFi 6, USB 3.2, et PCIe 4.0 pour une expérience moderne.',
            active: true 
        },
        { 
            name: 'TUF Gaming B550-PLUS', 
            brand: 'ASUS', 
            price: 159.99, 
            thumbnail: 'https://picsum.photos/400/400?random=223', 
            images: [
                'https://picsum.photos/800/800?random=223',
                'https://picsum.photos/800/800?random=224'
            ],
            shortDescription: 'Carte mère ASUS TUF robuste pour Ryzen série 5000',
            description: 'La TUF Gaming B550-PLUS est conçue pour la durabilité avec des composants de qualité militaire. Compatible Ryzen 5000, elle offre PCIe 4.0, USB 3.2, et le design TUF Gaming d\'ASUS réputé pour sa fiabilité.',
            active: true 
        }
    ],
    'Mémoire RAM': [
        { 
            name: 'Vengeance LPX 32GB DDR4-3200', 
            brand: 'Corsair', 
            price: 89.99, 
            thumbnail: 'https://picsum.photos/400/400?random=225', 
            images: [
                'https://picsum.photos/800/800?random=225',
                'https://picsum.photos/800/800?random=226'
            ],
            shortDescription: 'Mémoire DDR4 Corsair haute performance 32GB',
            description: 'La mémoire Vengeance LPX 32GB DDR4-3200 de Corsair offre des performances fiables pour le gaming et les applications professionnelles. Design low-profile, dissipateur thermique optimisé et compatibilité étendue avec les cartes mères modernes.',
            active: true 
        },
        { 
            name: 'Trident Z5 32GB DDR5-6000', 
            brand: 'G.Skill', 
            price: 179.99, 
            thumbnail: 'https://picsum.photos/400/400?random=227', 
            images: [
                'https://picsum.photos/800/800?random=227',
                'https://picsum.photos/800/800?random=228',
                'https://picsum.photos/800/800?random=229'
            ],
            shortDescription: 'Mémoire DDR5 G.Skill ultra-rapide avec RGB',
            description: 'La Trident Z5 32GB DDR5-6000 représente le summum de la performance mémoire. Avec des fréquences de 6000 MHz et un éclairage RGB personnalisable, elle est parfaite pour les systèmes haut de gamme et l\'overclocking.',
            active: true 
        },
        { 
            name: 'Fury Beast 16GB DDR4-3200', 
            brand: 'Kingston', 
            price: 49.99, 
            thumbnail: 'https://picsum.photos/400/400?random=230', 
            images: [
                'https://picsum.photos/800/800?random=230'
            ],
            shortDescription: 'Mémoire Kingston abordable et fiable 16GB',
            description: 'La Fury Beast 16GB DDR4-3200 de Kingston offre un excellent rapport qualité-prix. Conçue pour les gamers et créateurs de contenu, elle propose des performances stables et une compatibilité optimale avec les plateformes Intel et AMD.',
            active: true 
        },
        { 
            name: 'Ballistix 64GB DDR4-3600', 
            brand: 'Crucial', 
            price: 199.99, 
            thumbnail: 'https://picsum.photos/400/400?random=231', 
            images: [
                'https://picsum.photos/800/800?random=231',
                'https://picsum.photos/800/800?random=232'
            ],
            shortDescription: 'Kit mémoire Crucial haute capacité 64GB pour workstations',
            description: 'La Ballistix 64GB DDR4-3600 est destinée aux professionnels nécessitant une grande quantité de mémoire. Parfaite pour le rendu 3D, la virtualisation et les applications gourmandes en RAM. Dissipateur thermique intégré.',
            active: true 
        },
        { 
            name: 'Vengeance RGB Pro 16GB DDR4-3600', 
            brand: 'Corsair', 
            price: 69.99, 
            thumbnail: 'https://picsum.photos/400/400?random=233', 
            images: [
                'https://picsum.photos/800/800?random=233',
                'https://picsum.photos/800/800?random=234'
            ],
            shortDescription: 'Mémoire Corsair RGB gaming 16GB haute fréquence',
            description: 'La Vengeance RGB Pro 16GB DDR4-3600 combine performances et esthétique gaming. Avec son éclairage RGB dynamique contrôlable via iCUE et ses timings optimisés, elle est idéale pour les builds gaming RGB.',
            active: true 
        }
    ],
    'Cartes graphiques': [
        { 
            name: 'GeForce RTX 4090', 
            brand: 'NVIDIA', 
            price: 1599.99, 
            thumbnail: 'https://picsum.photos/400/400?random=240', 
            images: [
                'https://picsum.photos/800/800?random=240',
                'https://picsum.photos/800/800?random=241',
                'https://picsum.photos/800/800?random=242'
            ],
            shortDescription: 'Carte graphique NVIDIA RTX 4090 flagship pour 4K gaming',
            description: 'La GeForce RTX 4090 est la carte graphique la plus puissante de NVIDIA. Avec 24GB de VRAM GDDR6X et l\'architecture Ada Lovelace, elle offre des performances exceptionnelles en 4K, ray tracing avancé et création de contenu IA.',
            active: true 
        },
        { 
            name: 'Radeon RX 7900 XTX', 
            brand: 'AMD', 
            price: 999.99, 
            thumbnail: 'https://picsum.photos/400/400?random=243', 
            images: [
                'https://picsum.photos/800/800?random=243',
                'https://picsum.photos/800/800?random=244'
            ],
            shortDescription: 'Carte graphique AMD RX 7900 XTX haut de gamme',
            description: 'La Radeon RX 7900 XTX utilise l\'architecture RDNA 3 d\'AMD pour offrir des performances exceptionnelles en 1440p et 4K. Avec 24GB de VRAM, elle excelle dans les jeux modernes et la création de contenu.',
            active: true 
        },
        { 
            name: 'GeForce RTX 4070 Ti', 
            brand: 'NVIDIA', 
            price: 799.99, 
            thumbnail: 'https://picsum.photos/400/400?random=245', 
            images: [
                'https://picsum.photos/800/800?random=245',
                'https://picsum.photos/800/800?random=246'
            ],
            shortDescription: 'Carte graphique RTX 4070 Ti équilibrée pour 1440p',
            description: 'La RTX 4070 Ti offre un excellent équilibre entre performance et prix pour le gaming en 1440p. Avec DLSS 3, ray tracing de 3e génération et 12GB de VRAM, elle garantit des expériences de jeu fluides.',
            active: true 
        },
        { 
            name: 'Radeon RX 7800 XT', 
            brand: 'AMD', 
            price: 499.99, 
            thumbnail: 'https://picsum.photos/400/400?random=247', 
            images: [
                'https://picsum.photos/800/800?random=247'
            ],
            shortDescription: 'Carte graphique AMD milieu de gamme performante',
            description: 'La RX 7800 XT est parfaite pour le gaming en 1440p avec des réglages élevés. Architecture RDNA 3 efficace, 16GB de VRAM et excellent rapport performance/prix pour les gamers exigeants.',
            active: true 
        },
        { 
            name: 'GeForce RTX 4060', 
            brand: 'NVIDIA', 
            price: 299.99, 
            thumbnail: 'https://picsum.photos/400/400?random=248', 
            images: [
                'https://picsum.photos/800/800?random=248',
                'https://picsum.photos/800/800?random=249'
            ],
            shortDescription: 'Carte graphique RTX 4060 abordable pour 1080p',
            description: 'La RTX 4060 est la solution idéale pour le gaming en 1080p avec ray tracing. Grâce au DLSS 3 et à son efficacité énergétique, elle offre d\'excellentes performances dans un budget maîtrisé.',
            active: true 
        },
        { 
            name: 'ROG Strix RTX 4080', 
            brand: 'ASUS', 
            price: 1199.99, 
            thumbnail: 'https://picsum.photos/400/400?random=250', 
            images: [
                'https://picsum.photos/800/800?random=250',
                'https://picsum.photos/800/800?random=251',
                'https://picsum.photos/800/800?random=252'
            ],
            shortDescription: 'RTX 4080 ASUS ROG Strix premium avec refroidissement avancé',
            description: 'La ROG Strix RTX 4080 combine la puissance de la RTX 4080 avec le refroidissement et le design premium d\'ASUS. Triple ventilateur, RGB Aura Sync, et overclocking d\'usine pour des performances maximales.',
            active: true 
        }
    ],
    'Disques durs': [
        { 
            name: 'Barracuda 2TB 7200RPM', 
            brand: 'Seagate', 
            price: 54.99, 
            thumbnail: 'https://picsum.photos/400/400?random=260', 
            images: [
                'https://picsum.photos/800/800?random=260',
                'https://picsum.photos/800/800?random=261'
            ],
            shortDescription: 'Disque dur Seagate Barracuda 2TB haute performance',
            description: 'Le Barracuda 2TB 7200RPM de Seagate offre un stockage fiable et performant pour vos jeux, médias et applications. Avec sa vitesse de 7200 tours/minute et son cache optimisé, il garantit des temps de chargement rapides.',
            active: true 
        },
        { 
            name: 'Blue 1TB 7200RPM', 
            brand: 'Western Digital', 
            price: 39.99, 
            thumbnail: 'https://picsum.photos/400/400?random=262', 
            images: [
                'https://picsum.photos/800/800?random=262'
            ],
            shortDescription: 'Disque dur WD Blue 1TB économique et fiable',
            description: 'Le WD Blue 1TB est la solution de stockage idéale pour les utilisateurs recherchant fiabilité et performance. Conçu pour un usage quotidien, il offre des performances constantes et une longue durée de vie.',
            active: true 
        },
        { 
            name: 'P300 3TB 7200RPM', 
            brand: 'Toshiba', 
            price: 79.99, 
            thumbnail: 'https://picsum.photos/400/400?random=263', 
            images: [
                'https://picsum.photos/800/800?random=263',
                'https://picsum.photos/800/800?random=264'
            ],
            shortDescription: 'Disque dur Toshiba P300 3TB grande capacité',
            description: 'Le P300 3TB de Toshiba combine grande capacité et performances solides. Parfait pour le stockage de masse, les sauvegardes et les applications nécessitant beaucoup d\'espace de stockage.',
            active: true 
        },
        { 
            name: 'IronWolf 4TB NAS', 
            brand: 'Seagate', 
            price: 119.99, 
            thumbnail: 'https://picsum.photos/400/400?random=265', 
            images: [
                'https://picsum.photos/800/800?random=265',
                'https://picsum.photos/800/800?random=266'
            ],
            shortDescription: 'Disque dur Seagate IronWolf 4TB optimisé NAS',
            description: 'L\'IronWolf 4TB est spécialement conçu pour les serveurs NAS et le stockage en réseau. Avec sa technologie AgileArray et sa fiabilité 24/7, il est parfait pour les environnements multi-utilisateurs.',
            active: true 
        }
    ],
    'SSD': [
        { 
            name: '980 PRO 1TB NVMe', 
            brand: 'Samsung', 
            price: 89.99, 
            thumbnail: 'https://picsum.photos/400/400?random=275', 
            images: [
                'https://picsum.photos/800/800?random=275',
                'https://picsum.photos/800/800?random=276'
            ],
            shortDescription: 'SSD NVMe Samsung 980 PRO 1TB ultra-rapide',
            description: 'Le Samsung 980 PRO 1TB est un SSD NVMe PCIe 4.0 haut de gamme offrant des performances exceptionnelles. Avec des vitesses de lecture jusqu\'à 7000 MB/s, il est parfait pour le gaming, la création de contenu et les applications professionnelles.',
            active: true 
        },
        { 
            name: 'Black SN850X 2TB NVMe', 
            brand: 'Western Digital', 
            price: 179.99, 
            thumbnail: 'https://picsum.photos/400/400?random=277', 
            images: [
                'https://picsum.photos/800/800?random=277',
                'https://picsum.photos/800/800?random=278'
            ],
            shortDescription: 'SSD NVMe WD Black SN850X 2TB gaming',
            description: 'Le WD Black SN850X 2TB est optimisé pour les gamers exigeants. PCIe 4.0, dissipateur thermique intégré et performances soutenues pour le gaming en haute définition et le stockage de bibliothèques de jeux volumineuses.',
            active: true 
        },
        { 
            name: 'MX4 500GB SATA', 
            brand: 'Crucial', 
            price: 49.99, 
            thumbnail: 'https://picsum.photos/400/400?random=279', 
            images: [
                'https://picsum.photos/800/800?random=279'
            ],
            shortDescription: 'SSD SATA Crucial MX4 500GB économique',
            description: 'Le Crucial MX4 500GB SATA offre un excellent rapport qualité-prix pour upgrader un ancien système. Interface SATA 3.0, fiabilité éprouvée et performances bien supérieures aux disques durs traditionnels.',
            active: true 
        },
        { 
            name: 'NV2 1TB NVMe', 
            brand: 'Kingston', 
            price: 59.99, 
            thumbnail: 'https://picsum.photos/400/400?random=280', 
            images: [
                'https://picsum.photos/800/800?random=280',
                'https://picsum.photos/800/800?random=281'
            ],
            shortDescription: 'SSD NVMe Kingston NV2 1TB abordable',
            description: 'Le Kingston NV2 1TB offre les avantages du stockage NVMe à prix accessible. PCIe 4.0, format M.2 compact et performances solides pour améliorer la réactivité de votre système.',
            active: true 
        },
        { 
            name: '990 EVO 2TB NVMe', 
            brand: 'Samsung', 
            price: 149.99, 
            thumbnail: 'https://picsum.photos/400/400?random=282', 
            images: [
                'https://picsum.photos/800/800?random=282',
                'https://picsum.photos/800/800?random=283'
            ],
            shortDescription: 'SSD NVMe Samsung 990 EVO 2TB nouvelle génération',
            description: 'Le Samsung 990 EVO 2TB représente l\'évolution de la gamme EVO avec des performances améliorées et une efficacité énergétique optimisée. Parfait pour les laptops gaming et les systèmes compacts.',
            active: true 
        }
    ],
    'Boîtiers': [
        { 
            name: 'Define 7 ATX Mid Tower', 
            brand: 'Fractal Design', 
            price: 169.99, 
            thumbnail: 'https://picsum.photos/400/400?random=290', 
            images: [
                'https://picsum.photos/800/800?random=290',
                'https://picsum.photos/800/800?random=291'
            ],
            shortDescription: 'Boîtier Fractal Design Define 7 silencieux et spacieux',
            description: 'Le Define 7 de Fractal Design combine élégance scandinave et fonctionnalité. Isolation acoustique optimale, excellent airflow, support multi-GPU et construction premium en font un choix de référence pour les builds haut de gamme.',
            active: true 
        },
        { 
            name: 'H510 Elite Mid Tower', 
            brand: 'NZXT', 
            price: 149.99, 
            thumbnail: 'https://picsum.photos/400/400?random=292', 
            images: [
                'https://picsum.photos/800/800?random=292',
                'https://picsum.photos/800/800?random=293'
            ],
            shortDescription: 'Boîtier NZXT H510 Elite avec panneau verre trempé',
            description: 'Le H510 Elite de NZXT offre un design moderne et épuré avec panneau en verre trempé. Câble management optimisé, RGB intégré et compatibilité avec les systèmes de refroidissement liquide NZXT.',
            active: true 
        },
        { 
            name: '4000D Airflow Mid Tower', 
            brand: 'Corsair', 
            price: 104.99, 
            thumbnail: 'https://picsum.photos/400/400?random=294', 
            images: [
                'https://picsum.photos/800/800?random=294',
                'https://picsum.photos/800/800?random=295'
            ],
            shortDescription: 'Boîtier Corsair 4000D Airflow optimisé refroidissement',
            description: 'Le 4000D Airflow de Corsair privilégie les performances thermiques avec sa façade perforée. Construction robuste, space management intelligent et excellent rapport qualité-prix pour les builds gaming performants.',
            active: true 
        },
        { 
            name: 'MasterBox Q300L mITX', 
            brand: 'Cooler Master', 
            price: 39.99, 
            thumbnail: 'https://picsum.photos/400/400?random=296', 
            images: [
                'https://picsum.photos/800/800?random=296'
            ],
            shortDescription: 'Boîtier Cooler Master Q300L compact mini-ITX',
            description: 'Le MasterBox Q300L est parfait pour les builds compactes. Format mini-ITX, panneau transparent, modularité et prix abordable en font la solution idéale pour un premier build ou un HTPC.',
            active: true 
        },
        { 
            name: 'H7 Flow Mid Tower', 
            brand: 'NZXT', 
            price: 139.99, 
            thumbnail: 'https://picsum.photos/400/400?random=297', 
            images: [
                'https://picsum.photos/800/800?random=297',
                'https://picsum.photos/800/800?random=298'
            ],
            shortDescription: 'Boîtier NZXT H7 Flow nouvelle génération',
            description: 'Le H7 Flow représente l\'évolution de la gamme H de NZXT. Design moderne, airflow optimisé, compatibilité étendue et construction premium pour des builds gaming de nouvelle génération.',
            active: true 
        }
    ],
    'Alimentations': [
        { 
            name: 'RM850x 850W 80+ Gold Modular', 
            brand: 'Corsair', 
            price: 139.99, 
            thumbnail: 'https://picsum.photos/400/400?random=305', 
            images: [
                'https://picsum.photos/800/800?random=305',
                'https://picsum.photos/800/800?random=306'
            ],
            shortDescription: 'Alimentation Corsair RM850x modulaire 80+ Gold',
            description: 'La Corsair RM850x 850W offre une efficacité 80+ Gold et une modularité complète pour un câblage optimisé. Ventilateur silencieux à contrôle thermique et garantie 10 ans pour une tranquillité d\'esprit totale.',
            active: true 
        },
        { 
            name: 'Focus GX-750 750W 80+ Gold', 
            brand: 'Seasonic', 
            price: 119.99, 
            thumbnail: 'https://picsum.photos/400/400?random=307', 
            images: [
                'https://picsum.photos/800/800?random=307',
                'https://picsum.photos/800/800?random=308'
            ],
            shortDescription: 'Alimentation Seasonic Focus GX-750 fiable et efficace',
            description: 'La Seasonic Focus GX-750 combine la réputation légendaire de Seasonic avec des performances modernes. Efficacité 80+ Gold, protection complète et fonctionnement silencieux pour les builds haut de gamme.',
            active: true 
        },
        { 
            name: 'SuperNOVA 650 P6 80+ Platinum', 
            brand: 'EVGA', 
            price: 99.99, 
            thumbnail: 'https://picsum.photos/400/400?random=309', 
            images: [
                'https://picsum.photos/800/800?random=309',
                'https://picsum.photos/800/800?random=310'
            ],
            shortDescription: 'Alimentation EVGA SuperNOVA 650W 80+ Platinum',
            description: 'La SuperNOVA 650 P6 d\'EVGA offre une efficacité 80+ Platinum premium. Conception entièrement modulaire, ventilateur ECO mode et garantie 10 ans pour les builds gaming exigeants.',
            active: true 
        },
        { 
            name: 'Straight Power 11 600W 80+ Gold', 
            brand: 'be quiet!', 
            price: 89.99, 
            thumbnail: 'https://picsum.photos/400/400?random=311', 
            images: [
                'https://picsum.photos/800/800?random=311'
            ],
            shortDescription: 'Alimentation be quiet! Straight Power 11 silencieuse',
            description: 'La Straight Power 11 de be quiet! privilégie le silence absolu sans compromettre les performances. Ventilateur Silent Wings 3 et efficacité 80+ Gold pour des builds silencieux professionnels.',
            active: true 
        },
        { 
            name: 'HX1000 1000W 80+ Platinum', 
            brand: 'Corsair', 
            price: 219.99, 
            thumbnail: 'https://picsum.photos/400/400?random=312', 
            images: [
                'https://picsum.photos/800/800?random=312',
                'https://picsum.photos/800/800?random=313',
                'https://picsum.photos/800/800?random=314'
            ],
            shortDescription: 'Alimentation Corsair HX1000 1000W haut de gamme',
            description: 'La HX1000 de Corsair est conçue pour les systèmes les plus exigeants. 1000W 80+ Platinum, modularité complète et composants premium pour alimenter les configurations multi-GPU et workstations.',
            active: true 
        }
    ],
    'Périphériques': [
        { 
            name: 'MX Master 3S Wireless Mouse', 
            brand: 'Logitech', 
            price: 99.99, 
            thumbnail: 'https://picsum.photos/400/400?random=320', 
            images: [
                'https://picsum.photos/800/800?random=320',
                'https://picsum.photos/800/800?random=321'
            ],
            shortDescription: 'Souris Logitech MX Master 3S sans fil professionnelle',
            description: 'La MX Master 3S de Logitech redéfinit la productivité avec son capteur haute précision, sa molette MagSpeed et sa connectivité multi-appareils. Ergonomie parfaite et autonomie exceptionnelle pour les professionnels.',
            active: true 
        },
        { 
            name: 'K95 RGB Platinum Mechanical', 
            brand: 'Corsair', 
            price: 199.99, 
            thumbnail: 'https://picsum.photos/400/400?random=322', 
            images: [
                'https://picsum.photos/800/800?random=322',
                'https://picsum.photos/800/800?random=323',
                'https://picsum.photos/800/800?random=324'
            ],
            shortDescription: 'Clavier mécanique Corsair K95 RGB gaming premium',
            description: 'Le K95 RGB Platinum combine switches Cherry MX premium, éclairage RGB par touche et touches macro dédiées. Construction aluminium, repose-poignet amovible et logiciel iCUE pour une expérience gaming ultime.',
            active: true 
        },
        { 
            name: 'DeathAdder V3 Gaming Mouse', 
            brand: 'Razer', 
            price: 69.99, 
            thumbnail: 'https://picsum.photos/400/400?random=325', 
            images: [
                'https://picsum.photos/800/800?random=325',
                'https://picsum.photos/800/800?random=326'
            ],
            shortDescription: 'Souris gaming Razer DeathAdder V3 iconique',
            description: 'La DeathAdder V3 perpétue l\'héritage de la souris gaming la plus vendue au monde. Capteur Focus Pro 30K, switches optiques et ergonomie légendaire pour des performances gaming de niveau professionnel.',
            active: true 
        },
        { 
            name: 'Apex Pro Mechanical Keyboard', 
            brand: 'SteelSeries', 
            price: 179.99, 
            thumbnail: 'https://picsum.photos/400/400?random=327', 
            images: [
                'https://picsum.photos/800/800?random=327',
                'https://picsum.photos/800/800?random=328'
            ],
            shortDescription: 'Clavier SteelSeries Apex Pro avec switches ajustables',
            description: 'L\'Apex Pro révolutionne l\'expérience gaming avec ses switches magnétiques OmniPoint ajustables. Point d\'actuation personnalisable, écran OLED intégré et construction premium pour les gamers les plus exigeants.',
            active: true 
        },
        { 
            name: 'G Pro X Superlight 2', 
            brand: 'Logitech', 
            price: 159.99, 
            thumbnail: 'https://picsum.photos/400/400?random=329', 
            images: [
                'https://picsum.photos/800/800?random=329',
                'https://picsum.photos/800/800?random=330'
            ],
            shortDescription: 'Souris Logitech G Pro X Superlight 2 esports',
            description: 'La G Pro X Superlight 2 est développée avec les professionnels esports. Poids ultra-léger, capteur HERO 25K et technologie LIGHTSPEED pour une précision et une réactivité sans compromis.',
            active: true 
        }
    ],
    'Écrans': [
        { 
            name: 'TUF Gaming VG27AQ 27" 1440p', 
            brand: 'ASUS', 
            price: 329.99, 
            thumbnail: 'https://picsum.photos/400/400?random=335', 
            images: [
                'https://picsum.photos/800/800?random=335',
                'https://picsum.photos/800/800?random=336'
            ],
            shortDescription: 'Écran gaming ASUS TUF VG27AQ 27" 1440p IPS',
            description: 'L\'ASUS TUF Gaming VG27AQ combine dalle IPS 27" 1440p avec 165Hz et compatibilité G-SYNC. Couleurs fidèles, temps de réponse rapide et robustesse TUF pour une expérience gaming immersive.',
            active: true 
        },
        { 
            name: 'S2721DGF 27" 1440p 165Hz', 
            brand: 'Dell', 
            price: 299.99, 
            thumbnail: 'https://picsum.photos/400/400?random=337', 
            images: [
                'https://picsum.photos/800/800?random=337',
                'https://picsum.photos/800/800?random=338'
            ],
            shortDescription: 'Écran Dell S2721DGF 27" gaming 1440p',
            description: 'Le Dell S2721DGF offre un excellent rapport qualité-prix avec sa dalle Fast IPS 27" 1440p 165Hz. Compatible FreeSync/G-SYNC, design moderne et ergonomie complète pour le gaming et la productivité.',
            active: true 
        },
        { 
            name: '27GN950-B 4K 144Hz Nano IPS', 
            brand: 'LG', 
            price: 799.99, 
            thumbnail: 'https://picsum.photos/400/400?random=339', 
            images: [
                'https://picsum.photos/800/800?random=339',
                'https://picsum.photos/800/800?random=340',
                'https://picsum.photos/800/800?random=341'
            ],
            shortDescription: 'Écran LG 27GN950-B 4K 144Hz Nano IPS premium',
            description: 'Le LG 27GN950-B redéfinit le gaming 4K avec sa dalle Nano IPS 27" 144Hz. Couverture colorimétrique exceptionnelle, temps de réponse 1ms et compatibilité G-SYNC Ultimate pour une expérience gaming ultime.',
            active: true 
        },
        { 
            name: 'Odyssey G7 32" 1440p Curved', 
            brand: 'Samsung', 
            price: 599.99, 
            thumbnail: 'https://picsum.photos/400/400?random=342', 
            images: [
                'https://picsum.photos/800/800?random=342',
                'https://picsum.photos/800/800?random=343',
                'https://picsum.photos/800/800?random=344'
            ],
            shortDescription: 'Écran Samsung Odyssey G7 32" incurvé 1440p gaming',
            description: 'L\'Odyssey G7 de Samsung révolutionne l\'immersion gaming avec son écran incurvé 32" 1440p 240Hz. Courbure 1000R, technologie QLED et design futuriste pour une expérience gaming sans précédent.',
            active: true 
        },
        { 
            name: 'ROG Swift PG279QM 27" 240Hz', 
            brand: 'ASUS', 
            price: 699.99, 
            thumbnail: 'https://picsum.photos/400/400?random=345', 
            images: [
                'https://picsum.photos/800/800?random=345',
                'https://picsum.photos/800/800?random=346'
            ],
            shortDescription: 'Écran ASUS ROG Swift PG279QM 27" 240Hz esports',
            description: 'Le ROG Swift PG279QM est conçu pour l\'esports avec sa dalle Fast IPS 27" 1440p 240Hz. Temps de réponse ultra-rapide, G-SYNC et design ROG premium pour dominer la compétition.',
            active: true 
        }
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
                    thumbnail: productData.thumbnail,
                    images: productData.images,
                    shortDescription: productData.shortDescription,
                    description: productData.description,
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