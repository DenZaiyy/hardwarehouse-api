'use client'

import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

type DiscountActionsProps = {
    discountId: string;
    discountActive: boolean;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

export function DiscountActions({ discountId, discountActive, onDelete, onToggle }: DiscountActionsProps) {
    const [open, setOpen] = useState(false)
    const [openToggle, setOpenToggle] = useState(false)

    return (
        <>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() =>
                            navigator.clipboard
                                .writeText(discountId)
                                .then(() => toast.success("ID copié"))
                                .catch((err) =>
                                    toast.error("Erreur de copie : " + err.message)
                                )
                        }
                    >
                        Copier l’ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/discounts/${discountId}`}>Voir</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/discounts/${discountId}/edit`}>Modifier</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setOpenToggle(true)}
                    >
                        {discountActive ? 'Désactiver' : 'Activer'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setOpen(true)}
                    >
                        Supprimer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la remise ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. La remise avec l&#39;ID {" "}
                            <strong>{discountId}</strong> sera définitivement supprimée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(discountId)}>
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={openToggle} onOpenChange={setOpenToggle}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{discountActive ? 'Désactiver' : 'Activer'} la remise ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action {discountActive ? 'désactivera' : 'activera'} la remise sur le produit ou la catégorie de produits sélectionner.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onToggle(discountId)}>
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}