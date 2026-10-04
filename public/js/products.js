const tableBody = document.getElementById('productsTableBody');
const searchInput = document.getElementById('searchInput');

const addProductBtn = document.getElementById('addProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');

const productFormContainer =
    document.getElementById('productFormContainer');

const productForm =
    document.getElementById('productForm');

const categorySelect =
    document.getElementById('category_id');

const categoryModal =
    document.getElementById('categoryModal');

const addCategoryBtn =
    document.getElementById('addCategoryBtn');

const closeCategoryBtn =
    document.getElementById('closeCategoryBtn');

const categoryForm =
    document.getElementById('categoryForm');

let products = [];


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

            alert(result.message || 'خطا در دریافت دواها');

            return;
        }

        products = result.data;

        displayProducts(products);

    } catch (error) {

        console.error(error);

        alert('ارتباط با سرور برقرار نشد');

    }

}


/* =========================
   نمایش دواها
========================= */

function displayProducts(data) {

    tableBody.innerHTML = '';

    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    هنوز دوایی ثبت نشده است
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(product => {

        const isLowStock =
            Number(product.stock) <= Number(product.min_stock);


        const row =
            document.createElement('tr');


        if (isLowStock && product.status == 1) {

            row.classList.add('low-stock');

        }


        if (product.status == 0) {

            row.classList.add('inactive-row');

        }


        row.innerHTML = `

            <td>${product.code}</td>

            <td>${product.name}</td>

            <td>
                ${product.category_name || '-'}
            </td>

            <td>${product.unit}</td>

            <td>
                ${Number(product.purchase_price)
                    .toLocaleString()}
            </td>

            <td>
                ${Number(product.sale_price)
                    .toLocaleString()}
            </td>

            <td>

                ${product.stock}

                ${
                    isLowStock && product.status == 1
                    ? '<br><small>⚠ موجودی کم</small>'
                    : ''
                }

            </td>

            <td>
                ${
                    product.status == 1
                    ? 'فعال'
                    : 'غیرفعال'
                }
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})"
                    >
                        ویرایش
                    </button>

                    <button
    type="button"
    class="account-btn"
    onclick="openBatchModal(${product.id})"
>
    📦 بچ
</button>

                    ${
                        product.status == 1

                        ? `
                            <button
                                class="disable-btn"
                                onclick="disableProduct(${product.id})"
                            >
                                غیرفعال
                            </button>
                          `

                        : `
                            <button
                                class="enable-btn"
                                onclick="enableProduct(${product.id})"
                            >
                                فعال
                            </button>
                          `
                    }

                </div>

            </td>

        `;

        tableBody.appendChild(row);

    });

}


/* =========================
   دریافت دسته‌بندی‌ها
========================= */

async function loadCategories() {

    try {

        const response =
            await fetch('/api/categories');

        const result =
            await response.json();

        if (!result.success) {

            return;

        }


        categorySelect.innerHTML = `
            <option value="">
                انتخاب دسته‌بندی
            </option>
        `;


        result.data.forEach(category => {

            const option =
                document.createElement('option');

            option.value =
                category.id;

            option.textContent =
                category.name;

            categorySelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

    }

}


/* =========================
   باز کردن فرم دوا
========================= */

addProductBtn.addEventListener('click', () => {

    productForm.reset();

    document.getElementById('productId').value = '';

    document.getElementById('formTitle')
        .textContent = 'ثبت دوای جدید';

    document.getElementById('saveProductBtn')
        .textContent = 'ذخیره دوا';

    productFormContainer
        .classList.remove('hidden');

    loadCategories();

    document.getElementById('code').focus();

});


/* =========================
   بستن فرم دوا
========================= */

cancelProductBtn.addEventListener('click', () => {

    productForm.reset();

    document.getElementById('productId').value = '';

    document.getElementById('formTitle')
        .textContent = 'ثبت دوای جدید';

    document.getElementById('saveProductBtn')
        .textContent = 'ذخیره دوا';

    productFormContainer
        .classList.add('hidden');

});


/* =========================
   ثبت / ویرایش دوا
========================= */

productForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    const productId =
        document.getElementById('productId').value;


    const data = {

        code:
            document.getElementById('code')
                .value
                .trim(),

        name:
            document.getElementById('name')
                .value
                .trim(),

        category_id:
            document.getElementById('category_id')
                .value || null,

        unit:
            document.getElementById('unit')
                .value,

        purchase_price:
            Number(
                document.getElementById('purchase_price')
                    .value
            ),

        sale_price:
            Number(
                document.getElementById('sale_price')
                    .value
            ),

        stock:
            Number(
                document.getElementById('stock')
                    .value
            ),

opening_expiry_date:
    document.getElementById(
        'opening_expiry_date'
    ).value,

        min_stock:
            Number(
                document.getElementById('min_stock')
                    .value
            ),

        description:
            document.getElementById('description')
                .value
                .trim()

    };


    try {

        const url =
            productId
            ? `/api/products/${productId}`
            : '/api/products';


        const method =
            productId
            ? 'PUT'
            : 'POST';


        const response =
            await fetch(url, {

                method: method,

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(data)

            });


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert(
            productId
            ? 'دوا با موفقیت ویرایش شد'
            : 'دوا با موفقیت ثبت شد'
        );


        productForm.reset();

        document.getElementById('productId').value = '';

        document.getElementById('formTitle')
            .textContent = 'ثبت دوای جدید';

        document.getElementById('saveProductBtn')
            .textContent = 'ذخیره دوا';

        productFormContainer
            .classList.add('hidden');


        await loadProducts();


    } catch (error) {

        console.error(error);

        alert('خطا در ذخیره دوا');

    }

});


/* =========================
   ویرایش دوا
========================= */

async function editProduct(id) {

    try {

        const response =
            await fetch(`/api/products/${id}`);


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        const product =
            result.data;


        productFormContainer
            .classList.remove('hidden');


        document.getElementById('formTitle')
            .textContent = 'ویرایش دوا';


        document.getElementById('saveProductBtn')
            .textContent = 'ذخیره تغییرات';


        document.getElementById('productId')
            .value = product.id;


        document.getElementById('code')
            .value = product.code;


        document.getElementById('name')
            .value = product.name;


        await loadCategories();


        document.getElementById('category_id')
            .value = product.category_id || '';


        document.getElementById('unit')
            .value = product.unit;


        document.getElementById('purchase_price')
            .value = product.purchase_price;


        document.getElementById('sale_price')
            .value = product.sale_price;


        document.getElementById('stock')
            .value = product.stock;


        document.getElementById('min_stock')
            .value = product.min_stock;


        document.getElementById('description')
            .value = product.description || '';


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


    } catch (error) {

        console.error(error);

        alert('خطا در دریافت اطلاعات دوا');

    }

}


/* =========================
   غیرفعال کردن دوا
========================= */

async function disableProduct(id) {

    const confirmed =
        confirm(
            'آیا مطمئن هستید که می‌خواهید این دوا غیرفعال شود؟'
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(`/api/products/${id}`, {

                method: 'DELETE'

            });


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert('دوا غیرفعال شد');

        await loadProducts();


    } catch (error) {

        console.error(error);

        alert('خطا در غیرفعال کردن دوا');

    }

}


/* =========================
   فعال کردن دوا
========================= */

async function enableProduct(id) {

    try {

        const response =
            await fetch(`/api/products/${id}/enable`, {

                method: 'PUT'

            });


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert('دوا فعال شد');

        await loadProducts();


    } catch (error) {

        console.error(error);

        alert('خطا در فعال کردن دوا');

    }

}


/* =========================
   عناصر پنجره بچ
========================= */

const batchModal =
    document.getElementById('batchModal');

const batchModalTitle =
    document.getElementById('batchModalTitle');

const batchForm =
    document.getElementById('batchForm');

const batchProductId =
    document.getElementById('batchProductId');

const batchNumber =
    document.getElementById('batchNumber');

const batchExpiryDate =
    document.getElementById('batchExpiryDate');

const batchQuantity =
    document.getElementById('batchQuantity');

const batchPurchasePrice =
    document.getElementById('batchPurchasePrice');

const batchSalePrice =
    document.getElementById('batchSalePrice');

const batchTableBody =
    document.getElementById('batchTableBody');

const closeBatchBtn =
    document.getElementById('closeBatchBtn');

const saveBatchBtn =
    document.getElementById('saveBatchBtn');


/* =========================
   باز کردن پنجره بچ
========================= */

async function openBatchModal(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert('دارو پیدا نشد');

        return;

    }


    batchProductId.value =
        product.id;


    batchModalTitle.textContent =
        `بچ‌های دارو: ${product.name}`;


    batchForm.reset();


    batchProductId.value =
        product.id;


    batchQuantity.value =
        '0';


    batchPurchasePrice.value =
        product.purchase_price || 0;


    batchSalePrice.value =
        product.sale_price || 0;


    batchTableBody.innerHTML = `

        <tr>

            <td colspan="6">
                در حال دریافت بچ‌ها...
            </td>

        </tr>

    `;


    batchModal.classList.remove(
        'hidden'
    );


    await loadBatches(
        product.id
    );

}


/* =========================
   بستن پنجره
========================= */

closeBatchBtn.addEventListener(
    'click',
    () => {

        batchForm.reset();

        batchModal.classList.add(
            'hidden'
        );

    }
);


/* =========================
   دریافت بچ‌های دارو
========================= */

async function loadBatches(productId) {

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


        renderBatches(
            result.data || []
        );


    } catch (error) {

        console.error(
            'Load batches error:',
            error
        );


        batchTableBody.innerHTML = `

            <tr>

                <td colspan="6">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش بچ‌ها
========================= */

function renderBatches(batches) {

    batchTableBody.innerHTML =
        '';


    if (
        batches.length === 0
    ) {

        batchTableBody.innerHTML = `

            <tr>

                <td colspan="6">
                    هنوز بچی برای این دارو ثبت نشده است
                </td>

            </tr>

        `;

        return;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    batches.forEach(
        batch => {

            const row =
                document.createElement(
                    'tr'
                );


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


            let statusText =
                Number(batch.status) === 1
                    ? 'فعال'
                    : 'غیرفعال';


            let expiryText =
                '';


            if (
                expiry < today
            ) {

                expiryText =
                    '❌ منقضی';

            } else {

                expiryText =
                    '✅ معتبر';

            }


            if (
                Number(batch.status) !== 1
            ) {

                expiryText =
                    'غیرفعال';

            }


            row.innerHTML = `

                <td>
                    ${batch.batch_number}
                </td>

                <td>
                    ${batch.expiry_date}
                    <br>
                    <small>
                        ${expiryText}
                    </small>
                </td>

                <td>
                    ${batch.quantity}
                </td>

                <td>
                    ${Number(
                        batch.purchase_price
                    ).toLocaleString()}
                </td>

                <td>
                    ${Number(
                        batch.sale_price
                    ).toLocaleString()}
                </td>

                <td>
                    ${statusText}
                </td>

            `;


            if (
                expiry < today
            ) {

                row.classList.add(
                    'inactive-row'
                );

            }


            batchTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   ثبت بچ جدید
========================= */

batchForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const productId =
            Number(
                batchProductId.value
            );


        const data = {

            product_id:
                productId,

            batch_number:
                batchNumber.value.trim(),

            expiry_date:
                batchExpiryDate.value,

            quantity:
                Number(
                    batchQuantity.value
                ),

            purchase_price:
                Number(
                    batchPurchasePrice.value
                ),

            sale_price:
                Number(
                    batchSalePrice.value
                )

        };


        if (!productId) {

            alert(
                'دارو مشخص نیست'
            );

            return;

        }


        if (!data.batch_number) {

            alert(
                'شماره بچ را وارد کنید'
            );

            batchNumber.focus();

            return;

        }


        if (!data.expiry_date) {

            alert(
                'تاریخ انقضا را وارد کنید'
            );

            batchExpiryDate.focus();

            return;

        }


        if (
            !data.quantity ||
            data.quantity <= 0
        ) {

            alert(
                'مقدار بچ باید بیشتر از صفر باشد'
            );

            batchQuantity.focus();

            return;

        }


        if (
            data.purchase_price < 0 ||
            data.sale_price < 0
        ) {

            alert(
                'قیمت نمی‌تواند منفی باشد'
            );

            return;

        }


        try {

            saveBatchBtn.disabled =
                true;


            saveBatchBtn.textContent =
                'در حال ثبت...';


            const response =
                await fetch(
                    '/api/batches',
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify(
                                data
                            )

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    'ثبت بچ انجام نشد'
                );

            }


            alert(
                'بچ دارو با موفقیت ثبت شد'
            );


            batchForm.reset();


            batchProductId.value =
                productId;


            batchQuantity.value =
                '0';


            await loadBatches(
                productId
            );


            await loadProducts();


        } catch (error) {

            console.error(
                'Create batch error:',
                error
            );


            alert(
                error.message ||
                'خطا در ثبت بچ'
            );

        } finally {

            saveBatchBtn.disabled =
                false;

            saveBatchBtn.textContent =
                '💾 ثبت بچ';

        }

    }
);


/* =========================
   جستجو
========================= */

searchInput.addEventListener('input', () => {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(product => {

            return (

                product.name
                    .toLowerCase()
                    .includes(search)

                ||

                product.code
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayProducts(filtered);

});


/* =========================
   باز کردن دسته‌بندی
========================= */

addCategoryBtn.addEventListener('click', () => {

    categoryModal
        .classList
        .remove('hidden');

    document.getElementById('categoryName')
        .focus();

});


/* =========================
   بستن دسته‌بندی
========================= */

closeCategoryBtn.addEventListener('click', () => {

    categoryForm.reset();

    categoryModal
        .classList
        .add('hidden');

});


/* =========================
   ثبت دسته‌بندی
========================= */

categoryForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    const name =
        document.getElementById('categoryName')
            .value
            .trim();


    const description =
        document.getElementById('categoryDescription')
            .value
            .trim();


    try {

        const response =
            await fetch('/api/categories', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    name,
                    description
                })

            });


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert('دسته‌بندی با موفقیت ثبت شد');


        categoryForm.reset();

        categoryModal
            .classList
            .add('hidden');


        await loadCategories();


        categorySelect.value =
            result.id;


    } catch (error) {

        console.error(error);

        alert('خطا در ثبت دسته‌بندی');

    }

});


/* =========================
   شروع سیستم
========================= */

loadProducts();