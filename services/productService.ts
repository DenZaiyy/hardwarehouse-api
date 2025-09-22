export interface ProductService {
    getProducts: () => Promise<TProduct[]>
    getProduct: (id: string) => Promise<TProduct>
    createProduct: (data: Partial<TProduct>) => Promise<TProduct>
    updateProduct: (id: string, data: Partial<TProduct>) => Promise<TProduct>
    deleteProduct: (id: string) => Promise<void>
}

export const apiProductService: ProductService = {
    getProducts: async (): Promise<TProduct[]> => {
        const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)

        if (!res.ok) throw new Error('Failed to fetch products')

        return res.json()
    },
    getProduct: async (id: string): Promise<TProduct> => {
        const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)

        if (!res.ok) throw new Error('Failed to fetch product')

        return res.json()
    },
    createProduct: async (data: Partial<TProduct>): Promise<TProduct> => {
        const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!res.ok) throw new Error('Failed to create product')

        return res.json()
    },
    updateProduct: async (id: string, data: Partial<TProduct>): Promise<TProduct> => {
        const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!res.ok) throw new Error('Failed to update product')

        return res.json()
    },
    deleteProduct: async (id: string): Promise<void> => {
        const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: 'DELETE'
        })

        if (!res.ok) throw new Error('Failed to delete product')
    }
}