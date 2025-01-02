// get the html element  by id
document.addEventListener('DOMContentLoaded', function() { 
    const capturingKit = document.getElementById('capturingKit');
    const mainSampleSearch = document.getElementById('mainSampleSearch');
    const mainSampleList = document.getElementById('mainSampleList');
    const comparisonSamplesSearch = document.getElementById('comparisonSamplesSearch');
    const comparisonSamplesList = document.getElementById('comparisonSamplesList');
    const geneSearch = document.getElementById('geneSearch');
    const geneList = document.getElementById('geneList');
    const generateBtn = document.getElementById('generateBtn');
    const heatMapBtn = document.getElementById('heatMapBtn');
    const barPlotBtn = document.getElementById('barPlotBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const logStatus = document.getElementById('logStatus');
    const graphDisplay = document.getElementById('graphDisplay');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const usernameInput = document.getElementById('username');

  // create empty array for all selecteable section 
    let genes = [];
    let mainSamples = [];
    let comparisonSamples = [];
    let selectedGene = null;
    let selectedMainSample = null;
    let selectedComparisonSamples = new Set();
// ##############################  checking the all  selected  ######################


    function checkFormValidity() {
        const isValid = capturingKit.value && 
                        selectedMainSample && 
                        selectedComparisonSamples.size > 0 && 
                        selectedGene;

        generateBtn.disabled = !isValid;
        generateBtn.style.backgroundColor = isValid ? '#2196F3' : '#ccc';

        document.getElementById('capturingKitSection').classList.toggle('error', !capturingKit.value);
        document.getElementById('mainSampleSection').classList.toggle('error', !selectedMainSample);
        document.getElementById('comparisonSamplesSection').classList.toggle('error', selectedComparisonSamples.size === 0);
        document.querySelector('.gene-list-section').classList.toggle('error', !selectedGene);
    }
// ############################## capturing kit    ##################################

    capturingKit.addEventListener('change', function() {
        const capturingKitSection = document.getElementById('capturingKitSection');
        if (this.value) {
            capturingKitSection.classList.add('selected');
            logStatus.textContent = `Selected Capturing KIT: ${this.value}`;
            loadFiles(this.value);
        } else {
            capturingKitSection.classList.remove('selected');
            logStatus.textContent = 'Capturing KIT unselected';
        }
        checkFormValidity();
    });

// ############################## search and find the files baseed on the selected capturing kit ##################################

  
    function loadFiles(kit) {
        fetch(`files/bedgene_list/${kit}.txt`)
            .then(response => response.text())
            .then(text => {
                genes = text.split('\n').filter(gene => gene.trim());
                renderGeneList();
            });

        fetch(`files/main_sample/${kit}.txt`)
            .then(response => response.text())
            .then(text => {
                mainSamples = text.split('\n').filter(sample => sample.trim());
                renderMainSampleList();
            });

        fetch(`files/main_sample/${kit}.txt`)
            .then(response => response.text())
            .then(text => {
                comparisonSamples = text.split('\n').filter(sample => sample.trim());
                renderComparisonSampleList();
            });
    }

    // ############################## main sample ##################################


    function renderMainSampleList(filter = '') {
        mainSampleList.innerHTML = '';
        mainSamples.filter(sample => sample.toLowerCase().includes(filter.toLowerCase()))
            .forEach(sample => {
                const sampleElement = document.createElement('div');
                sampleElement.classList.add('sample-item');
                sampleElement.innerHTML = `<span>${sample}</span>`;
                if (selectedMainSample === sample) {
                    sampleElement.classList.add('selected');
                }
                sampleElement.addEventListener('click', () => selectMainSample(sample, sampleElement));
                mainSampleList.appendChild(sampleElement);
            });
    }

    function selectMainSample(sample, element) {
        if (selectedMainSample === sample) {
            selectedMainSample = null;
            element.classList.remove('selected');
        } else {
            selectedMainSample = sample;
            document.querySelectorAll('#mainSampleList .sample-item').forEach(item => item.classList.remove('selected'));
            element.classList.add('selected');
        }
        checkFormValidity();
        logStatus.textContent = selectedMainSample ? `Selected Main Sample: ${sample}` : 'Main Sample unselected';
        document.getElementById('mainSampleSection').classList.toggle('selected', selectedMainSample !== null);
    }

    mainSampleSearch.addEventListener('input', function(e) {
        renderMainSampleList(e.target.value);
    });

    // ############################## comaprison sample ##################################

    function renderComparisonSampleList(filter = '') {
        comparisonSamplesList.innerHTML = '';
        comparisonSamples.filter(sample => sample.toLowerCase().includes(filter.toLowerCase()))
            .forEach(sample => {
                const sampleElement = document.createElement('div');
                sampleElement.classList.add('sample-item');
                sampleElement.innerHTML = `<span>${sample}</span>`;
                if (selectedComparisonSamples.has(sample)) {
                    sampleElement.classList.add('selected');
                }
                sampleElement.addEventListener('click', () => toggleComparisonSample(sample, sampleElement));
                comparisonSamplesList.appendChild(sampleElement);
            });
    }

    function toggleComparisonSample(sample, element) {
        if (selectedComparisonSamples.has(sample)) {
            selectedComparisonSamples.delete(sample);
            element.classList.remove('selected');
        } else {
            selectedComparisonSamples.add(sample);
            element.classList.add('selected');
        }
        checkFormValidity();
        logStatus.textContent = selectedComparisonSamples.size > 0 ? `Selected Comparison Samples: ${Array.from(selectedComparisonSamples).join(', ')}` : 'Comparison Samples unselected';
        document.getElementById('comparisonSamplesSection').classList.toggle('selected', selectedComparisonSamples.size > 0);
    }

    comparisonSamplesSearch.addEventListener('input', function(e) {
        renderComparisonSampleList(e.target.value);
    });

// ############################## gene list ##################################

    function renderGeneList(filter = '') {
        geneList.innerHTML = '';
        genes.filter(gene => gene.toLowerCase().includes(filter.toLowerCase()))
             .forEach(gene => {
                 const geneElement = document.createElement('div');
                 geneElement.classList.add('gene-item');
                 geneElement.innerHTML = `<span>${gene}</span>`;
                 if (selectedGene === gene) {
                     geneElement.classList.add('selected');
                 }
                 geneElement.addEventListener('click', () => selectGene(gene, geneElement));
                 geneList.appendChild(geneElement);
             });
    }

    function selectGene(gene, element) {
        if (selectedGene === gene) {
            selectedGene = null;
            element.classList.remove('selected');
        } else {
            selectedGene = gene;
            document.querySelectorAll('.gene-item').forEach(item => item.classList.remove('selected'));
            element.classList.add('selected');
        }
        checkFormValidity();
        logStatus.textContent = selectedGene ? `Selected Gene: ${gene}` : 'Gene unselected';
        document.querySelector('.gene-list-section').classList.toggle('selected', selectedGene !== null);
    }

    geneSearch.addEventListener('input', (e) => renderGeneList(e.target.value));


    // ############################## plot buttons ##################################


    function togglePlotButton(button) {
        [heatMapBtn, barPlotBtn].forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        checkFormValidity();
        logStatus.textContent = `${button.textContent} selected`;
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    heatMapBtn.addEventListener('click', function() {
        togglePlotButton(heatMapBtn);
    });

    barPlotBtn.addEventListener('click', function() {
        togglePlotButton(barPlotBtn);
    });

 // ############################## generate button ##################################


    generateBtn.addEventListener('click', function() {
        if (!generateBtn.disabled) {
            document.getElementById('modalCapturingKit').textContent = capturingKit.value;
            document.getElementById('modalMainSample').textContent = selectedMainSample;
            document.getElementById('modalComparisonSamples').textContent = Array.from(selectedComparisonSamples).join(', ');
            document.getElementById('modalGene').textContent = selectedGene;
            document.getElementById('modalPlotType').textContent = heatMapBtn.classList.contains('selected') ? 'Heat Map' : 'Bar Plot';

            usernameInput.value = '';

            confirmationModal.style.display = 'flex';
        }
    });
    // ##############################confirm  modal ##################################

    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
// ############################## cancel all the slection if click the cancel button  ##################################

    cancelBtn.addEventListener('click', function() {
        capturingKit.value = '';
        selectedMainSample = null;
        selectedComparisonSamples.clear();
        selectedGene = null;
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        checkFormValidity();
        confirmationModal.style.display = 'none';
    });
// ############################## confirm button ##################################

    confirmBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username === '') {
            alert('Please enter a username.');
            return;
        }
        confirmationModal.style.display = 'none';
        generateGraph(username);
    });

    function generateGraph(username) {
        logStatus.innerHTML = 'Generating graph...';

        // ############################## graph display animation  ##################################

        
        graphDisplay.innerHTML = `
        <div class="loader">
          <div>
    <ul>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 90 120">
          <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
        </svg>
      </li>
    </ul>
        </div><span>...Loading...</span>`;
         // ############################## from the php  select  csv headers ##################################

    const formData = new FormData();
    formData.append('capturingKit', capturingKit.value);
    formData.append('mainSample', selectedMainSample);
    formData.append('comparisonSamples', Array.from(selectedComparisonSamples).join(','));
    formData.append('gene', selectedGene);
    formData.append('outputName', capturingKit.value);
    formData.append('plotType', heatMapBtn.classList.contains('selected') ? 'heatmap' : 'barplot');
    formData.append('username', username);

    fetch('generate.php', {
    method: 'POST',
    body: formData
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Data received:', data); // Log the received data for debugging

    if (data.success) {
        setTimeout(() => {
            let image = new Image();
            image.src = data.imagePath;

            image.style.maxWidth = '98%';
            image.style.height = '600px';
            image.style.width = '100%';
            image.style.border = '5px';

            graphDisplay.innerHTML = '';
            graphDisplay.appendChild(image);

            logStatus.innerHTML += '<br>Graph generated successfully! Now you can click on Screenshot button.';
            downloadBtn.disabled = false;
            downloadBtn.dataset.username = username;

            const resultsContainer = document.getElementById('results');

            if (data.csvData && data.csvData.length) {
                const headers = Object.keys(data.csvData[0]);
                const rows = data.csvData.map(row => 
                    `<tr>
                        <td>${row[headers[0]] || 'N/A'}</td>
                        <td>${row[headers[1]] || 'N/A'}</td>
                        <td>${row[headers[2]] || 'N/A'}</td>
                    </tr>`
                ).join('');

                resultsContainer.innerHTML = `
                    <table class="results-table">
                        <tr>
                            <th>${headers[0] || 'Gene'}</th>
                            <th>${headers[1] || 'Median_fold_change'}</th>
                            <th>${headers[2] || 'Amplification_Status'}</th>
                        </tr>
                        ${rows}
                    </table>
                `;
            } else {
                logStatus.innerHTML += '<br>Error: CSV data format is incorrect';
            }
        }, 1000);
    } else {
        logStatus.innerHTML += '<br>Error: ' + (data.message || 'Unknown error occurred');
    }
})
.catch(error => {
    console.error('Error:', error);
    logStatus.innerHTML += '<br>Error: ' + error.message;
});



}


    // ############################## download button  ##################################


    downloadBtn.addEventListener('click', function() {
        if (!downloadBtn.disabled) {
            html2canvas(graphDisplay).then(canvas => {
                const link = document.createElement('a');
                const username = this.dataset.username;
                
                const filename = `${selectedMainSample}_${username}_${selectedGene}.png`;
                link.download = filename;
                link.href = canvas.toDataURL();
                link.click();
                logStatus.textContent = `Screenshot downloaded as ${filename}`;
            });
        }
    });

    const faqButton = document.getElementById('faqButton');
    
    faqButton.addEventListener('click', function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Query</h2>
                <p>For any questions, please contact </p>
                <p>prabir@4basecare</p>
                <p></p>
                <p>bioinfo@4basecare</p>
                <button id="closeFaqModal">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    
        const closeButton = document.getElementById('closeFaqModal');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    });
});

