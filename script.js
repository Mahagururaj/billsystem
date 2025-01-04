// Set current date in format DD/MM/YYYY
const formatDate = (date) => {
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
document.getElementById("current-date").textContent = formatDate(new Date());

// Function to add a new row
function addRow() {
  const tableBody = document.getElementById("invoice-rows");
  const rowNumber = tableBody.children.length + 1; // Dynamic row numbering
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${rowNumber}</td>
    <td><input type="date" required></td>
    <td>
      <select required>
        <option value="" disabled selected>Select Item</option>
        <option value="Khasta">Khasta</option>
        <option value="Khasta(130)">Khasta(130)</option>
        <option value="Khasta(140)">Khasta(140)</option>
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
    <td><input type="number" min="0.01" step="0.01" value="0" oninput="updateTotals()" required></td>
    <td class="row-total">0</td>
  `;
  tableBody.appendChild(row);
}

// Function to calculate totals
function updateTotals() {
  const rows = document.querySelectorAll("#invoice-rows tr");
  let totalAmount = 0;

  rows.forEach((row, index) => {
    row.children[0].textContent = index + 1; // Update S.No dynamically
    const quantity = parseInt(row.children[3].querySelector("input").value) || 0;
    const price = parseFloat(row.children[4].querySelector("input").value) || 0;
    const total = Math.round(quantity * price); // Rounds to nearest integer
    row.children[5].textContent = total; // No `.00`
    totalAmount += total;
  });

  document.getElementById("total-amount").textContent = totalAmount; // No `.00`
}

// Function to generate PDF with S.No column
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get Shop Name
  const shopName = document.getElementById("shop-name-input").value || "Your Shop Name";

  // Add Shop Name and Date
  doc.setFontSize(18);
  doc.text(shopName, 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(new Date())}`, 180, 20, { align: "right" });

  // Extract table data with S.No
  const rows = [];
  const tableData = document.querySelectorAll("#invoice-rows tr");
  tableData.forEach((row, index) => {
    const serialNumber = index + 1;
    const date = row.children[1].querySelector("input").value || "";
    const item = row.children[2].querySelector("select").value || "";
    const quantity = row.children[3].querySelector("input").value || "0";
    const type = row.children[3].querySelector("select").value || "";
    const total = row.children[5].textContent || "0";

    rows.push([serialNumber, date, item, `${quantity} (${type})`, total]);
  });

  // Generate table with autoTable plugin
  doc.autoTable({
    startY: 30,
    head: [["S.No", "Date", "Item Description", "Quantity", "Total"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 15 }, // S.No column width
      1: { cellWidth: 30 }, // Date column width
      2: { cellWidth: 60 }, // Item Description column width
      3: { cellWidth: 40 }, // Quantity column width
      4: { cellWidth: 30 }, // Total column width
    },
  });

  // Add Total Amount
  const totalAmount = document.getElementById("total-amount").textContent || "0";
  const totalY = doc.lastAutoTable.finalY + 10;

  doc.setFillColor(255, 0, 0); // Red background for total
  doc.rect(20, totalY - 7, 170, 10, "F"); // Total background rectangle

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); // White text for total
  doc.text(`Total: ${totalAmount}`, 105, totalY, { align: "center" });

  // Save the PDF
  doc.save(`${shopName}.pdf`);
}

// Add an initial row on page load
addRow();
