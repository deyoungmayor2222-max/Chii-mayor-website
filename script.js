let total = 0;
let cart = [];

function welcomeMessage() {
    alert("Welcome to Chii-Mayor Business Ventures!");
}

/* SEARCH */
function searchProduct() {
    const input = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const nameEl = card.querySelector("h3");
        const text = (nameEl ? nameEl.textContent : card.textContent).toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
}

/* ADD TO CART */
function addToCart(product, price, qty = 1) {
    const itemTotal = price * qty;

    cart.push({ product, qty, itemTotal });
    total += itemTotal;

    renderCart();
    saveCart();

    alert(product + " added to cart");
}

/* RENDER CART */
function renderCart() {
    const cartItems = document.getElementById("cart-items");
    if (!cartItems) return;

    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.product} x${item.qty} - ₦${item.itemTotal.toLocaleString()}
            <button onclick="removeItem(${index})">Remove</button>
        `;
        cartItems.appendChild(li);
    });

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.textContent = total.toLocaleString();

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty 🛒</p>";
    }

    updateCartCount();
}

/* REMOVE ITEM */
function removeItem(index) {
    if (index < 0 || index >= cart.length) return;

    total -= cart[index].itemTotal;
    cart.splice(index, 1);

    renderCart();
    saveCart();

    alert("Item removed");
}

/* ADD WITH QTY */
function addWithQty(product, price, qtyId) {
    const qtyInput = document.getElementById(qtyId);
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    addToCart(product, price, qty);
}

/* SAVE CART */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* LOAD CART */
function loadCart() {
    const saved = localStorage.getItem("cart");
    cart = saved ? JSON.parse(saved) : [];

    total = cart.reduce((sum, item) => sum + item.itemTotal, 0);

    renderCart();
}

/* CLEAR CART */
function clearCart() {
    cart = [];
    total = 0;

    localStorage.removeItem("cart");

    renderCart();

    alert("Cart cleared");
}

/* CHECKOUT (WHATSAPP ORDER) */
function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    const nameEl = document.getElementById("customer-name");
    const addressEl = document.getElementById("customer-address");
    const phoneEl = document.getElementById("customer-phone");
    const emailEl = document.getElementById("customer-email");

    const name = nameEl ? nameEl.value.trim() : "";
    const address = addressEl ? addressEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";

    if (!name || !address || !phone || !email) {
    alert("Please fill your name, address, phone and email");
    return;
}

    let message = `Hello! Chii-Mayor Business Ventures,%0A%0A`;
    message += `Customer Name: ${name}%0A`;
    message += `Phone: ${phone}%0A`;
    message += `Address: ${address}%0A%0A`;
    if (email) message += `Email: ${email}%0A%0A`;
    message += `Order:%0A`;

    cart.forEach(item => {
        message += `- ${item.product} x${item.qty} = ₦${item.itemTotal.toLocaleString()}%0A`;
    });

    message += `%0ATotal: ₦${total.toLocaleString()}`;

    window.open(`https://wa.me/2349030134298?text=${encodeURIComponent(message)}`, "_blank");
}

/* SIMPLE WHATSAPP ORDER */
function sendWhatsappOrder() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    let order = cart.map(item => `• ${item.product} x${item.qty}`).join("\n");

    let message =
`Hello Chii-Mayor Business Ventures,\n\nI would like to place the following order:\n\n${order}\n\nTotal Amount: ₦${total.toLocaleString()}\n\nThank you.`;

    window.open(`https://wa.me/2349030134298?text=${encodeURIComponent(message)}`, "_blank");
}

/* SCROLL TO TOP BUTTON */
function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = count;
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    welcomeMessage();
    loadCart();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const orderDateEl = document.getElementById("order-date");
    if (orderDateEl) orderDateEl.innerText = new Date().toLocaleDateString();

    const menuToggle = document.querySelector(".menu-toggle");
const navbar = document.querySelector(".navbar");

if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
        navbar.classList.toggle("active");
        });
    }
});