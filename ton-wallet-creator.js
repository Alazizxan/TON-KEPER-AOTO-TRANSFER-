import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





export  async function createTONWallet(network) {
  const client = new TonClient({
    endpoint: network === 'testnet' 
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: network === 'testnet'
      ? 'fdfc50434ff75d5d883490c0ddf73b48336d9a7843d7419040346057983c5af7'
      : 'YOUR_MAINNET_API_KEY'
  });

  // Generate mnemonic
  const mnemonics = crypto.randomBytes(32).toString('hex').split(' ');
  
  const keyPair = await mnemonicToPrivateKey(mnemonics);
  const workchain = 0;
  
  const wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey
  });

  const contract = client.open(wallet);

  // Wallet information
  const walletInfo = {
    address: contract.address.toString(),
    publicKey: keyPair.publicKey.toString('hex'),
    mnemonics: mnemonics.join(' '),
    network: network
  };

  // Create directory
  const dirPath = path.join(__dirname, 'wallet_configs', network);
  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`Config directory created at: ${dirPath}`);
  

  // Save wallet info
  const filePath = path.join(dirPath, 'wallet_config.json');
  fs.writeFileSync(filePath, JSON.stringify(walletInfo, null, 2));

  console.log(`Wallet created for ${network}:`, walletInfo.address);
  return walletInfo;
}

// Main execution
async function main() {
  try {
    await createTONWallet('testnet');
    await createTONWallet('mainnet');
  } catch (error) {
    console.error('Wallet creation error:', error);
  }
}

main();