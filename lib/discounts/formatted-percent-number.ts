export function formattedPercentNumber(
    baseDiscountAmount: number
): string {
    let amount = baseDiscountAmount;
    amount = amount / 100;

    return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}