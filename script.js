/* ===== DOM Elements ===== */
const form = document.getElementById('form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const transactionsList = document.getElementById('transactions');

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');

/* ===== Data Storage ===== */
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

/* ===== Chart Variables ===== */
let pieChart, barChart;

/* ===== Add Transaction ===== */
function addTransaction(e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = +amountInput.value;

  if (!text || amount === 0) {
    alert("Please enter valid description & amount");
    return;
  }

  const transaction = {
    id: Date.now(),
    text,
    amount,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  saveAndRender();
  form.reset();
}

/* ===== Delete Transaction ===== */
function deleteTransaction(id) {
  const item = document.getElementById(`tx-${id}`);
  if (item) {
    item.classList.add("fade-out");
    setTimeout(() => {
      transactions = transactions.filter(t => t.id !== id);
      saveAndRender();
    }, 300);
  }
}

/* ===== Save & Refresh UI ===== */
function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
  updateCharts();
}

/* ===== Render Transactions ===== */
function renderTransactions() {
  transactionsList.innerHTML = "";

  transactions.forEach(t => {
    const li = document.createElement("li");
    li.id = `tx-${t.id}`;
    li.classList.add(t.amount > 0 ? "income" : "expense");

    li.innerHTML = `
      <span>${t.text}</span>
      <span>${t.amount > 0 ? "+" : "-"} ₹${Math.abs(t.amount)}</span>
      <button class="del-btn" onclick="deleteTransaction(${t.id})">✖</button>
    `;

    transactionsList.appendChild(li);
  });
}

/* ===== Update Balance, Income, Expense ===== */
function updateSummary() {
  const amounts = transactions.map(t => t.amount);

  const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);
  const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0).toFixed(2);
  const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0).toFixed(2);

  balanceEl.textContent = `₹${total}`;
  incomeEl.textContent = `₹${income}`;
  expenseEl.textContent = `₹${Math.abs(expense)}`;
}

/* ===== Charts ===== */
function updateCharts() {
  const categories = {};
  const months = {};

  transactions.forEach(t => {
    const category = t.text.toLowerCase();
    categories[category] = (categories[category] || 0) + Math.abs(t.amount);

    const month = new Date(t.date)
      .toLocaleString('default', { month: 'short' })
      .toUpperCase();
      
    months[month] = (months[month] || 0) + Math.abs(t.amount);
  });

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  const pieCanvas = document.getElementById("pieChart");
  const barCanvas = document.getElementById("barChart");

  if (transactions.length === 0) {
    const ctx1 = pieCanvas.getContext("2d");
    const ctx2 = barCanvas.getContext("2d");
    ctx1.font = "16px Arial";
    ctx2.font = "16px Arial";
    ctx1.fillText("No data yet", 50, 50);
    ctx2.fillText("No data yet", 50, 50);
    return;
  }

  pieChart = new Chart(pieCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });

  barChart = new Chart(barCanvas, {
    type: "bar",
    data: {
      labels: Object.keys(months),
      datasets: [{
        data: Object.values(months)
      }]
    }
  });
}

/* ===== Init ===== */
form.addEventListener("submit", addTransaction);
saveAndRender();
