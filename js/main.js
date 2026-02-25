const defaultProducts = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    price: 29,
    image: "images/ccb9547b21d8dba7ef2587d76490d3f9.jpg",
    description: "Comfortable cotton, everyday essential",
    badge: "new"
  },
  {
    id: 2,
    name: "Blue Denim Jeans",
    price: 49,
    image: "images/5c823b9c5f6381eb4ca8bb8db2ad704f.jpg",
    description: "Modern fit, premium denim",
    badge: "sale"
  },
  {
    id: 3,
    name: "Grey Hoodie",
    price: 39,
    image: "images/7ab50d17b4173cbe17c8c89c970b0cd6.jpg",
    description: "Soft fleece, casual style"
  }
];
let storedProducts = JSON.parse(localStorage.getItem("aurora_products")) || [];

const mergedProducts = [
  ...defaultProducts,
  ...storedProducts.filter(
    sp => !defaultProducts.some(dp => dp.id === sp.id)
  )
];

localStorage.setItem("aurora_products", JSON.stringify(mergedProducts));

let products = mergedProducts;
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
/* ================= GLOBAL STATE ================= */

let cart = JSON.parse(localStorage.getItem("aurora_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("aurora_wishlist")) || [];

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updateWishlistCount();
    renderCart();
    renderWishlist();
    initCounters();
    initPreloader();
    initBackToTop();
    initContactForm();
    initCheckout();
    initModeToggle();
    initRTLToggle();
    loadProductDetails();
    renderProducts();
});

/* ================= PRELOADER ================= */

function initPreloader() {
    const loader = document.getElementById("preloader");
    if (!loader) return;
    window.addEventListener("load", () => {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 500);
    });
}

/* ================= COUNTERS ================= */

function initCounters() {
  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    const target = +counter.dataset.target;
    const type = counter.dataset.type;
    let count = 0;
    const speed = target / 100;

    const formatNumber = (num) => {
      if (type === "k") {
        return (num / 1000).toFixed(0) + "K+";
      }

      if (type === "plus") {
        return num + "+";
      }

      if (type === "percent") {
        return num + "%";
      }

      return num;
    };

    const update = () => {
      count += speed;

      if (count < target) {
        counter.innerText = formatNumber(Math.floor(count));
        requestAnimationFrame(update);
      } else {
        counter.innerText = formatNumber(target);
      }
    };

    update();
  });
}

/* ================= CART ================= */

function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("aurora_cart", JSON.stringify(cart));
    updateCartCount();
    showToast("Added to cart 🛒");
}

function updateCartCount() {
    const countEl = document.querySelector(".cart-count");
    if (countEl) countEl.innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <h4>${item.name}</h4>
            <span class="price">$${item.price}</span>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        container.appendChild(div);
    });

    if (totalEl) totalEl.innerText = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("aurora_cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        showToast("Cart is empty!");
        return;
    }
    window.location.href = "checkout.html";
}

/* ================= WISHLIST ================= */

function addToWishlist(name, price) {
    wishlist.push({ name, price });
    localStorage.setItem("aurora_wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    showToast("Added to wishlist ❤️");
}

function updateWishlistCount() {
    const countEl = document.querySelector(".wishlist-count");
    if (countEl) countEl.innerText = wishlist.length;
}

function renderWishlist() {
    const container = document.getElementById("wishlistItems");
    if (!container) return;

    container.innerHTML = "";

    if (wishlist.length === 0) {
        container.innerHTML = `<div class="empty-wishlist"><span>💔</span>Your wishlist is empty</div>`;
        return;
    }

    wishlist.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <h4>${item.name}</h4>
            <span class="price">$${item.price}</span>
            <button onclick="removeFromWishlist(${index})">Remove</button>
        `;
        container.appendChild(div);
    });
}

function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    localStorage.setItem("aurora_wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlist();
}

/* ================= CONTACT ================= */

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("contactMessage").innerText =
            "Message sent successfully ✔";
        form.reset();
    });
}

/* ================= CHECKOUT ================= */
/* ================= CHECKOUT ================= */
function initCheckout() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const address = document.getElementById("address").value.trim();

        if (!name || !email || !address) {
            showToast("Please fill all fields ✍️");
            return;
        }

        if (!cart.length) {
            showToast("Your cart is empty 🛒");
            return;
        }

        // هنا ممكن تحطي أي كود إرسال للباك-إند لو حابة مستقبلاً
        // حالياً بس نفرغ السلة ونظهر رسالة نجاح
        localStorage.removeItem("aurora_cart");
        cart = [];
        updateCartCount();

        showToast("Order placed successfully 🎉");

        // إعادة توجيه بعد 1.5 ثانية للصفحة الرئيسية
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    });
}

/* ================= BACK TO TOP ================= */

function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        btn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ================= DARK MODE ================= */

function initModeToggle() {
    const btn = document.getElementById("modeToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });
}

/* ================= RTL ================= */

function initRTLToggle() {
    const btn = document.getElementById("rtlToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
        document.body.classList.toggle("rtl");
    });
}

/* ================= TOAST ================= */

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);
}
/* ================= PRODUCT PAGE ================= */

let quantity = 1;
let selectedSize = "";
let selectedColor = "";

function changeImage(img) {
    document.getElementById("mainImage").src = img.src;
}

function selectOption(btn) {
    document.querySelectorAll(".sizes button")
        .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSize = btn.innerText;
}

function selectColor(el) {
    document.querySelectorAll(".color")
        .forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    selectedColor = el.className;
}

function changeQty(amount) {
    quantity += amount;
    if (quantity < 1) quantity = 1;
    document.getElementById("qty").innerText = quantity;
}

function addProductToCart() {
    const name = document.getElementById("productName").innerText;
    const price = 29;

    cart.push({
        name,
        price,
        quantity,
        size: selectedSize,
        color: selectedColor
    });

    localStorage.setItem("aurora_cart", JSON.stringify(cart));
    updateCartCount();
    showToast("Product added 🛒");
}

function addProductToWishlist() {
    const name = document.getElementById("productName").innerText;
    wishlist.push({ name });
    localStorage.setItem("aurora_wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    showToast("Added to wishlist ❤️");
}

function openTab(tabId) {
    document.querySelectorAll(".tab-content")
        .forEach(t => t.classList.remove("active"));

    document.querySelectorAll(".tab-buttons button")
        .forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}
function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const product = products.find(p => p.id == id);
  if (!product) return;

  document.getElementById("productName").innerText = product.name;
  document.querySelector(".price").innerText = "$" + product.price;
  document.querySelector(".desc").innerText = product.description;
  document.getElementById("mainImage").src = product.image;
}
function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {
    container.innerHTML += `
      <div class="product-card">

        ${product.badge ? 
          `<div class="badge ${product.badge}">
            ${product.badge === "new" ? "New" : "Sale"}
          </div>` 
        : ""}

        <a href="product.html?id=${product.id}">
          <div class="product-image"
            style="background-image:url('${product.image}')">
          </div>
        </a>

        <h4>
          <a href="product.html?id=${product.id}">
            ${product.name}
          </a>
        </h4>

        <p>${product.description}</p>

        <div class="product-bottom">
          <span class="price">$${product.price}</span>

          <button class="btn small"
            onclick="addToCart('${product.name}',${product.price})">
            Add to Cart
          </button>

          <button class="btn small wishlist-btn"
            onclick="addToWishlist('${product.name}',${product.price})">
            ❤️
          </button>
        </div>

      </div>
    `;
  });
}
function addNewProduct(product) {

  const exists = products.some(p => p.id === product.id);

  if (exists) return;

  products.push(product);
  localStorage.setItem("aurora_products", JSON.stringify(products));
  renderProducts();
}
// addNewProduct({
//   id: Date.now(),
//   name: "Grey Hoodie",
//   price: 59,
//   image: "images/grey-hoodie.png",
//   description: "Soft cotton hoodie",
//   badge: "new"
// });