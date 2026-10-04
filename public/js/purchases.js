let products = [];
let suppliers = [];
let purchaseItems = [];


/* =========================
   عناصر صفحه
========================= */

const supplierSelect =
    document.getElementById('supplierSelect');

const productSelect =
    document.getElementById('productSelect');

const productSearch =
    document.getElementById('productSearch');

const productSearchResults =
    document.getElementById('productSearchResults');


/* برای قرارگیری درست نتایج جستجو */

const productSearchGroup =
    productSearch.closest('.form-group');

if (productSearchGroup) {

    productSearchGroup.style.position =
        'relative';

}

const productQuantity =
    document.getElementById('productQuantity');

const productPrice =
    document.getElementById('productPrice');


    /* =========================
   اطلاعات بچ دارو
========================= */

const productPriceGroup =
    productPrice.closest('.form-group');


const batchFormGroup =
    document.createElement('div');


batchFormGroup.className =
    'form-group';


batchFormGroup.innerHTML = `

    <label for="batchNumber">
        شماره بچ
    </label>

    <input
        type="text"
        id="batchNumber"
        placeholder="مثلاً B-1001"
    >


    <label
        for="batchExpiryDate"
        style="margin-top:10px;"
    >
        تاریخ انقضا
    </label>

    <input
        type="date"
        id="batchExpiryDate"
    >

`;


if (productPriceGroup) {

    productPriceGroup.insertAdjacentElement(
        'afterend',
        batchFormGroup
    );

}

const addProductBtn =
    document.getElementById('addProductBtn');

const purchaseItemsBody =
    document.getElementById('purchaseItemsBody');

const totalAmount =
    document.getElementById('totalAmount');

const paidAmount =
    document.getElementById('paidAmount');

const remainingAmount =
    document.getElementById('remainingAmount');

const savePurchaseBtn =
    document.getElementById('savePurchaseBtn');

const purchaseDescription =
    document.getElementById('purchaseDescription');


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    const number =
        Number(value || 0);

    const settings =
        window.systemSettings || {};


    const decimals =
        Math.max(
            0,
            Math.min(
                4,
                Number(
                    settings.decimal_places
                ) || 0
            )
        );


    if (
        settings.amount_format ===
        'plain'
    ) {

        return number.toFixed(
            decimals
        );

    }


    return number.toLocaleString(
        'en-US',
        {
            minimumFractionDigits:
                decimals,

            maximumFractionDigits:
                decimals
        }
    );

}


/* =========================
   دریافت دواها
========================= */

/* =========================
   دریافت دواها
========================= */

async function loadProducts() {

    try {

        const response =
            await fetch('/api/products');

        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.message ||
                'خطا در دریافت دواها'
            );

            return;

        }


        products =
            (result.data || []).filter(
                product =>
                    Number(product.status) === 1
            );


        productSelect.value = '';

        productSearch.value = '';

        productSearchResults.innerHTML = '';

        productSearchResults.style.display =
            'none';


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برای دریافت دواها برقرار نشد'
        );

    }

}


/* =========================
   دریافت شرکت ها
========================= */

async function loadSuppliers() {

    try {

        const response =
            await fetch('/api/suppliers');

        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.message ||
                'خطا در دریافت شرکت ها'
            );

            return;

        }


        suppliers =
            result.data || [];


        supplierSelect.innerHTML = `

            <option value="">
                شرکت متفرقه
            </option>

        `;


        suppliers.forEach(supplier => {

            const option =
                document.createElement('option');


            option.value =
                supplier.id;


            option.textContent =
                `${supplier.name}
                 ${supplier.phone
                    ? '- ' + supplier.phone
                    : ''}`;


            supplierSelect.appendChild(option);

        });


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برای دریافت شرکت ها برقرار نشد'
        );

    }

}


/* =========================
   جستجوی دوا
========================= */

function renderProductSearchResults(searchText) {

    const text =
        String(searchText || '')
            .trim()
            .toLowerCase();


    productSearchResults.innerHTML = '';


    if (!text) {

        productSearchResults.style.display =
            'none';

        return;

    }


    const matchedProducts =
        products.filter(product => {

            const code =
                String(product.code || '')
                    .toLowerCase();

            const name =
                String(product.name || '')
                    .toLowerCase();

            return (
                code.includes(text) ||
                name.includes(text)
            );

        });


    if (matchedProducts.length === 0) {

        productSearchResults.innerHTML = `

            <div class="product-search-item">

                <strong>
                    دوایی پیدا نشد
                </strong>

                <small>
                    نام یا کد دوا را بررسی کنید
                </small>

            </div>

        `;

        productSearchResults.style.display =
            'block';

        return;

    }


    matchedProducts.forEach(product => {

        const item =
            document.createElement('div');

        item.className =
            'product-search-item';


        item.innerHTML = `

            <strong>
                ${product.code} - ${product.name}
            </strong>

            <small>
                موجودی فعلی: ${product.stock}
                |
                قیمت خرید:
                ${formatMoney(product.purchase_price)}
            </small>

        `;


        item.addEventListener(
            'click',
            () => {

                selectProductForPurchase(
                    product
                );

            }
        );


        productSearchResults.appendChild(
            item
        );

    });


    productSearchResults.style.display =
        'block';

}


/* =========================
   انتخاب دوا
========================= */

function selectProductForPurchase(product) {

    if (!product) {

        return;

    }


    productSelect.value =
        product.id;


    productSearch.value =
        `${product.code} - ${product.name}`;


    productSearchResults.innerHTML = '';

    productSearchResults.style.display =
        'none';


    productPrice.value =
        Number(product.purchase_price);


    /*
     * بعد از انتخاب دوا، فوکوس روی تعداد
     */

    productQuantity.focus();

    productQuantity.select();

}


/* =========================
   جستجو هنگام تایپ
========================= */

productSearch.addEventListener(
    'input',
    () => {

        productSelect.value = '';

        productPrice.value = '';


        renderProductSearchResults(
            productSearch.value
        );

    }
);


/* =========================
   پشتیبانی از بارکد اسکنر
========================= */

productSearch.addEventListener(
    'keydown',
    event => {

        if (event.key !== 'Enter') {

            return;

        }


        event.preventDefault();


        const scannedCode =
            productSearch.value
                .trim()
                .toLowerCase();


        if (!scannedCode) {

            return;

        }


        /*
         * ابتدا کد دقیق دوا را بررسی می‌کنیم.
         */

        const exactProduct =
            products.find(product => {

                return String(product.code || '')
                    .trim()
                    .toLowerCase() ===
                    scannedCode;

            });


        if (exactProduct) {

            selectProductForPurchase(
                exactProduct
            );

            return;

        }


        /*
         * اگر کد دقیق نبود و فقط یک نتیجه
         * وجود داشت، همان را انتخاب می‌کنیم.
         */

        const matchedProducts =
            products.filter(product => {

                const code =
                    String(product.code || '')
                        .toLowerCase();

                const name =
                    String(product.name || '')
                        .toLowerCase();

                return (
                    code.includes(scannedCode) ||
                    name.includes(scannedCode)
                );

            });


        if (matchedProducts.length === 1) {

            selectProductForPurchase(
                matchedProducts[0]
            );

            return;

        }


        alert(
            'دوا با این کد پیدا نشد'
        );

    }
);


/* =========================
   بستن نتایج جستجو
========================= */

document.addEventListener(
    'click',
    event => {

        if (
            !productSearch.contains(event.target) &&
            !productSearchResults.contains(event.target)
        ) {

            productSearchResults.style.display =
                'none';

        }

    }
);


/* =========================
   بستن با Escape
========================= */

productSearch.addEventListener(
    'keydown',
    event => {

        if (event.key === 'Escape') {

            productSearchResults.style.display =
                'none';

        }

    }
);

/* =========================
   افزودن دوا
========================= */

addProductBtn.addEventListener(
    'click',
    () => {

        const productId =
            Number(productSelect.value);


        const quantity =
            Number(productQuantity.value);


        const price =
            Number(productPrice.value);

            const batchNumber =
    document.getElementById('batchNumber')
        .value
        .trim();

const expiryDate =
    document.getElementById('batchExpiryDate')
        .value;


        if (!productId) {

            alert('لطفاً دوا را انتخاب کنید');

            return;

        }

        if (!batchNumber) {

    alert(
        'شماره بچ را وارد کنید'
    );

    document
        .getElementById('batchNumber')
        .focus();

    return;

}


if (!expiryDate) {

    alert(
        'تاریخ انقضا را وارد کنید'
    );

    document
        .getElementById('batchExpiryDate')
        .focus();

    return;

}


        if (!quantity || quantity <= 0) {

            alert(
                'تعداد دوا باید بیشتر از صفر باشد'
            );

            return;

        }


        if (
            price < 0 ||
            Number.isNaN(price)
        ) {

            alert(
                'قیمت خرید نامعتبر است'
            );

            return;

        }


        const product =
            products.find(
                item =>
                    Number(item.id) === productId
            );


        if (!product) {

            alert('دوا پیدا نشد');

            return;

        }


        /* اگر دوا قبلاً اضافه شده */

        const existingItem =
            purchaseItems.find(
                item =>
                    Number(item.product_id) === productId
            );


        if (existingItem) {

            existingItem.quantity +=
                quantity;


            existingItem.purchase_price =
                price;


            existingItem.total_price =
                existingItem.quantity * price;

        }

        else {

         purchaseItems.push({

    product_id:
        product.id,

    product_name:
        product.name,

    code:
        product.code,

    unit:
        product.unit,

    batch_number:
        batchNumber,

    expiry_date:
        expiryDate,

    quantity:
        quantity,

    purchase_price:
        price,

    total_price:
        quantity * price

});

        }


        renderPurchaseItems();

productSelect.value = '';

productSearch.value = '';

productSearchResults.innerHTML = '';

productSearchResults.style.display =
    'none';

productQuantity.value = '1';

productPrice.value = '';

    }
);


/* =========================
   نمایش اقلام
========================= */

function renderPurchaseItems() {

    purchaseItemsBody.innerHTML = '';


    if (purchaseItems.length === 0) {

        purchaseItemsBody.innerHTML = `

            <tr>

                <td colspan="6">
                    هنوز دوایی به خرید اضافه نشده است
                </td>

            </tr>

        `;

        calculateTotals();

        return;

    }


    purchaseItems.forEach(
        (item, index) => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.code} -
                    ${item.product_name}
                </td>

                <td>
                    ${item.quantity}
                    ${item.unit || ''}
                </td>

                <td>
                    ${formatMoney(item.purchase_price)}
                </td>

                <td>
                    ${formatMoney(item.total_price)}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="removePurchaseItem(${index})"
                        class="cancel-btn"
                    >
                        حذف
                    </button>

                </td>

            `;


            purchaseItemsBody.appendChild(row);

        }
    );


    calculateTotals();

}


/* =========================
   حذف دوا
========================= */

function removePurchaseItem(index) {

    purchaseItems.splice(index, 1);

    renderPurchaseItems();

}


/* =========================
   محاسبه مبالغ
========================= */

function calculateTotals() {

    const total =
        purchaseItems.reduce(
            (sum, item) =>
                sum + Number(item.total_price),
            0
        );


    let paid =
        Number(paidAmount.value) || 0;


    if (paid < 0) {

        paid = 0;

    }


    if (paid > total) {

        paid = total;

        paidAmount.value =
            total;

    }


    const remaining =
        total - paid;


    totalAmount.textContent =
        formatMoney(total);


    remainingAmount.textContent =
        formatMoney(remaining);

}


/* =========================
   تغییر مبلغ پرداختی
========================= */

paidAmount.addEventListener(
    'input',
    calculateTotals
);


/* =========================
   ثبت خرید
========================= */

savePurchaseBtn.addEventListener(
    'click',
    async () => {

        if (purchaseItems.length === 0) {

            alert(
                'حداقل یک دوا باید در خرید باشد'
            );

            return;

        }


        calculateTotals();


        const total =
            purchaseItems.reduce(
                (sum, item) =>
                    sum + Number(item.total_price),
                0
            );


        const paid =
            Number(paidAmount.value) || 0;


        if (paid > total) {

            alert(
                'مبلغ پرداختی نمی‌تواند بیشتر از مبلغ خرید باشد'
            );

            return;

        }


        const data = {

            supplier_id:
                supplierSelect.value
                    ? Number(supplierSelect.value)
                    : null,

            paid_amount:
                paid,

            description:
                purchaseDescription.value.trim(),

           items:
    purchaseItems.map(item => ({

        product_id:
            Number(item.product_id),

        batch_number:
            item.batch_number,

        expiry_date:
            item.expiry_date,

        quantity:
            Number(item.quantity),

        purchase_price:
            Number(item.purchase_price)

    }))

        };


       const currency =
    window.getSystemCurrency
        ? window.getSystemCurrency()
        : 'AFN';


const confirmed =
    confirm(
        `آیا خرید به مبلغ ${formatMoney(total)} ${currency} ثبت شود؟`
    );


        if (!confirmed) {

            return;

        }


        try {

            savePurchaseBtn.disabled = true;

            savePurchaseBtn.textContent =
                'در حال ثبت...';


            const response =
                await fetch(
                    '/api/purchases',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify(data)

                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                alert(
                    result.message ||
                    'خطا در ثبت خرید'
                );

                return;

            }


            alert(
                `خرید ${result.data.invoice_number}
                 با موفقیت ثبت شد`
            );


            /*
             * فعلاً به همین صفحه برمی‌گردیم.
             * صفحه نمایش خرید را بعداً می‌سازیم.
             */

            window.location.href =
                '/purchases.html';

        }

        catch (error) {

            console.error(error);

            alert(
                'ارتباط با سرور برقرار نشد'
            );

        }

        finally {

            savePurchaseBtn.disabled = false;

            savePurchaseBtn.textContent =
                'ثبت خرید';

        }

    }
);


/* =========================
   بازگشت
========================= */

function goBack() {

    window.location.href =
        '/';

}


async function waitForSystemSettings() {

    while (
        !window.systemSettings
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    50
                )
        );

    }

}


/* =========================
   شروع صفحه
========================= */

async function init() {

    await waitForSystemSettings();


    await Promise.all([

        loadProducts(),

        loadSuppliers()

    ]);


    renderPurchaseItems();

    calculateTotals();

}


init();