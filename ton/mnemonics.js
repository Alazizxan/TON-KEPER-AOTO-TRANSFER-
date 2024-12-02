const bip39 = require("bip39");


const generatemnemonic=() => {
    try {
        let mnemonic=bip39.generateMnemonic(256);
    } catch (error) {
        console.log(error);
    }
    
}
generatemnemonic()