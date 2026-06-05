document.addEventListener('DOMContentLoaded', async () => {
  const exportContainer = document.getElementById('export-container');
  const recipientList = document.getElementById('recipient-list');
  const singlePreviewContainer = document.getElementById('single-preview-container');
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

    // Render each document and create sidebar list
    lines.forEach((line, index) => {
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
        
        // Append all pages to exportContainer (always hidden, used for printing/generating PDF)
        exportContainer.appendChild(clone);

        // Create sidebar item
        const item = document.createElement('button');
        item.className = 'recipient-item';
        if (index === 0) item.classList.add('active');
        item.innerHTML = `
          <span class="recipient-num">${nomorValue}</span>
          <span class="recipient-name">${namaValue}</span>
        `;
        
        item.addEventListener('click', () => {
          // Deactivate previous active item
          const activeItem = recipientList.querySelector('.recipient-item.active');
          if (activeItem) activeItem.classList.remove('active');
          
          // Activate this item
          item.classList.add('active');
          
          // Update preview right pane by cloning the page from exportContainer
          const targetPage = exportContainer.children[index];
          singlePreviewContainer.innerHTML = '';
          singlePreviewContainer.appendChild(targetPage.cloneNode(true));

          // Close sidebar on mobile after selection
          const sidebarOverlay = document.getElementById('sidebar-overlay');
          if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
          }
        });

        recipientList.appendChild(item);
      }
    });

    // Load first preview page initially
    if (exportContainer.children.length > 0) {
      singlePreviewContainer.appendChild(exportContainer.children[0].cloneNode(true));
    }

  } catch (error) {
    console.error(error);
    if (recipientList) {
      recipientList.innerHTML = `<p style="color: #f87171; font-size: 0.85rem; padding: 10px;">Gagal memuat data.</p>`;
    }
  }

  btnPrint.addEventListener('click', async () => {
    const originalText = btnPrint.innerHTML;
    btnPrint.disabled = true;
    btnPrint.innerHTML = 'Sedang membuat PDF (0%)...';

    const pages = document.querySelectorAll('#export-container .document-page');
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

    exportContainer.classList.add('exporting');

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
    } catch (err) {
      console.error(err);
      alert('Gagal membuat PDF: ' + err.message);
    } finally {
      exportContainer.classList.remove('exporting');
      btnPrint.disabled = false;
      btnPrint.innerHTML = originalText;
    }
  });

  btnPrintNative.addEventListener('click', () => {
    window.print();
  });

  // Handle Developer Modal Close
  const devModal = document.getElementById('dev-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  if (devModal && btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      devModal.classList.add('hidden');
    });
  }

  // Handle Mobile Sidebar Toggle
  const btnShowList = document.getElementById('btn-show-list');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  if (btnShowList && btnCloseSidebar && sidebarOverlay) {
    btnShowList.addEventListener('click', () => {
      sidebarOverlay.classList.add('active');
    });
    
    btnCloseSidebar.addEventListener('click', () => {
      sidebarOverlay.classList.remove('active');
    });
    
    sidebarOverlay.addEventListener('click', (e) => {
      if (e.target === sidebarOverlay) {
        sidebarOverlay.classList.remove('active');
      }
    });
  }
});
