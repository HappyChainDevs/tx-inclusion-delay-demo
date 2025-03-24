import { createPublicClient, createWalletClient, defineChain, encodeFunctionData, http, keccak256, type Block, type TransactionRequestEIP1559 } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const riseSepolia = defineChain({
    id: 11155931,
    name: "Rise Sepolia",
    rpcUrls: {
        default: {
            http: ["https://testnet.riselabs.xyz"],
        },
    },
    nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
    },
})

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

console.log(account.address)

export const publicClient = createPublicClient({
    chain: riseSepolia,
    transport: http(),
})

const walletClient = createWalletClient({
    account,
    chain: riseSepolia,
    transport: http(),
})

let nonce = await publicClient.getTransactionCount({
    address: account.address,
})



async function run(){
    const delayTimes = []
    const quantityOfTransactions = 10

    for (let i = 0; i < quantityOfTransactions; i++) {
        const transactionParams: TransactionRequestEIP1559 & { gas: bigint, chainId: number } = {
            type: "eip1559",
            from: account.address,
            to: account.address,
            data: "0x",
            value: 0n,
            nonce,
            maxFeePerGas: 300n,
            maxPriorityFeePerGas: 0n,
            gas: 30000n,
            chainId: riseSepolia.id,
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
        console.log("Receipt.blockNumber", receipt.blockNumber)
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
}

run()



