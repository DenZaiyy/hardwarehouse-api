import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import UserForm from "@/components/admin/users/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Utilisateurs - Ajout",
    description: "Ajouter un nouvelle utilisateur dans la liste des marques",
    robots: {
        index: false,
        follow: false
    }
}

const UserAddPage = async () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter un utilisateur</h1>

            <section>
                <Card>
                    <CardContent>
                        <UserForm method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default UserAddPage;