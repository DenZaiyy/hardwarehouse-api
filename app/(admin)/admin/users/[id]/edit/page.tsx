import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {apiUserService} from "@/services/userService";
import UserForm from "@/components/admin/users/form";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Utilisateur - Modification",
    description: "Modifier les informations d'un utilisateur.",
    robots: {
        index: false,
        follow: false
    }
}

interface UserParams {
    params: Promise<{ id: string }>;
}

const UserEditPage = async ({ params }: UserParams) => {
    const { id } = await params;
    const user = await apiUserService.getUser(id);

    if(!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier l&#39;utilisateur</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{user.username}</CardTitle>
                </CardHeader>
                <CardContent>
                    <UserForm user={user} method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default UserEditPage;