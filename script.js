import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== إعدادات Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyD5vYclVK8iQQOn-CZ39T9EZeWKWNUDYP0",
  authDomain: "al-noor-store-8e504.firebaseapp.com",
  projectId: "al-noor-store-8e504",
  storageBucket: "al-noor-store-8e504.firebasestorage.app",
  messagingSenderId: "5732404882",
  appId: "1:5732404882:web:9687c6ef9e07ad50eaa04b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== المتغيرات العامة =====
let products = [];
let whatsappNumber = "905514969472"; // رقم افتراضي
let cart = {}; // سيتم تحميله من localStorage

// ===== العناصر =====
const list = document.getElementById("products-list");
const cartCount = document.getElementById("cartCount");
const cartButton = document.querySelector(".cart-btn");

// ===== ثوابت التخزين =====
const LS_CART = "tw_cart_v1";

// ===== دوال مساعدة =====
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveCart() {
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch {}
}

function formatPrice(n) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " ₺";
}

function showToast(msg) {
  let t = document.querySelector(".tw-toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "tw-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ======================================
// رسم المنتجات
// ======================================
const isAllProductsPage = document.getElementById("all-products-list") !== null;
const listContainer = isAllProductsPage ? document.getElementById("all-products-list") : list;

function createProductCard(p) {
  const badgeHTML = p.badge ? `<div class="product-badge">${p.badge}</div>` : "";
  const priceVal = p.price ? Number(p.price) : 0;

  return `
  <article class="card" data-id="${p.id}">
    ${badgeHTML}
    <div class="thumb">
      <img src="${p.img}" alt="${p.name}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/400x400?text=THE+WATCH'">
    </div>
    <h3>${p.name}</h3>
    <div class="price">${formatPrice(priceVal)}</div>
    
    <div class="card-actions">
      <button class="add-cart" data-id="${p.id}">
        أضف للسلة
        <i class="fa-solid fa-cart-shopping"></i>
      </button>
      
      <button class="btn-buy-now" data-id="${p.id}">
        شراء مباشر
        <i class="fa-brands fa-whatsapp"></i>
      </button>
    </div>
  </article>
  `;
}

function renderStoreProducts() {
  if (!listContainer) return;

  if (isAllProductsPage) {
    listContainer.classList.remove("products");
    listContainer.innerHTML = products.map(createProductCard).join("");
  } else {
    const initialProducts = products.slice(0, 4);
    listContainer.innerHTML = initialProducts.map(createProductCard).join("");

    // إضافة زر عرض المزيد إذا لم يكن موجوداً
    if (!document.querySelector(".btn-show-more-wrapper")) {
      const btnWrapper = document.createElement("div");
      btnWrapper.className = "btn-show-more-wrapper";
      btnWrapper.innerHTML = `
        <a href="products.html" class="btn-show-more">
          عرض المزيد <i class="fa-solid fa-arrow-left"></i>
        </a>
      `;
      const targetAfter = document.querySelector("#products .products-wrap");
      if (targetAfter) {
        targetAfter.after(btnWrapper);
      }
    }
  }
}

// ===== تحديث عداد السلة =====
function updateCartCount() {
  if(!cartCount) return;
  const totalQuantity = Object.values(cart).reduce((sum, q) => sum + q, 0);
  cartCount.textContent = totalQuantity;
}

// ===== إضافة للسلة والشراء المباشر =====
if (listContainer) {
  listContainer.addEventListener("click", e => {
    
    // 1. زر الإضافة للسلة
    const add = e.target.closest(".add-cart");
    if (add) {
      const productId = add.dataset.id;
      cart[productId] = (cart[productId] || 0) + 1;
      saveCart();
      updateCartCount();

      add.innerHTML = `تمت الإضافة <i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        add.innerHTML = `أضف للسلة <i class="fa-solid fa-cart-shopping"></i>`;
      }, 1200);
      return;
    }

    // 2. زر الشراء المباشر
    const buyNow = e.target.closest(".btn-buy-now");
    if (buyNow) {
      const productId = buyNow.dataset.id;
      const product = products.find(p => String(p.id) === String(productId));
      if (!product) return;

      let message = "السلام عليكم، أريد شراء هذا المنتج مباشرة من متجر النور:\n\n";
      message += "🕒 " + product.name + "\n";
      message += "السعر: " + formatPrice(product.price) + "\n\n";
      message += "أرجو تأكيد الطلب وتزويدي بتفاصيل التوصيل.";

      const whatsappURL = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
      window.open(whatsappURL, "_blank");
      return;
    }
  });
}

// ======================================
// نافذة معاينة المنتج
// ======================================
function ensureProductModal() {
  if (document.getElementById("productViewModal")) return;
  const modal = document.createElement("div");
  modal.id = "productViewModal";
  modal.className = "product-view-modal";
  modal.innerHTML = `
    <div class="product-view-box">
      <button class="product-view-close" id="pvClose"><i class="fa-solid fa-xmark"></i></button>
      <div class="product-view-content">
        <div class="product-view-img">
          <img id="pvImage" src="" alt="">
        </div>
        <div class="product-view-info">
          <h2 id="pvName"></h2>
          <div class="price" id="pvPrice"></div>
          <p>ساعة فاخرة مصممة بعناية لتناسب أناقتك. جودة عالية، تصميم عصري، وتغليف ممتاز يليق بك. ضمان حقيقي وتوصيل سريع لجميع المدن.</p>
          <button class="add-cart" id="pvAddCart">أضف للسلة <i class="fa-solid fa-cart-shopping"></i></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", e => {
    if (e.target === modal || e.target.closest("#pvClose")) {
      modal.classList.remove("open");
    }
  });

  modal.querySelector("#pvAddCart").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const productId = btn.dataset.id;
    if (!productId) return;

    cart[productId] = (cart[productId] || 0) + 1;
    saveCart();
    updateCartCount();

    btn.innerHTML = `تمت الإضافة <i class="fa-solid fa-check"></i>`;
    setTimeout(() => {
      btn.innerHTML = `أضف للسلة <i class="fa-solid fa-cart-shopping"></i>`;
      modal.classList.remove("open");
    }, 1000);
  });
}

// فتح المعاينة
if (listContainer) {
  listContainer.addEventListener("click", e => {
    if (e.target.closest(".add-cart") || e.target.closest(".btn-buy-now")) return;

    const card = e.target.closest(".card");
    if (!card) return;

    const productId = card.dataset.id;
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    ensureProductModal();
    const modal = document.getElementById("productViewModal");
    
    modal.querySelector("#pvImage").src = product.img;
    modal.querySelector("#pvName").textContent = product.name;
    modal.querySelector("#pvPrice").textContent = formatPrice(product.price);
    modal.querySelector("#pvAddCart").dataset.id = product.id;
    modal.querySelector("#pvAddCart").innerHTML = `أضف للسلة <i class="fa-solid fa-cart-shopping"></i>`;

    modal.classList.add("open");
  });
}

// ======================================
// نافذة السلة
// ======================================
function ensureCartModal() {
  if (document.getElementById("cartModal")) return;
  const modal = document.createElement("div");
  modal.id = "cartModal";
  modal.className = "cart-modal";
  modal.innerHTML = `
    <div class="cart-modal-box" role="dialog" aria-label="سلة التسوق">
      <div class="cart-modal-head">
        <h3><i class="fa-solid fa-cart-shopping"></i> سلة التسوق</h3>
        <button type="button" id="cartClose" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="cart-modal-body" id="cartBody"></div>
      <div class="cart-modal-foot">
        <div class="cart-total" id="cartTotal"></div>
        <button type="button" class="btn-gold" id="cartCheckout">
          إتمام الطلب <i class="fa-brands fa-whatsapp"></i>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });
  modal.querySelector("#cartClose").onclick = () => modal.classList.remove("open");
  modal.querySelector("#cartCheckout").onclick = checkoutWhatsApp;

  modal.querySelector("#cartBody").addEventListener("click", e => {
    const plus = e.target.closest("[data-inc]");
    const minus = e.target.closest("[data-dec]");
    const remove = e.target.closest("[data-remove]");

    if (plus) {
      const id = plus.dataset.inc;
      cart[id] = (cart[id] || 0) + 1;
      saveCart(); updateCartCount(); renderCartModal();
    } else if (minus) {
      const id = minus.dataset.dec;
      cart[id] = Math.max(0, (cart[id] || 0) - 1);
      if (cart[id] === 0) delete cart[id];
      saveCart(); updateCartCount(); renderCartModal();
    } else if (remove) {
      const id = remove.dataset.remove;
      delete cart[id];
      saveCart(); updateCartCount(); renderCartModal();
    }
  });
}

function renderCartModal() {
  ensureCartModal();
  const body = document.getElementById("cartBody");
  const totalEl = document.getElementById("cartTotal");

  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  if (ids.length === 0) {
    body.innerHTML = `<div class="cart-empty">السلة فارغة حالياً</div>`;
    totalEl.textContent = "الإجمالي: 0.00 ₺";
    return;
  }

  let total = 0;
  body.innerHTML = ids.map(id => {
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return "";
    const q = cart[id];
    const subtotal = Number(p.price) * q;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80?text=TW'">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <div class="ci-price">${formatPrice(p.price)}</div>
        </div>
        <div class="cart-qty">
          <button data-dec="${id}" aria-label="تقليل">−</button>
          <span>${q}</span>
          <button data-inc="${id}" aria-label="زيادة">+</button>
        </div>
        <button class="cart-remove" data-remove="${id}" aria-label="حذف">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join("");

  totalEl.textContent = "الإجمالي: " + formatPrice(total);
}

if (cartButton) {
  cartButton.addEventListener("click", function (e) {
    e.preventDefault();
    ensureCartModal();
    renderCartModal();
    document.getElementById("cartModal").classList.add("open");
  });
}

// ===== تجهيز طلب واتساب للسلة =====
function checkoutWhatsApp() {
  if (Object.keys(cart).length === 0) {
    showToast("السلة فارغة! أضف المنتجات أولاً.");
    return;
  }

  let message = "السلام عليكم، أريد طلب المنتجات التالية من متجر النور:\n\n";
  let total = 0;

  Object.keys(cart).forEach(id => {
    const quantity = cart[id] || 0;
    const product = products.find(p => String(p.id) === String(id));
    
    if (quantity > 0 && product) {
      const subtotal = Number(product.price) * quantity;
      total += subtotal;
      message +=
        "🕒 " + product.name + "\n" +
        "الكمية: " + quantity + "\n" +
        "السعر: " + formatPrice(product.price) + "\n" +
        "المجموع: " + formatPrice(subtotal) + "\n\n";
    }
  });

  message += "----------------------\n";
  message += "💰 إجمالي الطلب: " + formatPrice(total) + "\n\n";
  message += "أرجو تأكيد الطلب وتزويدي بتفاصيل التوصيل.";

  const whatsappURL = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
  window.open(whatsappURL, "_blank");
}

// ... أكواد السلايدر والبحث والنشرة البريدية ...
// (لقد احتفظت بها كما هي في مشروعك، سأضعها في النهاية لتكون كاملة)

// السلايدر
const slides = document.querySelectorAll(".slide");
const heroEl = document.getElementById("hero");
let current = 0;
let timer;

function show(i) {
  if (slides.length === 0) return;
  slides[current].classList.remove("active");
  current = (i + slides.length) % slides.length;
  slides[current].classList.add("active");
}
function auto() {
  if (slides.length > 0) {
    timer = setInterval(() => show(current + 1), 5000);
  }
}
function reset() {
  clearInterval(timer);
  auto();
}

const heroNext = document.getElementById("heroNext");
const heroPrev = document.getElementById("heroPrev");

if (heroNext && heroPrev) {
  heroNext.onclick = () => { show(current + 1); reset(); };
  heroPrev.onclick = () => { show(current - 1); reset(); };
}
auto();

// ===== قائمة الجوال =====
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
  menuToggle.onclick = () => nav.classList.toggle("open");
}
if (nav) {
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// ===== النشرة البريدية =====
const newsForm = document.getElementById("newsForm");
if (newsForm) {
  newsForm.addEventListener("submit", e => {
    e.preventDefault();
    showToast("شكراً لاشتراكك في نشرتنا البريدية!");
    e.target.reset();
  });
}

// ======================================
// التهيئة الأولية من Firebase
// ======================================
async function initApp() {
  try {
    // 1. جلب الإعدادات (رقم الواتساب)
    const settingsDoc = await getDoc(doc(db, "settings", "general"));
    if (settingsDoc.exists() && settingsDoc.data().whatsapp) {
      whatsappNumber = settingsDoc.data().whatsapp;
    }

    // 2. جلب المنتجات
    const querySnapshot = await getDocs(collection(db, "products"));
    products = [];
    querySnapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 3. تحميل السلة من الذاكرة
    cart = loadJSON(LS_CART, {});

    // 4. رسم المنتجات بعد جلبها
    renderStoreProducts();
    updateCartCount();

  } catch (error) {
    console.error("خطأ في جلب البيانات من Firebase: ", error);
    if (listContainer) {
      listContainer.innerHTML = '<p style="text-align:center; width:100%; color:red;">حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.</p>';
    }
  }
}

// تشغيل التطبيق
initApp();
