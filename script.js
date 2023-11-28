document.addEventListener("DOMContentLoaded", function () {
    // Set up Web3 provider
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // You can replace this with your RPC endpoint

    document.getElementById("execute-button").addEventListener("click", function () {
        scheduleTransaction();
    });
});

async function scheduleTransaction() {
    const rpc = document.getElementById("rpc-input").value;
    const privateKeys = document.getElementById("private-key-input").value.trim().split("\n");
    const nums = parseInt(document.getElementById("nums-input").value);
    const data = document.getElementById("data-input").value;

    // Clear result textarea
    document.getElementById("result-text").value = "";

    // Set up Web3 instance
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc));

    // Check if the node is listening
    const isNodeListening = await w3.eth.net.isListening();
    if (!isNodeListening) {
        printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
        return;
    }

    for (const privateKey of privateKeys) {
        const cleanedPrivateKey = privateKey.trim();
        if (cleanedPrivateKey !== "") {
            await executeTransaction(cleanedPrivateKey, rpc, nums, data);
        }
    }
}
async function executeTransaction(privateKey, rpc, nums, data) {
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const fromAddress = w3.eth.accounts.privateKeyToAccount(privateKey).address;

    // Check if the node is listening
    const isNodeListening = await w3.eth.net.isListening();
    if (!isNodeListening) {
        printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
        return;
    }

    try {
        printResult(`網路連接成功 開始發送交易 (帳號：${fromAddress})`);

        // Ensure that obtaining the nonce is done synchronously
        const nonce = await w3.eth.getTransactionCount(fromAddress);
        printResult(`當前nonce: ${nonce}, 發送地址: ${fromAddress}`);

        const transactions = [];

        for (let i = 0; i < nums; i++) {
            const transaction = {
                from: fromAddress,
                to: fromAddress,
                value: w3.utils.toWei("0", "ether"),
                nonce: nonce + i,
                gas: 50000,
                gasPrice: await w3.eth.getGasPrice(),
                data: w3.utils.toHex(data),
                chainId: await w3.eth.getChainId(),
            };

            transactions.push(transaction);
        }

        const signedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                return await w3.eth.accounts.signTransaction(transaction, privateKey);
            })
        );

        const receipts = await Promise.all(
            signedTransactions.map(async (signedTransaction) => {
                return await new Promise((resolve, reject) => {
                    w3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                        .on('receipt', receipt => resolve(receipt))
                        .on('error', reject);
                });
            })
        );

        receipts.forEach((receipt, index) => {
            printResult(`交易成功，Hash: ${receipt.transactionHash}, nonce: ${transactions[index].nonce}`);
        });

    } catch (error) {
        console.error("Error checking node connection:", error);
        printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
    }
}


function printResult(message) {
    const resultText = document.getElementById("result-text");
    resultText.value += message + "\n";
    resultText.scrollTop = resultText.scrollHeight;
}
