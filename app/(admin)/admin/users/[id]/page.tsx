import {apiUserService} from "@/services/userService";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Utilisateur - Détails",
    description: "Gérer le détails d'un utilisateur et voir les dernières transactions effectuées",
    robots: {
        index: false,
        follow: false
    }
}

interface UserParams {
    params: Promise<{ id: string }>;
}

const UserDetails = async ({ params }: UserParams) => {
    const { id } = await params;
    const user = await apiUserService.getUser(id);

    return (
        <>
            <div>
                <h1>Détails de l&#39;utilisateur</h1>
                <p>ID: {user.id}</p>
                <p>Pseudo: {user.username}</p>
                <p>Nom de famille: {user.lastName}</p>
                <p>Prénom: {user.firstName}</p>
                <p>Email: {user.emailAddresses[0].emailAddress}</p>
                <p>Créé le: {new Date(user.createdAt).toLocaleDateString('fr', {day: "numeric", hour: "2-digit", minute: "2-digit", year: "numeric", month: "numeric"})}</p>
                <p>Mis à jour le: {new Date(user.updatedAt).toLocaleDateString('fr', {day: "numeric", hour: "2-digit", minute: "2-digit", year: "numeric", month: "numeric"})}</p>
                <p>Dernière connexion: {user.lastSignInAt && new Date(user.lastSignInAt).toLocaleDateString('fr', {weekday: "long", day: "2-digit", hour: "2-digit", minute: "2-digit", year: "numeric", month: "short"})}</p>
                <p>Dernière activité: {user.lastActiveAt && new Date(user.lastActiveAt).toLocaleDateString('fr', {weekday: "long", day: "2-digit", hour: "2-digit", minute: "2-digit", year: "numeric", month: "short"})}</p>
            </div>
        </>
    )
}

export default UserDetails;