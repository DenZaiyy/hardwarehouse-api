"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

type ProductAttributeValue = {
    value: string;
    categoryAttribute: {
        displayOrder: number;
        attribute: {
            name: string;
            type: string;
        };
    };
};

type CharacteristicsProps = {
    attributes: ProductAttributeValue[];
};

const Characteristics = ({ attributes }: CharacteristicsProps) => {
    if (!attributes || attributes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Caractéristiques</CardTitle>
                    <CardDescription>Aucune caractéristique spécifique définie pour ce produit</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Sort attributes by display order
    const sortedAttributes = [...attributes].sort(
        (a, b) => a.categoryAttribute.displayOrder - b.categoryAttribute.displayOrder
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
                <CardDescription>Spécifications techniques du produit</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {sortedAttributes.map((attr, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-sm text-muted-foreground">
                                    {attr.categoryAttribute.attribute.name}
                                </span>
                                <span className="font-semibold">
                                    {formatAttributeValue(attr.value, attr.categoryAttribute.attribute.type)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Helper function to format attribute values based on type
const formatAttributeValue = (value: string, type: string) => {
    switch (type) {
        case 'BOOLEAN':
            return value === 'true' ? 'Oui' : 'Non';
        case 'NUMBER':
            return value;
        default:
            return value;
    }
};

export default Characteristics;