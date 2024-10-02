const { Web3 } = require('web3');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const { default: Wallet } = require('ethereumjs-wallet');

// connection on ganache
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

// Mnemonic from Ganache
const mnemonic = "paste your mnemonic on ganache here";

// Amount of ETH to send (0.02 ETH)
const amountToSend = web3.utils.toWei("0.02", "ether");

// Function to generate addresses from mnemonic
function generateAddressesFromMnemonic(mnemonic, count) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdWallet = hdkey.fromMasterSeed(seed);
    const addresses = [];

    for (let i = 0; i < count; i++) {
        const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`).getWallet();
        const address = `0x${wallet.getAddress().toString('hex')}`;
        addresses.push(address);
    }
    return addresses;
}

// Send ETH to the generated addresses
async function distributeEth(sender, addresses) {
    for (let i = 0; i < addresses.length; i++) {
        try {
            const receipt = await web3.eth.sendTransaction({
                from: sender,
                to: addresses[i],
                value: amountToSend,
                gas: 21000 // Standard gas for ETH transfer transaction
            });
            console.log(`Transaction hash: ${receipt.transactionHash} | Sent 0.02 ETH to ${addresses[i]}`);
        } catch (error) {
            console.error(`Failed to send ETH to ${addresses[i]}:`, error);
        }
    }
}

async function main() {
    // Get the first account from Ganache that has ETH
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    // Generate 2000 addresses from mnemonic
    const recipientAddresses = generateAddressesFromMnemonic(mnemonic, 2000);

    // Distribute ETH to the generated addresses
    await distributeEth(sender, recipientAddresses);
    console.log('Distribution completed');
}

// Run the script
main().catch(err => console.error("Error:", err));
