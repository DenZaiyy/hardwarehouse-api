import {Prisma, Transactions} from "@prisma/client";
import {BadRequestError, ConflictError} from "@/lib/api/errors";

type DbClient = Prisma.TransactionClient;

/** Auteur d'un mouvement : la personne connectée au back-office. */
export interface StockMovementAuthor {
    userId: string | null;
    userFullName: string;
}

/**
 * Règles d'écriture des stocks, appelées dans la transaction de la route :
 * - toute quantité qui change laisse un mouvement (table Transactions), écrit dans la même transaction ;
 * - une quantité n'est remplacée que si elle vaut toujours ce que le serveur a lu (comparaison-échange) : une écriture
 *   arrivée entre-temps (sortie de stock d'une commande, autre membre de l'équipe) donne un 409 au lieu d'être écrasée.
 * La quantité affichée et l'historique ne peuvent donc pas diverger. La sortie de stock des commandes de la boutique
 * (POST /api/v1/stock-exits) suit les mêmes règles avec un décrément.
 */
export async function recordStockMovement(
    tx: DbClient,
    movement: { productId: string; oldQuantity: number; newQuantity: number },
    author: StockMovementAuthor,
): Promise<Transactions> {
    return tx.transactions.create({
        data: {
            type: movement.newQuantity > movement.oldQuantity,
            oldQtt: movement.oldQuantity,
            newQtt: movement.newQuantity,
            userId: author.userId,
            userFullName: author.userFullName,
            product: {connect: {id: movement.productId}},
        },
    });
}

/**
 * Remplace la quantité lue par le serveur dans cette transaction et trace le mouvement.
 * @returns le mouvement, ou null si la quantité ne change pas
 */
export async function changeStockQuantity(
    tx: DbClient,
    stock: { id: string; productId: string; quantity: number },
    newQuantity: number,
    author: StockMovementAuthor,
): Promise<Transactions | null> {
    const oldQuantity = stock.quantity;
    if (newQuantity === oldQuantity) {
        return null;
    }

    const {count} = await tx.stocks.updateMany({
        where: {id: stock.id, quantity: oldQuantity},
        data: {quantity: newQuantity},
    });

    if (count !== 1) {
        throw new ConflictError("Le stock a été modifié entre-temps : rechargez la page, puis recommencez.");
    }

    return recordStockMovement(tx, {productId: stock.productId, oldQuantity, newQuantity}, author);
}

/**
 * Mouvement saisi dans le back-office (entrée ou sortie d'une quantité). La quantité de départ affichée par le
 * formulaire sert de jeton : si le stock a bougé depuis son ouverture, ou si le formulaire part deux fois, le
 * mouvement est refusé. La quantité finale est calculée ici, jamais reprise du navigateur.
 */
export async function applyManualMovement(
    tx: DbClient,
    movement: { productId: string; type: boolean; expectedQuantity: number; movedQuantity: number },
    author: StockMovementAuthor,
): Promise<Transactions> {
    if (movement.movedQuantity <= 0) {
        throw new BadRequestError("La quantité du mouvement doit être positive.");
    }

    const stock = await tx.stocks.findUnique({where: {productId: movement.productId}});
    const currentQuantity = stock?.quantity ?? 0;

    if (currentQuantity !== movement.expectedQuantity) {
        throw new ConflictError(`Le stock a changé depuis l'ouverture du formulaire : ${currentQuantity} en stock. Rechargez la page, puis recommencez.`);
    }

    const newQuantity = movement.type ? currentQuantity + movement.movedQuantity : currentQuantity - movement.movedQuantity;
    if (newQuantity < 0) {
        throw new ConflictError(`Stock insuffisant : ${currentQuantity} disponible(s), ${movement.movedQuantity} demandé(s).`);
    }

    if (!stock) {
        // Produit sans stock : le mouvement l'ouvre
        await tx.stocks.create({data: {productId: movement.productId, quantity: newQuantity}});

        return recordStockMovement(tx, {productId: movement.productId, oldQuantity: 0, newQuantity}, author);
    }

    const recorded = await changeStockQuantity(tx, stock, newQuantity, author);
    if (!recorded) {
        throw new BadRequestError("La quantité du mouvement doit être positive.");
    }

    return recorded;
}
