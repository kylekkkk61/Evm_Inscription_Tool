let transactionMode = "self";
let recipientInput;
let useCustomGas = true;
let useCustomFee = true;
let isTransactionCancelled = false;

// 初始加載
document.addEventListener("DOMContentLoaded", function () {
    const executeButton = document.getElementById("execute-button");
    const pauseInput = document.getElementById("pause-input");
    const cancelButton = document.getElementById("cancel-button");

    // 初始模組加載
    recipientInput = document.getElementById("recipient-input");
    setTransactionMode("self");
    toggleGas();
    toggleFee();



    // RPC List
    const a1 = document.getElementById('a1');
    const a2 = document.getElementById('a2');
    const a3 = document.getElementById('a3');
    const a4 = document.getElementById('a4');
    const a5 = document.getElementById('a5');
    const a6 = document.getElementById('a6');

    document.getElementById('a1').style.border = "1px solid #8B5FBF";
    updateBSection(1);

    a1.textContent = 'Mainnet';
    a2.textContent = 'BSC';
    a3.textContent = 'Polygon';
    a4.textContent = 'Arbitrum';
    a5.textContent = 'Optimism';
    a6.textContent = 'Avalanche';


    // 執行交易
    executeButton.addEventListener("click", function () {
        executeButton.disabled = true;
        executeButton.innerText = "交易進行中";
        executeButton.style.backgroundColor = "#ccc";

        cancelButton.disabled = false;
        cancelButton.style.backgroundColor = "#FF4444"; // 亮紅色

        // 交易排程
        scheduleTransaction(pauseInput.value);
        setTransactionMode(transactionMode);
    });
    // 取消交易
    cancelButton.addEventListener("click", function () {
        isTransactionCancelled = true;
        cancelButton.disabled = true;

        printResult("----交易終止中----");
        cancelButton.style.backgroundColor = "#6d1c1c"; // 暗紅色
    });



    // Get chain id
    document.querySelectorAll('.a-block').forEach(function (aBlock, index) {
        aBlock.addEventListener('click', function () {
            document.querySelectorAll('.b-block').forEach(function (block) {
                block.style.border = "none";
            });

            updateBSection(index + 1);
        });
    });

    const aBlocks = document.querySelectorAll(".a-block");
    aBlocks.forEach(function (block) {
        block.addEventListener("click", function () {
            const blockId = block.innerText;
            showBInfo(blockId);
        });
    });

    // 在Chain id點擊相關處，為每個B欄位添加點擊事件
    document.querySelectorAll('.b-block').forEach(function (bBlock, index) {
        bBlock.addEventListener('click', function () {
            document.querySelectorAll('.b-block').forEach(function (block) {
                block.style.border = "none";
            });

            const selectedRPC = bBlock.textContent;
            document.getElementById('rpc-input').value = selectedRPC;

            bBlock.style.border = "1px solid #8B5FBF";
        });
    });
});



// Uodate rpc list according to selected chain
function updateBSection(aIndex) {
    const bSection = document.getElementById('b-section');
    const bBlocks = bSection.querySelectorAll('.b-block');

    // rpc list content
    //Mainnet, BSC, Polygon, Arbitrum, Optimism, Avalanche
    const contentMapping = {
        1: ['https://rpc.ankr.com/eth', 'https://eth.llamarpc.com', 'https://ethereum.publicnode.com'],
        2: ['https://binance.llamarpc.com', 'https://bsc-dataseed.bnbchain.org', 'https://bsc-pokt.nodies.app'],
        3: ['https://polygon.llamarpc.com', 'https://rpc.ankr.com/polygon', 'https://rpc-mainnet.maticvigil.com'],
        4: ['https://arbitrum.llamarpc.com', 'https://arbitrum.blockpi.network/v1/rpc/public', 'https://arbitrum-one.publicnode.com'],
        5: ['https://optimism.llamarpc.com', 'https://optimism.drpc.org', 'https://mainnet.optimism.io'],
        6: ['https://avalanche.public-rpc.com', 'https://api.avax.network/ext/bc/C/rpc', 'https://avalanche.drpc.org'],
    };

    // Update rpc list
    bBlocks.forEach(function (bBlock, index) {
        bBlock.textContent = contentMapping[aIndex][index];
    });

    document.querySelectorAll('.a-block').forEach(function (block) {
        block.style.border = "none";
    });
    document.getElementById('a' + aIndex).style.border = "1px solid #8B5FBF";
}


// Custom max gas fee
function toggleGas() {
    useCustomGas = !useCustomGas
    const gasButton = document.getElementById("gas-toggle");
    const gasInput = document.getElementById("custom-gas");

    if (useCustomGas) {
        gasButton.style.backgroundColor = "#8B5FBF";
        gasInput.value = "";
        gasInput.placeholder = "總Gas (含礦工小費)(Gwei)";
        gasInput.removeAttribute("readonly");
        gasInput.removeAttribute("disabled");
    } else {
        gasButton.style.backgroundColor = "#2E2E38";
        gasInput.value = "預設Gas (120% 市場Gas)";
        gasInput.setAttribute("readonly", true);
        gasInput.setAttribute("disabled", true);
    }
}
// Custom priority fee
function toggleFee() {
    useCustomFee = !useCustomFee
    const feeButton = document.getElementById("fee-toggle");
    const feeInput = document.getElementById("custom-fee");

    if (useCustomFee) {
        feeButton.style.backgroundColor = "#8B5FBF";
        feeInput.value = "";
        feeInput.placeholder = "自定 Prority Fee (Gwei) ";
        feeInput.removeAttribute("readonly");
        feeInput.removeAttribute("disabled");
    } else {
        feeButton.style.backgroundColor = "#2E2E38";
        feeInput.value = "使用預設 Pririty Fee";
        feeInput.setAttribute("readonly", true);
        feeInput.setAttribute("disabled", true);
    }
}


// Recipient section
function setTransactionMode(mode) {
    transactionMode = mode;

    // 取得相關元素
    const recipientInput = document.getElementById("recipient-input");
    const selfModeButton = document.getElementById("self-mode-button");
    const otherModeButton = document.getElementById("other-mode-button");

    // 根據模式設定相關元素的狀態
    if (transactionMode === "self") {
        recipientInput.disabled = true;
        recipientInput.value = "轉給自己";
        selfModeButton.style.backgroundColor = "#8B5FBF";
        selfModeButton.style.color = "#FFFFFF";
        otherModeButton.style.backgroundColor = "#2E2E38";
        otherModeButton.style.color = "#FFFFFF";
        recipientInput.style.backgroundColor = "#8B5FBF";
        recipientInput.style.color = "#FFFFFF"; // 文字
    } else if (transactionMode === "other") {
        recipientInput.disabled = false;
        recipientInput.value = "";
        recipientInput.placeholder = "發送至其他地址";
        selfModeButton.style.backgroundColor = "#2E2E38";
        selfModeButton.style.color = "#FFFFFF";
        otherModeButton.style.backgroundColor = "#8B5FBF";
        otherModeButton.style.color = "#FFFFFF";
        recipientInput.style.backgroundColor = "#2E2E38"; // 深色背景
        recipientInput.style.color = "#FFFFFF"; // 白色文字
    }
}

// Schedule transactions according to account numbers
async function scheduleTransaction(pauseSeconds) {
    const rpc = document.getElementById("rpc-input").value;
    const privateKeys = document.getElementById("private-key-input").value.trim().split("\n");
    const nums = parseInt(document.getElementById("nums-input").value);
    const data = document.getElementById("data-input").value;
    const toOtherAddress = document.getElementById("recipient-input").value;


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

    // Check account numbers
    const numAccounts = privateKeys.length;

    for (let i = 0; i < numAccounts; i++) {
        if (isTransactionCancelled) {
            break
        }
        // Print Account information
        printResult(`---- Account ${i + 1} ----`);

        const privateKey = privateKeys[i].trim();
        if (privateKey !== "") {
            await executeTransaction(privateKey, rpc, nums, data, pauseSeconds, toOtherAddress);
        }
    }

    // Enable the button and reset appearance after all transactions are completed
    const executeButton = document.getElementById("execute-button");
    const cancelButton = document.getElementById("cancel-button");
    executeButton.disabled = false;
    executeButton.innerText = "執行交易";
    executeButton.style.backgroundColor = "";
    cancelButton.style.backgroundColor = "#6d1c1c";
    printResult("----全部交易已執行完成----");
    isTransactionCancelled = false
    return;
}

// Send transactions to blockchain from wallet list
async function executeTransaction(privateKey, rpc, nums, data, pauseSeconds, toOtherAddress) {
    const w3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const fromAddress = w3.eth.accounts.privateKeyToAccount(privateKey).address;
    const toAddress = transactionMode === "self" ? fromAddress : toOtherAddress;

    try {
        const isNodeListening = await w3.eth.net.isListening();
        if (!isNodeListening) {
            printResult("網路連接失敗 請重新開啟腳本/更換rpc節點");
            return;
        }

        const nonce = await w3.eth.getTransactionCount(fromAddress);

        for (let i = 0; i < nums; i++) {
            if (isTransactionCancelled) {
                printResult("----交易已終止----");
                //reset cancel button
                isTransactionCancelled = false

                return;
            }
            const gasPrice = await w3.eth.getGasPrice();
            const adjustedGasPrice = Math.round(gasPrice * 1.2);

            const inputGas = document.getElementById("custom-gas").value
            const inputPriority = document.getElementById("custom-fee").value

            const finalGasPrice = (useCustomGas && !useCustomFee) ? w3.utils.toWei(inputGas, "gwei") : (!useCustomGas && !useCustomFee) ? adjustedGasPrice : undefined; //任一有自訂則 gasPrice 不指定
            const maxFeePerGas = (useCustomGas && useCustomFee) ? w3.utils.toWei(inputGas, "gwei") : undefined;
            const maxPriorityFeePerGas = useCustomFee ? w3.utils.toWei(inputPriority, "gwei") : undefined;
            const chainId = await w3.eth.getChainId();
            const gas = chainId === 42161 ? 6000000 : 100000; //Arbitrum gas adjustment



            // Build transaction
            const transaction =
            {
                from: fromAddress,
                to: toAddress,
                value: w3.utils.toWei("0", "ether"),
                nonce: nonce + i,
                gas: gas,
                gasPrice: finalGasPrice,
                maxFeePerGas: maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                data: w3.utils.toHex(data),
                chainId: chainId,
            }

            // Print transaction information
            if (i === 0) {
                printResult(`網路連接成功 開始發送交易 (帳號：${fromAddress})`);
                printResult(`當前nonce: ${transaction.nonce}, 接收地址: ${toAddress}`);
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


