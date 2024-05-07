
function exportToExcel() {
    try {
        const dataStr = document.getElementById('data-input').value;
        const data = JSON.parse(dataStr);
        const wb = XLSX.utils.book_new();
        const headers = Object.keys(data[0]);
        const dataArr = data.map(obj => Object.values(obj));
        dataArr.unshift(headers);
        const ws = XLSX.utils.aoa_to_sheet(dataArr);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'output.xlsx');
    } catch (err) {
        alert('输入数据格式不正确，请检查并修改后重试。');
    }
}

function clearInput() {
    document.getElementById('data-input').value = '';
    document.getElementById('csv-output').value = '';
}


let csvData = ''; //用来存储转换后的csv字符串
function convertToCSV() {
    try {
        const dataStr = document.getElementById('data-input').value;
        const data = JSON.parse(dataStr);
        const headers = Object.keys(data[0]);

        csvData = headers.join(',') + '\r\n';
        data.map(obj => {
            csvData += Object.values(obj).join(',') + '\r\n';
        })

        document.getElementById('csv-output').value = csvData;
    } catch (err) {
        alert('输入数据格式不正确，请检查并修改后重试。');
    }
    document.getElementById('csv-output').style.visibility = 'visible';
}

function downloadCSV() {
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    //清空csvData，便于下次重新开始
    csvData = '';
}

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
