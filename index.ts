import { createPublicClient, createWalletClient, defineChain, encodeFunctionData, http, keccak256, type Block, type TransactionRequestEIP1559 } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const happyTestnet = defineChain({
    id: 216,
    name: "Happy Testnet",
    rpcUrls: {
        default: {
            http: ["https://rpc.testnet.happy.tech/http"],
        },
    },
    nativeCurrency: {
        name: "HAPPY",
        symbol: "HAPPY",
        decimals: 18,
    },
})

const contractAddress = "0xAD5A4f9CeaBC2990DD66039FE123828631b4e0Ea"

const abi = [
    {
        "inputs": [],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const

const data = encodeFunctionData({
    abi,
    functionName: "increment",
})

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

console.log(account.address)

const publicClient = createPublicClient({
    chain: happyTestnet,
    transport: http(),
})

const walletClient = createWalletClient({
    account,
    chain: happyTestnet,
    transport: http(),
})

let nonce = await publicClient.getTransactionCount({
    address: account.address,
})


const delayTimes = []
const quantityOfTransactions = 10

for (let i = 0; i < quantityOfTransactions; i++) {
    const transactionParams: TransactionRequestEIP1559 & { gas: bigint, chainId: number } = {
        type: "eip1559",
        from: account.address,
        to: contractAddress,
        data,
        value: 0n,
        nonce,
        maxFeePerGas: 300n,
        maxPriorityFeePerGas: 0n,
        gas: 30000n,
        chainId: happyTestnet.id,
    }

    const signedTransaction = await walletClient.account.signTransaction(transactionParams)


    const hash = keccak256(signedTransaction)
    
    await walletClient.sendRawTransaction({
        serializedTransaction: signedTransaction,
    })
    console.log("Transaction with hash", hash)

    const sentIn = Date.now()
    console.log("Sent in", sentIn)

    const receipt = await publicClient.waitForTransactionReceipt({
        hash,
    })

    const includedBlock = await publicClient.getBlock({
        blockNumber: receipt.blockNumber,
    })

    const includedIn = Number(includedBlock.timestamp) * 1000

    console.log("Included in", includedIn)
    console.log("--------------------------------")

    delayTimes.push(includedIn - sentIn)

    nonce++
}

console.log("Average delay", delayTimes.reduce((a, b) => a + b, 0) / delayTimes.length)




