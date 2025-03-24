import { publicClient } from "./index"

async function measureBlockTime() {
  let lastBlockNumber = 0n
  let lastBlockTimestamp = 0n

  while (true) {
    const block = await publicClient.getBlock({ blockTag: "latest" })
    
    if (block.number !== lastBlockNumber) {
      if (lastBlockNumber > 0) {
        const timeDiffSeconds = block.timestamp - lastBlockTimestamp
        console.log(`New block #${block.number} - Time since last block: ${timeDiffSeconds} seconds`)
      }
      
      
      lastBlockNumber = block.number
      lastBlockTimestamp = block.timestamp
    }

    
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

measureBlockTime()