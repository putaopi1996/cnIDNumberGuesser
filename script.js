function processIDs() {
    const fileInput = document.getElementById('fileInput');
    const idTextarea = document.getElementById('idTextarea');
    const resultList = document.getElementById('resultList');

    // 清空之前的结果
    resultList.innerHTML = '';

    // 读取文件内容
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            idTextarea.value = fileContent; // 将文件内容显示在 textarea 中
            const idArray = fileContent.trim().split('\n'); // 按行分割成数组
            validateAndGuessIDs(idArray);
        };

        reader.onerror = function(event) {
            alert('读取文件出错');
        };

        reader.readAsText(file);

    } else {
        // 从文本区域读取
        const idArray = idTextarea.value.trim().split('\n');
        validateAndGuessIDs(idArray);
    }
}

function validateAndGuessIDs(idArray) {
    const resultList = document.getElementById('resultList');

    idArray.forEach(id => {
        id = id.trim(); // 去除首尾空格
        if (id) { // 确保不是空行
            const listItem = document.createElement('li');
            if (!isIDFormatValid(id)) {
                listItem.textContent = `身份证号码 ${id} 格式不正确。`;
            } else if (isIDValid(id)) {
                listItem.textContent = `身份证号码 ${id} 有效。`;
            } else {
                const guessedIDs = guessID(id);
                if (guessedIDs.length > 0) {
                    listItem.textContent = `身份证号码 ${id} 的可能有效号码: ${guessedIDs.join(', ')}`;
                } else {
                    listItem.textContent = `身份证号码 ${id} 未找到有效的身份证号码。`;
                }
            }
            resultList.appendChild(listItem);
        }
    });
}

// 检查身份证号码格式（18位，最后一位可能是X，可以包含星号）
function isIDFormatValid(id) {
    const regex = /^[0-9*]{17}[0-9Xx*]$/;
    return regex.test(id);
}

// 验证身份证号码（包括校验码）
function isIDValid(id) {
    if (!isIDFormatValid(id)) return false;
    return checkIDChecksum(id);
}

// 计算并验证校验码
function checkIDChecksum(id) {
    const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const remainders = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;

    for (let i = 0; i < 17; i++) {
        sum += parseInt(id[i]) * factors[i];
    }

    const remainder = sum % 11;
    return id[17].toUpperCase() === remainders[remainder];
}

// 猜测身份证号码
function guessID(id) {
    let possibleIDs = [''];
    for (let i = 0; i < id.length; i++) {
        let newPossibleIDs = [];
        if (id[i] === '*') {
            for (let j = 0; j < possibleIDs.length; j++) {
                for (let digit = 0; digit <= 9; digit++) {
                    newPossibleIDs.push(possibleIDs[j] + digit.toString());
                }
            }
        } else {
            for (let j = 0; j < possibleIDs.length; j++) {
                newPossibleIDs.push(possibleIDs[j] + id[i]);
            }
        }
        possibleIDs = newPossibleIDs;
    }

    return possibleIDs.filter(isIDValid);
}

// 下载结果功能
function downloadResults() {
    const resultList = document.getElementById('resultList');
    let text = '';
    for (let i = 0; i < resultList.children.length; i++) {
        text += resultList.children[i].textContent + '\n';
    }

    const blob = new Blob([text], {
        type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'guessedIDs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
