import { TonClient, WalletContractV4, internal } from "@ton/ton"; 
import { mnemonicToPrivateKey } from "@ton/crypto";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// import.meta.url yordamida __dirname ni olish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config faylini o'qish
const configPath = path.join(__dirname, 'wallet_configs', 'testnet', 'wallet_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function performTransfer() {
  const client = new TonClient({
    endpoint: config.network === 'testnet' ? 'https://testnet.toncenter.com/api/v2/jsonRPC' : 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: 'fdfc50434ff75d5d883490c0ddf73b48336d9a7843d7419040346057983c5af7'
  });

  // Mnemoniklarni config faylidan olish
  const mnemonics = config.mnemonics.split(" ");
  
  try {
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const workchain = 0;
    const wallet = WalletContractV4.create({ 
      workchain, 
      publicKey: keyPair.publicKey 
    });
    
    const contract = client.open(wallet);
    
    // Wallet balansini tekshirish
    const balance = await contract.getBalance();
    console.log('Wallet balance:', balance.toString(), 'nanoTON');
    
    const transferAmount = BigInt(1_000_000_000); // 1 TON in nanoTON
    if (balance < transferAmount) {
      console.log('Insufficient balance for transfer');
      return;
    }
    
    const seqno = await contract.getSeqno();
    console.log('Wallet seqno:', seqno);
    
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [internal({
        value: '1', // 1 TON
        to: '0QAtrSoxqfevUQizRuFa8RIzIwXJU1JMKSoIATuVCPSrSnPn', // Recipient address
        body: 'Transfer from testnet wallet',
      })]
    });
    
    console.log('Transfer successful!');
  } catch (error) {
    console.error('Transfer failed:', error);
  }
}

performTransfer().catch(console.error);
