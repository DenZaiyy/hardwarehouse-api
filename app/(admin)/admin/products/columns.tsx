"use client"

import {ColumnDef} from "@tanstack/react-table"
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {Brands, Categories} from "@prisma/client";
import {formatDate} from "@/lib/utils";
import Image from "next/image";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {ProductActions} from "@/components/admin/products/actions";
import Link from "next/link";
import {getProduct, updateProduct} from "@/services/product.service";

async function handleConfirm(productSlug: string) {
    const product = await getProduct(productSlug);
    const data = {
        "name": product.name,
        "thumbnail": product.thumbnail,
        "price": product.price,
        "categoryId": product.categoryId,
        "active": !product.active
    }
    await updateProduct(productSlug, data)
    toast.success(`Produit ${product.active ? "désactiver" : "activer"} avec succès`)
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<ProductsWithCategoryAndBrand>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
    },
    {
        accessorKey: "thumbnail",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Images" />
        ),
        cell: ({ row }) => {
            const thumbnail: string = row.getValue('thumbnail');
            const product = row.original;
            const hasGallery = product.images && product.images.length > 0;
            
            return (
                <div className="flex items-center space-x-2">
                    <div className="w-16 h-16 relative">
                        {thumbnail ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer relative w-16 h-16 rounded-md overflow-hidden border">
                                        <Image 
                                            src={thumbnail} 
                                            alt={`Image de ${product.name}`} 
                                            fill 
                                            className="object-cover hover:scale-105 transition-transform" 
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogTitle>{product.name}</DialogTitle>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Image principale</h4>
                                            <div className="relative w-full h-64">
                                                <Image 
                                                    src={thumbnail} 
                                                    alt={`Image de ${product.name}`} 
                                                    fill 
                                                    className="object-contain rounded" 
                                                />
                                            </div>
                                        </div>
                                        {hasGallery && (
                                            <div>
                                                <h4 className="font-medium mb-2">Galerie ({product.images.length} images)</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {product.images.map((img: string, index: number) => (
                                                        <div key={index} className="relative w-full h-20">
                                                            <Image 
                                                                src={img} 
                                                                alt={`Image ${index + 1} de ${product.name}`} 
                                                                fill 
                                                                className="object-cover rounded" 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-xs text-gray-400">Pas d&#39;image</span>
                            </div>
                        )}
                    </div>
                    {hasGallery && (
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-blue-600">+{product.images.length}</span>
                            <span className="text-xs text-gray-500">photos</span>
                        </div>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prix HT" />
        ),
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(price);

            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        accessorKey: "brand",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Marque" />
        ),
        cell: ({ row }) => {
            const brand: Brands = row.getValue('brand');

            if (!brand) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/brands/${brand.slug}`} className="underline underline-offset-5">{brand.name}</Link></div>
        }
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Catégorie" />
        ),
        cell: ({ row }) => {
            const category: Categories = row.getValue('category');

            if (!category) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/categories/${category.slug}`} className="underline underline-offset-5">{category.name}</Link></div>
        }
    },
    {
        accessorKey: "active",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actif" />
        ),
        cell: ({ row }) => {
            const active = row.getValue('active');

            return <div className={`font-medium ${active ? 'text-green-500' : 'text-red-500'}`}>{active ? "Oui" : "Non"}</div>
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Crée le" />
        ),
        cell: ({ row }) => {
            const createdAt: string = row.getValue('createdAt')
            return <div>{formatDate(createdAt)}</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mise à jour le" />
        ),
        cell: ({ row }) => {
            const updatedAt: string = row.getValue('updatedAt')
            return <div>{formatDate(updatedAt)}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return (
                <ProductActions
                    productId={product.id}
                    productSlug={product.slug}
                    productName={product.name}
                    onDisable={(slug) => handleConfirm(slug)}
                    productActive={product.active}
                />
            )
        }
    }
]