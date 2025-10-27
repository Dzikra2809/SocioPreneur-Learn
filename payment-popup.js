document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah user udah pernah bayar
  const paid = localStorage.getItem("paidBusinessCourse");
  if (paid === "true") return; // kalau udah bayar, gak usah popup lagi

  // munculin popup utama
  showAccessPopup();
});

function showAccessPopup() {
  const popup = document.createElement("div");
  popup.classList.add("payment-popup");
  popup.innerHTML = `
    <div class="popup__content">
      <h2>Kursus Premium 🔒</h2>
      <p>Untuk melanjutkan materi penuh, silakan lakukan pembayaran terlebih dahulu.</p>
      <div class="popup__buttons">
        <button class="btn btn--primary" id="nextPopup">Next</button>
        <button class="btn btn--ghost" id="cancelPopup">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#cancelPopup").onclick = () => {
    popup.remove();
    window.location.href = "course.html"; // langsung balik
  };

  popup.querySelector("#nextPopup").onclick = () => {
    popup.remove();
    showPaymentMethodPopup(); // lanjut ke popup metode pembayaran
  };
}

function showPaymentMethodPopup() {
  const popup = document.createElement("div");
  popup.classList.add("payment-popup");
  popup.innerHTML = `
    <div class="popup__content">
      <h2>Pilih Metode Pembayaran 💳</h2>
      <select id="paymentSelect" class="form__select" style="width:100%; margin: 1rem 0;">
        <option value="">-- Pilih Metode --</option>
        <option value="gopay">GoPay</option>
        <option value="dana">DANA</option>
        <option value="transfer">Transfer Bank</option>
      </select>
      <div class="popup__buttons">
        <button class="btn btn--primary" id="payNow">Bayar</button>
        <button class="btn btn--ghost" id="cancelPayment">Batal</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#cancelPayment").onclick = () => {
    popup.remove();
    window.location.href = "course.html";
  };

  popup.querySelector("#payNow").onclick = () => {
    const method = popup.querySelector("#paymentSelect").value;
    if (!method) {
      alert("Pilih metode pembayaran dulu, bestie 😭");
      return;
    }

    alert(`Pembayaran berhasil lewat ${method.toUpperCase()} 🎉`);
    localStorage.setItem("paidBusinessCourse", "true");
    popup.remove();
  };
}

// styling
const style = document.createElement("style");
style.textContent = `
.payment-popup {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.popup__content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 350px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  animation: fadeIn 0.3s ease;
}
.popup__buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(style);
