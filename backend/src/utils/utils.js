export function isValidEmail (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateAdherentPassword() {

    const randomNumber = Math.floor( 10000 + ( Math.random() * 90000 ) )

    return `AKA-${randomNumber}`;

}