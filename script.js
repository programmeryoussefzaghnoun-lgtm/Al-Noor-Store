// ===== بيانات المنتجات =====
const products = [
  { id: 1, name: "ساعة كاسيو ذهبية", price: 1650, img: "image1.jpg" },
  { id: 2, name: "ساعة SKMEI رياضية", price: 1750, img: "image2.jpg" },
  { id: 3, name: "ساعة كلاسيكية فاخرة", price: 1600, img: "image3.jpg" },
  { id: 4, name: "ساعة رجالية أنيقة", price: 1800, img: "image4.jpg" },
  { id: 5, name: "ساعة رياضية مقاومة", price: 1900, img: "image5.jpg" },
  { id: 6, name: "ساعة جلدية كلاسيك", price: 1550, img: "image6.jpg" }
];

// ======================================
// رقم واتساب المتجر
// ======================================
const whatsappNumber = "+905514969472";

// ===== العناصر =====
const list = document.getElementById("products-list");
const cartCount = document.getElementById("cartCount");
const cartButton = document.querySelector(".cart-btn");

// ===== ثوابت التخزين =====
const LS_CART = "tw_cart_v1";

// ===== السلة (تُحمّل من localStorage) =====
let cart = loadJSON(LS_CART, {});

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveCart() {
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch {}
}

// ===== تنسيق الأسعار =====
function formatPrice(n) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " ₺";
}

// ===== توست بسيط =====
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
// رسم المنتجات (ذكي: رئيسية أو صفحة المنتجات)
// ======================================
const isAllProductsPage = document.getElementById("all-products-list") !== null;
const listContainer = isAllProductsPage ? document.getElementById("all-products-list") : list;

function createProductCard(p) {
  return `
  <article class="card" data-id="${p.id}">
    <div class="thumb">
      <img src="${p.img}" alt="${p.name}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/400x400?text=THE+WATCH'">
    </div>
    <h3>${p.name}</h3>
    <div class="price">${formatPrice(p.price)}</div>
    <button class="add-cart" data-id="${p.id}">
      أضف للسلة
      <i class="fa-solid fa-cart-shopping"></i>
    </button>
  </article>
  `;
}

if (isAllProductsPage) {
  listContainer.classList.remove("products");
  listContainer.innerHTML = products.map(createProductCard).join("");
} else {
  const initialProducts = products.slice(0, 4);
  listContainer.innerHTML = initialProducts.map(createProductCard).join("");

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "btn-show-more-wrapper";
  btnWrapper.innerHTML = `
    <a href="products.html" class="btn-show-more">
      عرض المزيد <i class="fa-solid fa-arrow-left"></i>
    </a>
  `;
  document.querySelector("#products .products-wrap").after(btnWrapper);
}

// ===== تحديث عداد السلة =====
function updateCartCount() {
  const totalQuantity = Object.values(cart).reduce((sum, q) => sum + q, 0);
  cartCount.textContent = totalQuantity;
}
updateCartCount();

// ===== إضافة للسلة (من الكروت) =====
listContainer.addEventListener("click", e => {
  const add = e.target.closest(".add-cart");
  if (add) {
    const productId = Number(add.dataset.id);
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart();
    updateCartCount();

    add.innerHTML = `تمت الإضافة <i class="fa-solid fa-check"></i>`;
    setTimeout(() => {
      add.innerHTML = `أضف للسلة <i class="fa-solid fa-cart-shopping"></i>`;
    }, 1200);
  }
});

// ======================================
// نافذة معاينة المنتج (Product Preview)
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
    const productId = Number(btn.dataset.id);
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

// فتح المعاينة عند الضغط على المنتج
listContainer.addEventListener("click", e => {
  if (e.target.closest(".add-cart")) return;

  const card = e.target.closest(".card");
  if (!card) return;

  const productId = Number(card.dataset.id);
  const product = products.find(p => p.id === productId);
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

// ======================================
// نافذة السلة (تُبنى ديناميكياً)
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
      const id = Number(plus.dataset.inc);
      cart[id] = (cart[id] || 0) + 1;
      saveCart(); updateCartCount(); renderCartModal();
    } else if (minus) {
      const id = Number(minus.dataset.dec);
      cart[id] = Math.max(0, (cart[id] || 0) - 1);
      if (cart[id] === 0) delete cart[id];
      saveCart(); updateCartCount(); renderCartModal();
    } else if (remove) {
      const id = Number(remove.dataset.remove);
      delete cart[id];
      saveCart(); updateCartCount(); renderCartModal();
    }
  });
}

function renderCartModal() {
  ensureCartModal();
  const body = document.getElementById("cartBody");
  const totalEl = document.getElementById("cartTotal");

  const ids = Object.keys(cart).map(Number).filter(id => cart[id] > 0);
  if (ids.length === 0) {
    body.innerHTML = `<div class="cart-empty">السلة فارغة حالياً</div>`;
    totalEl.textContent = "الإجمالي: 0.00 ₺";
    return;
  }

  let total = 0;
  body.innerHTML = ids.map(id => {
    const p = products.find(x => x.id === id);
    if (!p) return "";
    const q = cart[id];
    const subtotal = p.price * q;
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

// فتح النافذة عند الضغط على أيقونة السلة
if (cartButton) {
  cartButton.addEventListener("click", function (e) {
    e.preventDefault();
    ensureCartModal();
    renderCartModal();
    document.getElementById("cartModal").classList.add("open");
  });
}

// ===== تجهيز طلب واتساب =====
function checkoutWhatsApp() {
  if (Object.keys(cart).length === 0) {
    showToast("السلة فارغة! أضف المنتجات أولاً.");
    return;
  }

  let message = "السلام عليكم، أريد طلب المنتجات التالية من متجر النور:\n\n";
  let total = 0;

  products.forEach(product => {
    const quantity = cart[product.id] || 0;
    if (quantity > 0) {
      const subtotal = product.price * quantity;
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

  const whatsappURL =
    "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
  window.open(whatsappURL, "_blank");
}

// ======================================
// تمرير المنتجات (يعمل فقط في الصفحة الرئيسية)
// ======================================
const prodNext = document.getElementById("prodNext");
const prodPrev = document.getElementById("prodPrev");

if (prodNext && prodPrev && !isAllProductsPage) {
  const step = () => {
    const card = list.querySelector(".card");
    return card ? card.offsetWidth + 18 : 300;
  };
  prodNext.onclick = () =>
    list.scrollBy({ left: -step(), behavior: "smooth" });
  prodPrev.onclick = () =>
    list.scrollBy({ left: step(), behavior: "smooth" });
}

// ======================================
// السلايدر + السحب باللمس
// ======================================
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

// دعم السحب باللمس
(function swipeHero() {
  if (!heroEl) return;
  let startX = 0, startY = 0, tracking = false;

  heroEl.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; tracking = true;
  }, { passive: true });

  heroEl.addEventListener("touchend", e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) show(current + 1); else show(current - 1);
      reset();
    }
  });
})();

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

// ======================================
// البحث الحي
// ======================================
(function searchFeature() {
  const form = document.querySelector(".search");
  const input = form?.querySelector("input");
  if (!form || !input) return;

  const box = document.createElement("div");
  box.className = "search-results";
  form.appendChild(box);

  function renderResults(q) {
    q = q.trim().toLowerCase();
    if (!q) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const matches = products.filter(p => p.name.toLowerCase().includes(q));
    if (matches.length === 0) {
      box.innerHTML = `<div class="search-item"><span class="si-name">لا توجد نتائج</span></div>`;
    } else {
      box.innerHTML = matches.slice(0, 6).map(p => `
        <div class="search-item" data-id="${p.id}">
          <img src="${p.img}" alt="" onerror="this.onerror=null;this.src='https://via.placeholder.com/80?text=TW'">
          <span class="si-name">${p.name}</span>
          <span class="si-price">${formatPrice(p.price)}</span>
        </div>
      `).join("");
    }
    box.classList.add("open");
  }

  input.addEventListener("input", () => renderResults(input.value));
  input.addEventListener("focus", () => { if (input.value) renderResults(input.value); });

  box.addEventListener("click", e => {
    const item = e.target.closest(".search-item");
    if (!item) return;
    const id = item.dataset.id;
    if (!id) return;
    
    if (isAllProductsPage) {
      const card = listContainer.querySelector(`.card[data-id="${id}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } else {
      window.location.href = "products.html";
    }
    
    box.classList.remove("open");
    input.value = "";
  });

  document.addEventListener("click", e => {
    if (!form.contains(e.target)) box.classList.remove("open");
  });

  form.addEventListener("submit", e => e.preventDefault());
})();

// ===== النشرة البريدية =====
const newsForm = document.getElementById("newsForm");
if (newsForm) {
  newsForm.addEventListener("submit", e => {
    e.preventDefault();
    showToast("شكراً لاشتراكك في نشرتنا البريدية!");
    e.target.reset();
  });
}