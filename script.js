document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const downloadBtn = document.getElementById('downloadBtn');
    const outputEl = document.getElementById('output');
    let latestCSV = '';

    fileInput.addEventListener('change', event => {
        const file = event.target.files[0];
        if (file) processFile(file);
    });

    dropZone.addEventListener('dragover', event => {
        event.preventDefault();
        dropZone.style.backgroundColor = '#eef';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', event => {
        event.preventDefault();
        dropZone.style.backgroundColor = '';
        const file = event.dataTransfer.files[0];
        if (file) processFile(file);
    });

    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([latestCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'average_results.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    function processFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            processCSV(text);
        };
        reader.readAsText(file);
    }

    function processCSV(csvText) {
        const lines = csvText.trim().split('\n').map(line => line.split(','));
        const [headerRow, paramRow, ...dataRows] = lines;

        const result = [["Учень"]];
        const paramMap = {};

        // Build index to parameter name mapping
        for (let i = 1; i < paramRow.length; i++) {
            const param = paramRow[i].trim();
            if (!paramMap[param]) {
                paramMap[param] = [];
                result[0].push(param);
            }
            paramMap[param].push(i);
        }

        // For each student, compute averages
        for (const row of dataRows) {
            const student = row[0];
            const outputRow = [student];

            for (const param of result[0].slice(1)) {
                const indices = paramMap[param];
                const values = indices
                    .map(i => row[i]?.trim())
                    .filter(val => val && !isNaN(val))
                    .map(Number);
                const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '';
                outputRow.push(avg);
            }

            result.push(outputRow);
        }

        // Display output as CSV
        latestCSV = result.map(r => r.join(',')).join('\n');
        outputEl.textContent = latestCSV;
        downloadBtn.disabled = false;
    }
});
