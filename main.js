const TonWeb = require('tonweb'); // TonWeb kutubxonasini import qilish

// TonWeb instansiyasini yaratish
const tonweb = new TonWeb();

// Wallet yaratish
const wallet = tonweb.wallet.create({});

(async () => {
    // Wallet manzilini olish
    const address = await wallet.getAddress();
    console.log("Address:", address.toString(true, true, false));

    // PublicKey olish
    const publicKey = wallet.publicKey;
    console.log("Public Key:", publicKey);

    // SecretKey olish
    const secretKey = wallet.secretKey;
    console.log("Secret Key:", secretKey);
})();
