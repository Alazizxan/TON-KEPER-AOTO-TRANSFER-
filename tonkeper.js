import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

async function performTransfer() {
  const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: 'fdfc50434ff75d5d883490c0ddf73b48336d9a7843d7419040346057983c5af7'
  });

  const mnemonics = "vacant piece tell size fantasy book clean casino general inmate erosion never truth outer nest quantum crazy crush side convince lunch park fruit turkey".split(" ");
  
  try {
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const workchain = 0;
    const wallet = WalletContractV4.create({ 
      workchain, 
      publicKey: keyPair.publicKey 
    });
    
    const contract = client.open(wallet);
    
    // Instead of isDeployed, check the balance to determine if wallet exists
    const balance = await contract.getBalance();
    console.log('Wallet balance:', balance.toString(), 'nanoTON');
    
    // Rest of the transfer logic remains the same
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