const PAYSTACK_PUBLIC_KEY =
"pk_test_18b535b8d2c082dc3622d01d238a84c35ac33b39";

emailjs.init({
    publicKey: "gkBAw-YjuJAN4AQDA"
});

let total = 0;
let cart = [];

const DELIVERY_FEE = 3000; // Delivery fee in Naira

function showLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.style.display = "flex";
    }
}

function hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

function welcomeMessage() {
    alert("Welcome to Chii-Mayor Business Ventures!");
}

/* SEARCH */
function searchProduct() {

  let input = document.getElementById("search").value.toLowerCase();

  let cards = document.querySelectorAll(".card");

  cards.forEach(card => {

    let text = card.innerText.toLowerCase();

    if(text.includes(input)){
      card.style.display = "";
    } else {
      card.style.display = "none";
    }

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

    const selected =
document.querySelector('input[name="delivery"]:checked');

let fee = 0;

if(selected && selected.value==="Home Delivery"){
    fee = DELIVERY_FEE;
}

const subtotal =
document.getElementById("subtotal");

const delivery =
document.getElementById("delivery-fee");

const grand =
document.getElementById("grand-total");

if(subtotal)
subtotal.textContent=total.toLocaleString();

if(delivery)
delivery.textContent=fee.toLocaleString();

if(grand)
grand.textContent=(total+fee).toLocaleString();

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

/* GENERATE ORDER NUMBER */
function generateOrderNumber() {

    const date = new Date();

    return "ORD-" +
        date.getFullYear() +
        (date.getMonth()+1).toString().padStart(2,"0") +
        date.getDate().toString().padStart(2,"0") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);
}


/* GENERATE PAYSTACK REFERENCE */
function generatePaymentReference() {

    return "CM-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 100000);

}

/* VERIFY PAYMENT */
async function verifyPayment(reference) {

    const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reference })
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    return data;
}


/* START PAYSTACK PAYMENT */
async function startPaystackPayment(customer) {

     console.log("Customer object:", customer);
    console.log("onSuccess:", customer.onSuccess);
    console.log("typeof onSuccess:", typeof customer.onSuccess);

console.log({
    key: PAYSTACK_PUBLIC_KEY,
    email: customer.email,
    amount: customer.amount * 100,
    currency: "NGN",
    ref: customer.reference
});
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: customer.email,
        amount: customer.amount * 100,
        currency: "NGN",
        ref: customer.reference,

        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: customer.name
                },
                {
                    display_name: "Phone",
                    variable_name: "phone",
                    value: customer.phone
                }
            ]
        },

       callback: function(response) {
    customer.onSuccess(response.reference);
},

        onClose: function() {
             hideLoading();
            alert("Payment cancelled.");
        }

    });

    handler.openIframe();

}

async function sendAdminEmail(orderData) {
    const response = await emailjs.send(
        "service_sk791eo",
        "template_wgz5cha",
        orderData
    );

    console.log("Admin email sent successfully.");
    return response;
}

async function sendCustomerEmail(orderData) {
    const response = await emailjs.send(
        "service_sk791eo",
        "template_eq9y4cx",
        orderData
    );

    console.log("Customer email sent successfully.");
    return response;
}

/* CHECKOUT */
 async function checkout() {

     alert("Checkout started");

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("customer-name").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const email = document.getElementById("customer-email").value.trim();

    const deliveryMethod = document.querySelector(
        'input[name="delivery"]:checked'
    ).value;

    if (!name || !phone || !email) {
        alert("Please complete all required fields.");
        return;
    }

    if (deliveryMethod === "Home Delivery" && address === "") {
        alert("Please enter your delivery address.");
        return;
    }

    let deliveryFee = 0;

    if (deliveryMethod === "Home Delivery") {
        deliveryFee = DELIVERY_FEE;
    }

    const grandTotal = total + deliveryFee;

    const orderNumber = generateOrderNumber();
const paymentReference = generatePaymentReference();

const orderDate = new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "full",
    timeStyle: "medium"
});

   await startPaystackPayment({

        name,
        phone,
        email,
        amount: grandTotal,
        reference: paymentReference,

        onSuccess: async function (reference) {

    showLoading();

    try {

        const verification = await verifyPayment(reference);

        console.log("Verification Response:", verification);

        if (
            !verification.status ||
            !verification.data ||
            verification.data.status !== "success"
        ) {

            console.error("Verification failed:", verification);

            alert(
                "Payment verification failed.\n\n" +
                JSON.stringify(verification, null, 2)
            );

            return;
        }

        // Keep ALL your existing success code here

    const orderItems = cart.map(item => 
        `${item.product} x${item.qty} = ₦${item.itemTotal.toLocaleString()}`
    ).join("\n");


     let message = `CHII-MAYOR BUSINESS VENTURES
================================

ORDER CONFIRMATION

`;

     message += `--------------------------------\n`;
message += `Order Number: ${orderNumber}\n`;
message += `Order Date: ${orderDate}\n`;
message += "--------------------------------\n";
message += `\u{1F464} CUSTOMER INFORMATION\n`;
message += `Customer Name: ${name}\n`;
message += `Phone: ${phone}\n`;
message += `Email: ${email}\n`;

if (deliveryMethod === "Home Delivery") {
    message += `Address: ${address}\n`;
}
message += "\n--------------------------------\n";
message += `\u{1F4E6} ITEMS ORDERED\n`;

cart.forEach(item => {
    message += `• ${item.product} x${item.qty} = ₦${item.itemTotal.toLocaleString()}\n`;
});
message += "\n--------------------------------\n";
message += `\u{1F4B0} PAYMENT SUMMARY\n`;
message += `Delivery Method: ${deliveryMethod}\n`;

if (deliveryMethod === "Home Delivery") {
    message += `Delivery Fee: ₦${deliveryFee.toLocaleString()}\n`;
}

message += `Grand Total: ₦${grandTotal.toLocaleString()}\n`;
message += `Payment Status: \u2705 PAID\n`;
message += `Payment Reference: ${reference}\n`;

message += `\n--------------------------------\n`;
message += `Thank you for shopping with Chii-Mayor Business Ventures! 🍷\n\n`;
message += `Need help?\n`;
message += `Reply to this WhatsApp message or call 09030400538.\n`;
message += `We look forward to serving you again!`;

window.open(
    `https://wa.me/2349030400538?text=${encodeURIComponent(message)}`,
    "_blank"
);

document.getElementById("payment-status").innerHTML = `
<div style="
background:#d4edda;
color:#155724;
padding:15px;
border-radius:8px;
margin-bottom:20px;
font-weight:bold;
">
✅ Payment Successful!
</div>
`;

console.log("Raw message:");
console.log(message);

console.log("Encoded message:");
console.log(encodeURIComponent(message));

const orderData = {
    orderNumber,
    orderDate,
    customerName: name,
    phone,
    email,
    address,
    deliveryMethod,
    deliveryFee:
        deliveryMethod === "Home Delivery"
            ? deliveryFee.toLocaleString()
            : "FREE (Pickup from Shop)",
    total: grandTotal.toLocaleString(),
    paymentReference: reference,
    paymentStatus: "PAID - Successful",
    orderItems
};

try {

    // Send notification to the business owner
    await sendAdminEmail(orderData);

    // Send confirmation to the customer
    await sendCustomerEmail(orderData);

    console.log("✅ Both emails sent successfully.");

} catch (err) {

    console.error("EmailJS Status:", err.status);
    console.error("EmailJS Message:", err.text);
    console.error(err);

    alert("Payment was successful, but one or more confirmation emails could not be sent.");

}

// Reset form and cart whether email succeeds or fails
document.getElementById("customer-form").reset();
clearCart();

} catch (error) {

    console.error(error);

    alert(
        "An unexpected error occurred while processing your payment."
    );

} finally {

    hideLoading();

}

} // End of onSuccess

}); // End of startPaystackPayment

} // End of checkout

/* SIMPLE WHATSAPP ORDER */
function sendWhatsappOrder() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    let order = cart.map(item => `• ${item.product} x${item.qty}`).join("\n");

    let message =
`Hello Chii-Mayor Business Ventures,\n\nI would like to place the following order:\n\n${order}\n\nTotal Amount: ₦${total.toLocaleString()}\n\nThank you.`;

    window.open(`https://wa.me/2349030400538?text=${encodeURIComponent(message)}`, "_blank");
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

    // Delivery method
    document.querySelectorAll('input[name="delivery"]').forEach(option => {

    option.addEventListener("change", () => {

        const pickup = document.getElementById("pickup-info");
        const addressGroup = document.getElementById("address-group");
        const bank = document.getElementById("bank-details");

        if (!pickup || !addressGroup || !bank) return;

        if (option.value === "Pickup from Shop" && option.checked) {

            pickup.style.display = "block";
            addressGroup.style.display = "none";
            bank.style.display = "none";

        } else if (option.checked) {

            pickup.style.display = "none";
            addressGroup.style.display = "block";
            bank.style.display = "block";

        }

        renderCart();

    });

});
});