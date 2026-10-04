/* =========================
   دریافت ID خرید از URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const purchaseIdFromUrl =
    params.get('id');

const purchaseSelect =
    document.getElementById(
        'purchaseSelect'
    );

const supplierName =
    document.getElementById(
        'supplierName'
    );

const purchaseTotal =
    document.getElementById(
        'purchaseTotal'
    );

const returnTotal =
    document.getElementById(
        'returnTotal'
    );

const returnItemsBody =
    document.getElementById(
        'returnItemsBody'
    );

const descriptionInput =
    document.getElementById(
        'description'
    );

const saveReturnBtn =
    document.getElementById(
        'saveReturnBtn'
    );

const message =
    document.getElementById(
        'message'
    );


let purchases = [];

let selectedPurchase = null;


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


/* =========================
   دریافت خریدها
========================= */

async function loadPurchases() {

    try {

        const response =
            await fetch(
                '/api/purchases'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت خریدها انجام نشد'
            );

        }


        purchases =
            result.data || [];


        purchaseSelect.innerHTML = `

            <option value="">
                انتخاب خرید
            </option>

        `;


        purchases.forEach(
            purchase => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    purchase.id;


                option.textContent =
                    `${purchase.invoice_number} - ${
                        purchase.supplier_name ||
                        'شرکت متفرقه'
                    } - ${
                        formatMoney(
                            purchase.total_amount
                        )
                    } افغانی`;


                purchaseSelect.appendChild(
                    option
                );

            }
        );

/* =========================
   انتخاب خودکار خرید از URL
========================= */

if (purchaseIdFromUrl) {

    const targetPurchase =
        purchases.find(
            purchase =>
                String(purchase.id) ===
                String(purchaseIdFromUrl)
        );


    if (targetPurchase) {

        purchaseSelect.value =
            String(
                targetPurchase.id
            );


        purchaseSelect.dispatchEvent(
            new Event('change')
        );

    }

}

    } catch (error) {

        console.error(error);


        message.textContent =
            error.message;

    }

}


/* =========================
   دریافت جزئیات خرید
========================= */

async function loadPurchase(
    purchaseId
) {

    try {

        const response =
            await fetch(
                `/api/purchases/${purchaseId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت جزئیات خرید انجام نشد'
            );

        }


        selectedPurchase =
            result.data;


        const purchase =
            selectedPurchase.purchase;


        const items =
            selectedPurchase.items ||
            [];


        supplierName.value =
            purchase.supplier_name ||
            'شرکت متفرقه';


        purchaseTotal.value =
            formatMoney(
                purchase.total_amount
            );


        returnTotal.value =
            formatMoney(0);


        renderItems(items);


    } catch (error) {

        console.error(error);


        selectedPurchase =
            null;


        returnItemsBody.innerHTML = `

            <tr>

                <td colspan="5">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش اقلام
========================= */

function renderItems(items) {

    returnItemsBody.innerHTML =
        '';


    if (items.length === 0) {

        returnItemsBody.innerHTML = `

            <tr>

                <td colspan="5">
                    این خرید دوایی ندارد
                </td>

            </tr>

        `;

        return;

    }


    items.forEach(
        item => {

            const row =
                document.createElement(
                    'tr'
                );


            const quantity =
                Number(
                    item.quantity
                ) || 0;


            const price =
                Number(
                    item.purchase_price
                ) || 0;


            row.dataset.purchaseItemId =
                item.id;


            row.dataset.price =
                price;


            row.innerHTML = `

                <td>
                    ${item.product_name || '-'}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>

                    <input
                        type="number"
                        class="return-quantity"
                        min="0"
                        max="${quantity}"
                        step="0.001"
                        value="0">

                </td>

                <td>
                    ${formatMoney(price)}
                </td>

                <td class="item-return-total">
                    0
                </td>

            `;


            const quantityInput =
                row.querySelector(
                    '.return-quantity'
                );


            quantityInput.addEventListener(
                'input',
                updateReturnTotal
            );


            returnItemsBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   محاسبه مبلغ برگشت
========================= */

function updateReturnTotal() {

    let total = 0;


    const rows =
        returnItemsBody.querySelectorAll(
            'tr'
        );


    rows.forEach(
        row => {

            const input =
                row.querySelector(
                    '.return-quantity'
                );


            const totalCell =
                row.querySelector(
                    '.item-return-total'
                );


            if (!input) {
                return;
            }


            let quantity =
                Number(
                    input.value
                ) || 0;


            const max =
                Number(
                    input.max
                ) || 0;


            if (quantity < 0) {

                quantity = 0;

                input.value = 0;

            }


            if (quantity > max) {

                quantity = max;

                input.value =
                    max;

            }


            const price =
                Number(
                    row.dataset.price
                ) || 0;


            const itemTotal =
                quantity * price;


            total +=
                itemTotal;


            totalCell.textContent =
                formatMoney(
                    itemTotal
                );

        }
    );


    returnTotal.value =
        formatMoney(total);

}


/* =========================
   انتخاب خرید
========================= */

purchaseSelect.addEventListener(
    'change',
    function () {

        const purchaseId =
            this.value;


        selectedPurchase =
            null;


        supplierName.value =
            '';

        purchaseTotal.value =
            '0';

        returnTotal.value =
            '0';


        if (!purchaseId) {

            returnItemsBody.innerHTML = `

                <tr>

                    <td colspan="5">

                        ابتدا یک فاکتور خرید انتخاب کنید

                    </td>

                </tr>

            `;

            return;

        }


        loadPurchase(
            purchaseId
        );

    }
);


/* =========================
   ثبت برگشت
========================= */

saveReturnBtn.addEventListener(
    'click',
    async function () {

        if (!selectedPurchase) {

            alert(
                'ابتدا یک فاکتور خرید انتخاب کنید'
            );

            return;

        }


        const rows =
            returnItemsBody.querySelectorAll(
                'tr'
            );


        const items = [];


        rows.forEach(
            row => {

                const input =
                    row.querySelector(
                        '.return-quantity'
                    );


                if (!input) {
                    return;
                }


                const quantity =
                    Number(
                        input.value
                    ) || 0;


                if (quantity <= 0) {
                    return;
                }


                items.push({

                    purchase_item_id:
                        Number(
                            row.dataset.purchaseItemId
                        ),

                    quantity

                });

            }
        );


        if (items.length === 0) {

            alert(
                'حداقل یک دوا با مقدار برگشتی بیشتر از صفر انتخاب کنید'
            );

            return;

        }


        const description =
            descriptionInput.value
                .trim();


        try {

            saveReturnBtn.disabled =
                true;


            message.textContent =
                'در حال ثبت برگشت...';


            const response =
                await fetch(
                    '/api/purchase-returns',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({

                                purchase_id:
                                    Number(
                                        selectedPurchase
                                            .purchase.id
                                    ),

                                description:
                                    description ||
                                    null,

                                items

                            })

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
                    'ثبت برگشت خرید انجام نشد'
                );

            }


            alert(
                'برگشت خرید با موفقیت ثبت شد'
            );


            window.location.href =
                `/supplier-account.html?id=${
                    selectedPurchase
                        .purchase.supplier_id
                }`;


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message ||
                'خطا در ثبت برگشت خرید';


        } finally {

            saveReturnBtn.disabled =
                false;

        }

    }
);


/* =========================
   شروع
========================= */

loadPurchases();