document.addEventListener("DOMContentLoaded", function () {
    const executeButton = document.getElementById("execute-button");
    executeButton.addEventListener("click", function () {
        // Disable the button and update appearance
        executeButton.disabled = true;
        executeButton.innerText = "交易進行中";
        executeButton.style.backgroundColor = "#ccc"; // Set your desired color

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

    // Enable the button and reset appearance after all transactions are completed
    const executeButton = document.getElementById("execute-button");
    executeButton.disabled = false;
    executeButton.innerText = "執行交易";
    executeButton.style.backgroundColor = ""; // Reset to default or set your desired color

    // Add a message indicating all transactions are completed
    printResult("----全部交易已執行完成----");
}

async function executeTransaction(privateKey, rpc, nums, data) {
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const fromAddress = w3.eth.accounts.privateKeyToAccount(privateKey).address;


    try {
        const isNodeListening = await w3.eth.net.isListening();
        if (!isNodeListening) {
            printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
            return;
        }
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

        const receipts = await Promise.all(
            transactions.map(async (transaction) => {
                const signedTransaction = await w3.eth.accounts.signTransaction(transaction, privateKey);

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
