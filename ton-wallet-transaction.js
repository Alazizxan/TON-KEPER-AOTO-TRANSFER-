const { TonClient, WalletContractV4, internal } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");
const fs = require('fs');
const path = require('path');

export async function performTransfer(network) {
  // Read wallet configuration
  const configPath = path.join(__dirname, 'wallet_configs', network, 'wallet_config.json');
  const walletConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const client = new TonClient({
    endpoint: network === 'testnet' 
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: network === 'testnet'
      ? 'fdfc50434ff75d5d883490c0ddf73b48336d9a7843d7419040346057983c5af7'
      : 'YOUR_MAINNET_API_KEY'
  });

  const mnemonics = walletConfig.mnemonics.split(' ');
  
  try {
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const workchain = 0;
    
    const wallet = WalletContractV4.create({
      workchain,
      publicKey: Buffer.from(walletConfig.publicKey, 'hex')
    });

    const contract = client.open(wallet);

    // Check balance
    const balance = await contract.getBalance();
    console.log(`Wallet balance: ${balance.toString()} nanoTON`);

    // Transfer configuration
    const transferAmount = BigInt(1_000_000_000); // 1 TON in nanoTON
    const recipientAddresses = {
      testnet: 'EQAtrSoxqfevUQizRuFa8RIzIwXJU1JMKSoIATuVCPSrSnPn',
      mainnet: 'REPLACE_WITH_MAINNET_RECIPIENT'
    };

    if (balance < transferAmount) {
      console.log('Insufficient balance for transfer');
      return;
    }

    const seqno = await contract.getSeqno();
    console.log('Wallet seqno:', seqno);

    // Send transfer
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [internal({
        value: '1', // 1 TON
        to: recipientAddresses[network],
        body: `Transfer from ${network} wallet`
      })]
    });

    console.log(`Transfer successful on ${network}!`);
  } catch (error) {
    console.error(`Transfer failed on ${network}:`, error);
  }
}

// Main execution
async function main() {
  try {
    await performTransfer('testnet');
    // Uncomment for mainnet when ready
    // await performTransfer('mainnet');
  } catch (error) {
    console.error('Transaction error:', error);
  }
}

main();