let income = 0;
let expenses = [];
let chart;
let currentStep = 0;

// Wizard Navigation
function showStep(index) {
  const steps = document.querySelectorAll(".step");
  const tabs = document.querySelectorAll(".step-tabs button");
  steps.forEach((s, i) => {
    s.classList.remove("active");
    tabs[i].classList.remove("active");
    if (i === index) {
      s.classList.add("active");
      tabs[i].classList.add("active");
    }
  });

  // Update progress bar
  const progress = ((index) / (steps.length - 1)) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}
function nextStep() {
  currentStep = Math.min(currentStep + 1, document.querySelectorAll(".step").length - 1);
  showStep(currentStep);
}
function prevStep() {
  currentStep = Math.max(currentStep - 1, 0);
  showStep(currentStep);
}

// Generate Tabs
function createTabs() {
  const tabContainer = document.getElementById("step-tabs");
  const steps = document.querySelectorAll(".step");
  steps.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.onclick = () => { currentStep = i; showStep(currentStep); };
    tabContainer.appendChild(btn);
  });
}

// Income
function setIncome() {
  income = parseFloat(document.getElementById("income-input").value) || 0;
  localStorage.setItem("income", income);
  updateSavings();
}

// Add Expense
function addExpense() {
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (name && amount) {
    expenses.push({ name, amount });
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateExpenseList(); updateSavings(); updateChart();
    document.getElementById("expense-name").value = "";
    document.getElementById("expense-amount").value = "";
  }
}
function updateExpenseList() {
  document.getElementById("expense-list").innerHTML =
    expenses.map(e => `<tr><td>${e.name}</td><td>₹${e.amount}</td></tr>`).join("");
}
function updateSavings() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = income - total;
  document.getElementById("savings-display").textContent =
    `Income: ₹${income} | Expenses: ₹${total} | Savings: ₹${savings}`;
  updateInsights(savings);
}
function updateInsights(savings) {
  let message = "";
  if (savings < 0) message = "⚠️ Overspending!";
  else if (savings < income * 0.2) message = "💡 Savings are low.";
  else message = "✅ You’re saving well!";
  document.getElementById("insights").textContent = message;
}
function updateChart() {
  const ctx = document.getElementById("expense-chart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: expenses.map(e => e.name),
      datasets: [{ data: expenses.map(e => e.amount),
        backgroundColor: ["#6c5ce7","#fd79a8","#00cec9","#ffeaa7","#fab1a0"] }]
    }
  });
}

// Export / Reset
function exportData() {
  const data = { income, expenses, savings: income - expenses.reduce((s,e)=>s+e.amount,0) };
  const blob = new Blob([JSON.stringify(data,null,2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "budget-data.json"; a.click();
}
function resetData() {
  income=0; expenses=[]; localStorage.clear();
  document.getElementById("income-input").value=""; updateExpenseList();
  updateSavings(); if(chart) chart.destroy();
}

// Theme Toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "dark":"light";
  localStorage.setItem("theme",mode);
  document.getElementById("theme-toggle").textContent = mode==="dark"?"☀️":"🌙";
});

// On Load
window.onload = () => {
  income = parseFloat(localStorage.getItem("income")) || 0;
  expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  updateExpenseList(); updateSavings(); if(expenses.length) updateChart();
  const theme = localStorage.getItem("theme");
  if(theme==="dark"){ document.body.classList.add("dark"); document.getElementById("theme-toggle").textContent="☀️"; }
  createTabs();
  showStep(currentStep);
};


// Scroll Reveal Animation
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const revealTop = reveals[i].getBoundingClientRect().top;
    const revealPoint = 100; // trigger point

    if (revealTop < windowHeight - revealPoint) {
      reveals[i].classList.add("show");
    }
  }
}
window.addEventListener("scroll", revealOnScroll);
