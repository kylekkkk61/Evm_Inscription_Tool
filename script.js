document.addEventListener("DOMContentLoaded", function () {
    const executeButton = document.getElementById("execute-button");
    const pauseInput = document.getElementById("pause-input");

    executeButton.addEventListener("click", function () {
        // Disable the button and update appearance
        executeButton.disabled = true;
        executeButton.innerText = "交易進行中";
        executeButton.style.backgroundColor = "#ccc";

        scheduleTransaction(pauseInput.value); // 傳遞秒數給 scheduleTransaction
    });
});

async function scheduleTransaction(pauseSeconds) {
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

    //
    const numAccounts = privateKeys.length;

    for (let i = 0; i < numAccounts; i++) {
        // Print Account information
        printResult(`---- Account ${i + 1} ----`);

        const privateKey = privateKeys[i].trim();
        if (privateKey !== "") {
            await executeTransaction(privateKey, rpc, nums, data, pauseSeconds); // 將 pauseSeconds 傳遞給 executeTransaction
        }
    }

    // Enable the button and reset appearance after all transactions are completed
    const executeButton = document.getElementById("execute-button");
    executeButton.disabled = false;
    executeButton.innerText = "執行交易";
    executeButton.style.backgroundColor = "";

    printResult("----全部交易已執行完成----");
}

async function executeTransaction(privateKey, rpc, nums, data, pauseSeconds) {
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const fromAddress = w3.eth.accounts.privateKeyToAccount(privateKey).address;

    try {
        const isNodeListening = await w3.eth.net.isListening();
        if (!isNodeListening) {
            printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
            return;
        }

        const nonce = await w3.eth.getTransactionCount(fromAddress);

        for (let i = 0; i < nums; i++) {
            const gasPrice = await w3.eth.getGasPrice();
            const adjustedGasPrice = Math.round(gasPrice * 1.1);
            const chainId = await w3.eth.getChainId();
            const gas = chainId === 42161 ? 6000000 : 50000;

            const transaction = {
                from: fromAddress,
                to: fromAddress,
                value: w3.utils.toWei("0", "ether"),
                nonce: nonce + i,
                gas: gas,
                gasPrice: adjustedGasPrice,
                data: w3.utils.toHex(data),
                chainId: chainId,
            };

            // Print transaction information
            if (i === 0) {
                printResult(`網路連接成功 開始發送交易 (帳號：${fromAddress})`);
                printResult(`當前nonce: ${transaction.nonce}, 發送地址: ${fromAddress}`);
            }

            const signedTransaction = await w3.eth.accounts.signTransaction(transaction, privateKey);

            try {
                const receipt = await w3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
                printResult(`交易成功，Hash: ${receipt.transactionHash}, nonce: ${transaction.nonce}`);
            } catch (error) {
                console.error("Error sending transaction:", error);
                printResult(`交易失敗，nonce: ${transaction.nonce}, Error: ${error.message}`);
            }

            await pauseForSeconds(pauseSeconds);
        }
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

async function pauseForSeconds(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
