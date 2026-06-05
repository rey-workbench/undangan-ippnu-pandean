document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('documents-container');
  const template = document.getElementById('document-template');
  const btnPrint = document.getElementById('btn-print');
  const btnPrintNative = document.getElementById('btn-print-native');
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

  btnPrint.addEventListener('click', async () => {
    const originalText = btnPrint.innerHTML;
    btnPrint.disabled = true;
    btnPrint.innerHTML = 'Sedang membuat PDF (0%)...';

    const pages = document.querySelectorAll('.document-page');
    if (pages.length === 0) {
      alert('Tidak ada dokumen untuk diexport.');
      btnPrint.disabled = false;
      btnPrint.innerHTML = originalText;
      return;
    }

    const opt = {
      margin: 0,
      filename: 'undangan-ipnu-ippnu-pandean.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.5, 
        useCORS: false,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'cm', format: [21.5, 33], orientation: 'portrait' }
    };

    try {
      // Get the jsPDF constructor from global namespace
      const jsPDFConstructor = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
      if (!jsPDFConstructor) {
        throw new Error('Library jsPDF tidak ditemukan. Pastikan CDN terpasang.');
      }

      const pdf = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: [215, 330] // F4 Folio Size (21.5cm x 33cm)
      });

      for (let i = 0; i < pages.length; i++) {
        btnPrint.innerHTML = `Memproses Halaman ${i + 1} dari ${pages.length} (${Math.round((i / pages.length) * 100)}%)...`;

        // Render direct element using html2canvas with scale 3 for HD crispness
        const canvas = await html2canvas(pages[i], {
          scale: 3, // 3x scale is very crisp and clear (HD)
          useCORS: false,
          allowTaint: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        // Draw image to fill the exact F4 page size
        pdf.addImage(imgData, 'JPEG', 0, 0, 215, 330);
      }

      pdf.save('undangan-ipnu-ippnu-pandean.pdf');
      
      btnPrint.disabled = false;
      btnPrint.innerHTML = originalText;
    } catch (err) {
      console.error(err);
      btnPrint.disabled = false;
      btnPrint.innerHTML = originalText;
      alert('Gagal membuat PDF: ' + err.message);
    }
  });

  btnPrintNative.addEventListener('click', () => {
    window.print();
  });
});
