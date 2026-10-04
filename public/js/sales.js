let products = [];
let customers = [];
let saleItems = [];


/* =========================
   عناصر صفحه
========================= */

const customerSelect =
    document.getElementById('customerSelect');

const productSelect =
    document.getElementById('productSelect');

const productSearch =
    document.getElementById('productSearch');

const productSearchResults =
    document.getElementById('productSearchResults');

    /* =========================
   انتخاب بچ دارو
========================= */

let availableBatches = [];

const productFormGroup =
    productSelect.closest('.form-group');

const batchFormGroup =
    document.createElement('div');

batchFormGroup.className =
    'form-group';

batchFormGroup.innerHTML = `

    <label for="batchSelect">
        بچ / تاریخ انقضا
    </label>

    <select id="batchSelect" disabled>

        <option value="">
            ابتدا دارو را انتخاب کنید
        </option>

    </select>

`;

if (productFormGroup) {

    productFormGroup.insertAdjacentElement(
        'afterend',
        batchFormGroup
    );

} else {

    productSelect.parentNode.appendChild(
        batchFormGroup
    );

}


const batchSelect =
    document.getElementById(
        'batchSelect'
    );

const productQuantity =
    document.getElementById('productQuantity');

const productPrice =
    document.getElementById('productPrice');

const addProductBtn =
    document.getElementById('addProductBtn');

const saleItemsBody =
    document.getElementById('saleItemsBody');

const totalAmount =
    document.getElementById('totalAmount');

const discount =
    document.getElementById('discount');

const finalAmount =
    document.getElementById('finalAmount');

const paidAmount =
    document.getElementById('paidAmount');

const remainingAmount =
    document.getElementById('remainingAmount');

const saveSaleBtn =
    document.getElementById('saveSaleBtn');

const saleDescription =
    document.getElementById('saleDescription');


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
   دریافت بچ‌های دارو
========================= */

async function loadBatches(
    productId
) {

    availableBatches = [];


    batchSelect.innerHTML = `

        <option value="">
            در حال دریافت بچ‌ها...
        </option>

    `;


    batchSelect.disabled = true;


    if (!productId) {

        batchSelect.innerHTML = `

            <option value="">
                ابتدا دارو را انتخاب کنید
            </option>

        `;

        return;

    }


    try {

        const response =
            await fetch(
                `/api/batches/product/${productId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت بچ‌ها انجام نشد'
            );

        }


        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        availableBatches =
            (result.data || [])
                .filter(batch => {

                    if (
                        Number(batch.status) !== 1
                    ) {

                        return false;

                    }


                    const expiry =
                        new Date(
                            batch.expiry_date
                        );

                    expiry.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    if (
                        expiry < today
                    ) {

                        return false;

                    }


                    if (
                        Number(batch.quantity) <= 0
                    ) {

                        return false;

                    }


                    return true;

                });


        batchSelect.innerHTML = `

            <option value="">
                انتخاب بچ
            </option>

        `;


        if (
            availableBatches.length === 0
        ) {

            batchSelect.innerHTML = `

                <option value="">
                    بچ معتبر موجود نیست
                </option>

            `;

            return;

        }


        availableBatches.forEach(
            batch => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    batch.id;


                option.textContent =
                    `بچ: ${batch.batch_number}
                     | انقضا: ${batch.expiry_date}
                     | موجودی: ${batch.quantity}`;


                batchSelect.appendChild(
                    option
                );

            }
        );


        batchSelect.disabled =
            false;


    } catch (error) {

        console.error(
            'Load batches error:',
            error
        );


        batchSelect.innerHTML = `

            <option value="">
                خطا در دریافت بچ‌ها
            </option>

        `;

    }

}


/* =========================
   دریافت مشتریان
========================= */

async function loadCustomers() {

    try {

        const response =
            await fetch('/api/customers');

        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.message ||
                'خطا در دریافت مشتریان'
            );

            return;

        }


        customers =
            result.data || [];


        customerSelect.innerHTML = `

            <option value="">
                فروش نقدی / مشتری متفرقه
            </option>

        `;


        customers
            .filter(customer => Number(customer.status) === 1)
            .forEach(customer => {

                const option =
                    document.createElement('option');


                option.value =
                    customer.id;


                option.textContent =
                    `${customer.name}
                     ${customer.phone
                        ? '- ' + customer.phone
                        : ''}`;


                customerSelect.appendChild(option);

            });


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برای دریافت مشتریان برقرار نشد'
        );

    }

}


/* =========================
   انتخاب دوا
========================= */

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
                موجودی: ${product.stock}
                |
                قیمت فروش: ${formatMoney(product.sale_price)}
            </small>

        `;


        item.addEventListener(
            'click',
            () => {

                selectProductForSale(product);

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
   انتخاب دوا از جستجو
========================= */

async function selectProductForSale(product) {

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


    batchSelect.innerHTML = `

        <option value="">
            در حال دریافت بچ‌ها...
        </option>

    `;

    batchSelect.disabled =
        true;


    productPrice.value =
        Number(product.sale_price);


    await loadBatches(
        Number(product.id)
    );

}


/* =========================
   جستجو هنگام تایپ
========================= */

productSearch.addEventListener(
    'input',
    () => {

        /*
         * وقتی کاربر متن جدید وارد می‌کند،
         * انتخاب قبلی حذف می‌شود.
         */

        productSelect.value =
            '';

        productPrice.value =
            '';

        batchSelect.innerHTML = `

            <option value="">
                ابتدا دوا را انتخاب کنید
            </option>

        `;

        batchSelect.disabled =
            true;

        availableBatches = [];


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
         * اول بررسی می‌کنیم آیا کد دقیق دوا
         * وارد یا اسکن شده است.
         */

        const exactProduct =
            products.find(product => {

                return String(product.code || '')
                    .trim()
                    .toLowerCase() ===
                    scannedCode;

            });


        if (exactProduct) {

            selectProductForSale(
                exactProduct
            );

            return;

        }


        /*
         * اگر کد دقیق پیدا نشد ولی فقط یک نتیجه
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

            selectProductForSale(
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
   بستن با کلید Escape
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

batchSelect.addEventListener(
    'change',
    () => {

        const batchId =
            Number(batchSelect.value);


        const batch =
            availableBatches.find(
                item =>
                    Number(item.id) === batchId
            );


        if (!batch) {

            return;

        }


        productPrice.value =
            Number(
                batch.sale_price
            );

    }
);


/* =========================
   افزودن دوا به فاکتور
========================= */

addProductBtn.addEventListener(
    'click',
    () => {

        const productId =
            Number(productSelect.value);

        const batchId =
            Number(batchSelect.value);

        const quantity =
            Number(productQuantity.value);

        const price =
            Number(productPrice.value);


      if (!productId) {

    alert(
        'لطفاً دوا را انتخاب کنید'
    );

    productSearch.focus();

    return;


        }


        if (!batchId) {

            alert(
                'لطفاً بچ دارو را انتخاب کنید'
            );

            batchSelect.focus();

            return;

        }

   

        if (!quantity || quantity <= 0) {

            alert('تعداد دوا باید بیشتر از صفر باشد');

            return;

        }


        if (price < 0 || Number.isNaN(price)) {

            alert('قیمت فروش نامعتبر است');

            return;

        }


const product =
    products.find(
        item =>
            Number(item.id) === productId
    );


if (!product) {

    alert(
        'دوا پیدا نشد'
    );

    return;

}


const selectedBatch =
    availableBatches.find(
        batch =>
            Number(batch.id) ===
            batchId
    );


if (!selectedBatch) {

    alert(
        'بچ انتخاب‌شده معتبر نیست'
    );

    return;

}


if (
    Number(selectedBatch.quantity) <
    quantity
) {

    alert(
        `موجودی بچ کافی نیست. موجودی بچ: ${selectedBatch.quantity}`
    );

    return;

}

        /* بررسی موجودی */

        if (
            Number(product.stock) <
            quantity
        ) {

            alert(
                `موجودی کافی نیست. موجودی فعلی: ${product.stock}`
            );

            return;

        }


        /* اگر دوا قبلاً در فاکتور است */
const existingItem =
    saleItems.find(
        item =>
            Number(item.product_id) === productId &&
            Number(item.batch_id) === batchId
    );

        if (existingItem) {

            const newQuantity =
                existingItem.quantity +
                quantity;


            if (
                Number(product.stock) <
                newQuantity
            ) {

                alert(
                    `موجودی کافی نیست. موجودی فعلی: ${product.stock}`
                );

                return;

            }


            existingItem.quantity =
                newQuantity;


            existingItem.sale_price =
                price;


            existingItem.total_price =
                newQuantity * price;

        }

        else {

            saleItems.push({

                batch_id:
    selectedBatch.id,

batch_number:
    selectedBatch.batch_number,

expiry_date:
    selectedBatch.expiry_date,

                product_id:
                    product.id,

                product_name:
                    product.name,

                code:
                    product.code,

                unit:
                    product.unit,

                quantity:
                    quantity,

                sale_price:
                    price,

              purchase_price:
    Number(
        selectedBatch.purchase_price
    ),

                total_price:
                    quantity * price

                    

            });

        }


        renderSaleItems();


        productSelect.value = '';

        productQuantity.value = '1';

        productPrice.value = '';
        batchSelect.innerHTML = `

    <option value="">
        ابتدا دارو را انتخاب کنید
    </option>

`;

batchSelect.disabled = true;

availableBatches = [];

    }
);


/* =========================
   نمایش اقلام فاکتور
========================= */

function renderSaleItems() {

    saleItemsBody.innerHTML = '';


    if (saleItems.length === 0) {

        saleItemsBody.innerHTML = `

            <tr>

                <td colspan="6">

                    هنوز دوایی به فاکتور اضافه نشده است

                </td>

            </tr>

        `;

        calculateTotals();

        return;

    }


    saleItems.forEach(
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

    <br>

    <small>
        بچ: ${item.batch_number || '-'}
        |
        انقضا: ${item.expiry_date || '-'}
    </small>
</td>

                <td>
                    ${item.quantity}
                    ${item.unit || ''}
                </td>

                <td>
                    ${formatMoney(item.sale_price)}
                </td>

                <td>
                    ${formatMoney(item.total_price)}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="removeSaleItem(${index})"
                        class="cancel-btn"
                    >
                        حذف
                    </button>

                </td>

            `;


            saleItemsBody.appendChild(row);

        }
    );


    calculateTotals();

}


/* =========================
   حذف دوا
========================= */

function removeSaleItem(index) {

    saleItems.splice(index, 1);

    renderSaleItems();

}


/* =========================
   محاسبه مبلغ فاکتور
========================= */

function calculateTotals() {

    const total =
        saleItems.reduce(
            (sum, item) =>
                sum + Number(item.total_price),
            0
        );


    let discountValue =
        Number(discount.value) || 0;


    if (discountValue < 0) {

        discountValue = 0;

    }


    if (discountValue > total) {

        discountValue = total;

        discount.value = total;

    }


    const final =
        total - discountValue;


    let paid =
        Number(paidAmount.value) || 0;


    if (paid < 0) {

        paid = 0;

    }


    if (paid > final) {

        paid = final;

        paidAmount.value = final;

    }


    const remaining =
        final - paid;


    totalAmount.textContent =
        formatMoney(total);


    finalAmount.textContent =
        formatMoney(final);


    remainingAmount.textContent =
        formatMoney(remaining);

}


/* =========================
   تغییر تخفیف
========================= */

discount.addEventListener(
    'input',
    calculateTotals
);


/* =========================
   تغییر پرداخت
========================= */

paidAmount.addEventListener(
    'input',
    calculateTotals
);


/* =========================
   ثبت فاکتور
========================= */

saveSaleBtn.addEventListener(
    'click',
    async () => {

        if (saleItems.length === 0) {

            alert(
                'حداقل یک دوا باید در فاکتور باشد'
            );

            return;

        }


        calculateTotals();


        const total =
            saleItems.reduce(
                (sum, item) =>
                    sum + Number(item.total_price),
                0
            );


        const discountValue =
            Number(discount.value) || 0;


        const final =
            total - discountValue;


        const paid =
            Number(paidAmount.value) || 0;


        if (discountValue > total) {

            alert(
                'تخفیف نمی‌تواند بیشتر از مبلغ فاکتور باشد'
            );

            return;

        }


        if (paid > final) {

            alert(
                'مبلغ پرداختی نمی‌تواند بیشتر از مبلغ نهایی باشد'
            );

            return;

        }


        const data = {

            customer_id:
                customerSelect.value
                    ? Number(customerSelect.value)
                    : null,

            discount:
                discountValue,

            paid_amount:
                paid,

            description:
                saleDescription.value.trim(),

            items:
                saleItems.map(item => ({

                product_id:
    Number(item.product_id),

batch_id:
    Number(item.batch_id),

quantity:
    Number(item.quantity),

sale_price:
    Number(item.sale_price)

                }))

        };

const currency =
    window.getSystemCurrency
        ? window.getSystemCurrency()
        : 'AFN';


const confirmed =
    confirm(
        `آیا فاکتور به مبلغ ${formatMoney(final)} ${currency} ثبت شود؟`
    );


        if (!confirmed) {

            return;

        }


        try {

            saveSaleBtn.disabled = true;

            saveSaleBtn.textContent =
                'در حال ثبت...';


            const response =
                await fetch(
                    '/api/sales',
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
                    'خطا در ثبت فاکتور'
                );

                return;

            }


            alert(
                `فاکتور ${result.data.invoice_number}
                 با موفقیت ثبت شد`
            );


            /*
             * بعداً اینجا می‌توانیم
             * صفحه چاپ فاکتور را باز کنیم.
             */

            window.location.href =
                `/sales.html`;

        }

        catch (error) {

            console.error(error);

            alert(
                'ارتباط با سرور برقرار نشد'
            );

        }

        finally {

            saveSaleBtn.disabled = false;

            saveSaleBtn.textContent =
                'ثبت فاکتور';

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


/* =========================
   شروع صفحه
========================= */

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

        loadCustomers()

    ]);


    renderSaleItems();

    calculateTotals();

}


init();