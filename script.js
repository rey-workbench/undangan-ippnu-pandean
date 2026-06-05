document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nama-input');
  const nomorInput = document.getElementById('nomor-input');
  const previewNama = document.getElementById('preview-nama');
  const previewNomor = document.getElementById('preview-nomor');
  const btnUpdate = document.getElementById('btn-update');
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');

  const defaultName = "Takmir Masjid Al-Kahfi";
  const defaultNomor = "001";

  function getRomanMonth(monthIndex) {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanMonths[monthIndex];
  }

  function updateDocument() {
    // 1. Update Name
    const nameValue = nameInput.value.trim();
    const newName = nameValue ? nameValue : defaultName;
    previewNama.textContent = newName;
    previewNama.classList.add('highlight');
    
    // 2. Update Nomor
    const nomorValue = nomorInput.value.trim() || defaultNomor;
    const date = new Date();
    const romanMonth = getRomanMonth(date.getMonth());
    const year = date.getFullYear();
    
    const generatedNomor = `${nomorValue}/Pan-IIPB/IPNU-IPPNU/${romanMonth}/${year}`;
    previewNomor.textContent = generatedNomor;

    // Highlight cleanup
    setTimeout(() => {
      previewNama.classList.remove('highlight');
    }, 800);
  }

  btnUpdate.addEventListener('click', updateDocument);

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') updateDocument();
  });
  
  nomorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') updateDocument();
  });

  btnPrint.addEventListener('click', () => {
    window.print();
  });

  btnReset.addEventListener('click', () => {
    nameInput.value = '';
    nomorInput.value = '';
    previewNama.textContent = defaultName;
    
    // Reset nomor to default current date
    const date = new Date();
    const romanMonth = getRomanMonth(date.getMonth());
    const year = date.getFullYear();
    previewNomor.textContent = `${defaultNomor}/Pan-IIPB/IPNU-IPPNU/${romanMonth}/${year}`;
    
    nomorInput.focus();
  });

  // Set initial default date on page load
  updateDocument();
});
