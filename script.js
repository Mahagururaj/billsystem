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
    <td><input type="number" min="0.01" step="0.01" value="0.00" oninput="updateTotals()" required></td>
    <td class="row-total">0</td>
  `;
  tableBody.appendChild(row);
}

// Function to calculate totals
function updateTotals() {
  const rows = document.querySelectorAll("#invoice-rows tr");
  let totalAmount = 0;

  rows.forEach((row) => {
    const quantity = parseInt(row.children[3].querySelector("input").value) || 0;
    const price = parseFloat(row.children[4].querySelector("input").value) || 0;
    const total = quantity * price;
    row.children[5].textContent = total.toFixed(2);
    totalAmount += total;
  });

  document.getElementById("total-amount").textContent = totalAmount.toFixed(2);
}

// Function to generate PDF using jsPDF
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

  // Extract table data
  const rows = [];
  const tableData = document.querySelectorAll("#invoice-rows tr");
  tableData.forEach((row) => {
    const date = row.children[1].querySelector("input").value || "";
    const item = row.children[2].querySelector("select").value || "";
    const quantity = row.children[3].querySelector("input").value || "0";
    const type = row.children[3].querySelector("select").value || "";
    const price = parseFloat(row.children[4].querySelector("input").value) || "0";
    const total = row.children[5].textContent || "0";

    rows.push([date, item, `${quantity} (${type})`, price, total]);
  });

  // Generate table with autoTable plugin
  doc.autoTable({
    startY: 30,
    head: [["Date", "Item Description", "Quantity", "Price", "Total"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 10 },
  });

  // Add Total Amount
  const totalAmount = document.getElementById("total-amount").textContent || "0";
  const totalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`Total: ${totalAmount}`, 105, totalY, { align: "center" });

  // Save the PDF
  doc.save(`${shopName}.pdf`);
}

// Add an initial row on page load
addRow();
