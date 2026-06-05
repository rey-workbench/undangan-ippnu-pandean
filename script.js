document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('documents-container');
  const template = document.getElementById('document-template');
  const btnPrint = document.getElementById('btn-print');
  const totalDokumenSpan = document.getElementById('total-dokumen');

  function getRomanMonth(monthIndex) {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanMonths[monthIndex];
  }

  try {
    // Fetch data from data.txt
    const response = await fetch('data.txt');
    if (!response.ok) throw new Error('Gagal memuat data.txt');
    const text = await response.text();

    // Parse lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    totalDokumenSpan.textContent = lines.length;

    const date = new Date();
    const romanMonth = getRomanMonth(date.getMonth());
    const year = date.getFullYear();

    // Render each document
    lines.forEach(line => {
      // Format: Nomor, Nama, Perihal
      const parts = line.split(',');
      if (parts.length >= 2) {
        const nomorValue = parts[0].trim();
        const namaValue = parts[1].trim();
        // Optional perihal, default to UNDANGAN
        let perihalValue = "UNDANGAN";
        if (parts.length >= 3 && parts[2].trim()) {
           perihalValue = parts[2].trim().toUpperCase();
        }

        // Clone template
        const clone = template.content.cloneNode(true);
        
        // Fill data
        const generatedNomor = `${nomorValue}/Pan-IIPB/IPNU-IPPNU/${romanMonth}/${year}`;
        
        clone.querySelector('.preview-nomor').textContent = generatedNomor;
        clone.querySelector('.preview-nama').textContent = namaValue;
        clone.querySelector('.preview-perihal').textContent = perihalValue;
        
        container.appendChild(clone);
      }
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p style="text-align: center; color: #f87171;">Gagal memuat data. Pastikan file data.txt tersedia.</p>`;
  }

  btnPrint.addEventListener('click', () => {
    window.print();
  });
});
