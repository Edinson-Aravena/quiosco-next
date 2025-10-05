export function formatCurrency(amount: number)  {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getImagePath(imagePath: string) {
    const cloudinaryBaseUrl = 'https://res.cloudinary.com';
    if (imagePath.startsWith(cloudinaryBaseUrl)) {
        return imagePath;
    } else {
        return `/products/${imagePath}.jpg`
    }
}