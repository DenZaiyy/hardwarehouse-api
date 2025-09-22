interface TProduct {
    id: string,
    name: string,
    slug: string
    image?: string,
    price: number,
    category: TCategory,
    Brands: TBrand,
    createdAt: string,
    updatedAt: string
}

interface TCategory {
    id: string,
    name: string,
    logo?: string,
    slug: string,
    createdAt: string,
    updatedAt: string,
    products: TProduct[]
}

interface TBrand {
    id: string,
    name: string,
    logo?: string,
    slug: string,
    createdAt: string,
    updatedAt: string,
    products: TProduct[]
}

interface TStock {
    id: string,
    product: TProduct,
    quantity: number
}