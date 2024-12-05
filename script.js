    // Set current date in format DD/MM/YYYY
    const formatDate = (date) => {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    document.getElementById('current-date').textContent = formatDate(new Date());

    // Function to add a new row
    function addRow() {
      const tableBody = document.getElementById('invoice-rows');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="date" required></td>
        <td>
          <select required>
            <option value="Khasta">Khasta</option>
            <option value="Chikki">Chikki</option>
            <option value="Jamun">Jamun</option>
          </select>
        </td>
        <td>
          <input type="number" min="1" value="1" oninput="updateTotals()" required>
          <select required>
            <option value="J">J</option>
            <option value="P">P</option>
          </select>
        </td>
        <td><input type="number" min="0.01" step="0.01" value="0.00" oninput="updateTotals()" required></td>
        <td class="row-total">0.00</td>
      `;
      tableBody.appendChild(row);
    }

    // Function to calculate totals
    function updateTotals() {
      const rows = document.querySelectorAll('#invoice-rows tr');
      let totalAmount = 0;

      rows.forEach((row) => {
        const quantity = parseInt(row.children[2].querySelector('input').value) || 0;
        const price = parseFloat(row.children[3].querySelector('input').value) || 0;
        const total = quantity * price;
        row.children[4].textContent = total.toFixed(2); // Removed ₹ symbol
        totalAmount += total;
      });

      document.getElementById('total-amount').textContent = totalAmount.toFixed(2); // Removed ₹ symbol
    }

// Function to generate PDF using jsPDF
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get Shop Name
  const shopName = document.getElementById('shop-name-input').value || 'Your Shop Name';

  // Add Shop Name (Centered)
  doc.setFontSize(18); // Set font size for shop name
  const shopNameWidth = doc.getTextWidth(shopName); // Calculate text width
  const centerX = (210 - shopNameWidth) / 2; // Calculate center position
  doc.setTextColor(0, 102, 204); // Set text color to blue
  doc.text(shopName, centerX, 30); // Position shop name in the center

  // Add Date (Right Aligned)
  doc.setFontSize(14); // Set font size for date
  const dateText = 'Date: ' + formatDate(new Date());
  const dateWidth = doc.getTextWidth(dateText); // Calculate text width for date
  const rightX = 210 - dateWidth - 10; // Position near the right edge (10mm margin)
  doc.setTextColor(255, 69, 0); // Set text color to orange
  doc.text(dateText, rightX, 30); // Position date on the right

  // Define table columns and rows
  const rows = [];
  const tableData = document.querySelectorAll('#invoice-rows tr');

  tableData.forEach(row => {
    const date = row.children[0].querySelector('input').value || '';
    const item = row.children[1].querySelector('select').value || '';
    const quantity = row.children[2].querySelector('input').value || '0';
    const type = row.children[2].querySelector('select').value || '';
    const total = row.children[4].textContent || '0.00';

    rows.push([date, item, `${quantity} (${type})`, total]);
  });

  // Table headers and styling using autoTable plugin
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Item Description', 'Quantity', 'Total']],
    body: rows,
    theme: 'striped', // Add striped rows for better visual appeal
    columnStyles: {
      0: { cellWidth: 40 }, // Date column width
      1: { cellWidth: 60 }, // Item Description column width
      2: { cellWidth: 40 }, // Quantity column width
      3: { cellWidth: 40 }, // Total column width
    },
    headStyles: {
      fillColor: [0, 102, 204], // Blue background for header
      textColor: [255, 255, 255], // White text for header
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [0, 0, 0], // Black text for body
    },
  });

  // Total amount section (Full colored background)
  const totalAmount = document.getElementById('total-amount').textContent || '0.00';
  const totalY = doc.lastAutoTable.finalY + 10; // Position for total, below the table
  doc.setFillColor(0, 128, 0); // Set background color to green
  doc.rect(20, totalY, 140, 10, 'F'); // Full-width colored background for total section

  doc.setFontSize(18); // Set larger font size for total
  doc.setTextColor(255, 255, 255); // Set text color to white
  doc.text('Total: ' + totalAmount, 100, totalY + 6); // Position total amount with white text

  // Save the PDF with shop name as filename
  doc.save(shopName + '.pdf');
}



    // Add an initial row on page load
    addRow();
