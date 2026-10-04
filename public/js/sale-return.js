/* =========================
   دریافت ID فروش از URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const saleIdFromUrl =
    params.get('id');

const customerIdFromUrl =
    params.get('customer_id');

const saleSelect =
    document.getElementById(
        'saleSelect'
    );

const customerName =
    document.getElementById(
        'customerName'
    );

const saleTotal =
    document.getElementById(
        'saleTotal'
    );

const returnTotal =
    document.getElementById(
        'returnTotal'
    );

const refundAmount =
    document.getElementById(
        'refundAmount'
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


let sales = [];

let selectedSale = null;


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
   دریافت فاکتورهای فروش
========================= */

async function loadSales() {

    try {

        const response =
            await fetch(
                '/api/sales'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت فاکتورهای فروش انجام نشد'
            );

        }


      sales =
    result.data || [];


/* =========================
   فیلتر فروش‌ها بر اساس مشتری
========================= */

if (customerIdFromUrl) {

    sales =
        sales.filter(
            sale =>
                String(sale.customer_id) ===
                String(customerIdFromUrl)
        );

}

        saleSelect.innerHTML = `

            <option value="">
                انتخاب فاکتور
            </option>

        `;


        sales.forEach(
            sale => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    sale.id;


                option.textContent =
                    `${sale.invoice_number} - ${
                        sale.customer_name ||
                        'مشتری متفرقه'
                    } - ${
                        formatMoney(
                            sale.total_amount
                        )
                    } افغانی`;


                saleSelect.appendChild(
                    option
                );

            }
        );

/* =========================
   انتخاب خودکار فروش از URL
========================= */

if (saleIdFromUrl) {

    const targetSale =
        sales.find(
            sale =>
                String(sale.id) ===
                String(saleIdFromUrl)
        );


    if (targetSale) {

        saleSelect.value =
            String(
                targetSale.id
            );


        saleSelect.dispatchEvent(
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
   دریافت جزئیات فروش
========================= */

async function loadSale(
    saleId
) {

    try {

        const response =
            await fetch(
                `/api/sales/${saleId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت جزئیات فروش انجام نشد'
            );

        }


        selectedSale =
            result.data;


        const sale =
            selectedSale.sale;


        const items =
            selectedSale.items || [];


        customerName.value =
            sale.customer_name ||
            'مشتری متفرقه';


        saleTotal.value =
            formatMoney(
                sale.total_amount
            );


        returnTotal.value =
            formatMoney(0);


       
        renderItems(items);


    } catch (error) {

        console.error(error);


        selectedSale =
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
   نمایش اقلام فروش
========================= */

function renderItems(items) {

    returnItemsBody.innerHTML =
        '';


    if (items.length === 0) {

        returnItemsBody.innerHTML = `

            <tr>

                <td colspan="5">
                    این فاکتور دوایی ندارد
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
                    item.sale_price
                ) || 0;


            row.dataset.saleItemId =
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


    /* =========================
       محدود کردن بازپرداخت
    ========================= */

    const refund =
        Number(
            refundAmount.value
        ) || 0;


    if (
        refund >
        total
    ) {

        refundAmount.value =
            total;

    }

}


/* =========================
   تغییر مبلغ بازپرداخت
========================= */

refundAmount.addEventListener(
    'input',
    function () {

        const total =
            Number(
                returnTotal.value
                    .replace(/,/g, '')
            ) || 0;


        let refund =
            Number(
                this.value
            ) || 0;


        if (refund < 0) {

            refund = 0;

            this.value = 0;

        }


        if (
            refund >
            total
        ) {

            refund = total;

            this.value =
                total;

        }

    }
);


/* =========================
   انتخاب فروش
========================= */

saleSelect.addEventListener(
    'change',
    function () {

        const saleId =
            this.value;


        selectedSale =
            null;


        customerName.value =
            '';

        saleTotal.value =
            '0';

        returnTotal.value =
            '0';

        refundAmount.value =
            '0';


        if (!saleId) {

            returnItemsBody.innerHTML = `

                <tr>

                    <td colspan="5">

                        ابتدا یک فاکتور فروش انتخاب کنید

                    </td>

                </tr>

            `;

            return;

        }


        loadSale(
            saleId
        );

    }
);


/* =========================
   ثبت برگشت فروش
========================= */

saveReturnBtn.addEventListener(
    'click',
    async function () {

        if (!selectedSale) {

            alert(
                'ابتدا یک فاکتور فروش انتخاب کنید'
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


                if (
                    quantity <= 0
                ) {

                    return;

                }


                items.push({

                    sale_item_id:
                        Number(
                            row.dataset.saleItemId
                        ),

                    quantity

                });

            }
        );


        if (
            items.length === 0
        ) {

            alert(
                'حداقل یک دوا با مقدار برگشتی بیشتر از صفر انتخاب کنید'
            );

            return;

        }


        const total =
            Number(
                returnTotal.value
                    .replace(/,/g, '')
            ) || 0;


      const refund =
    parseFloat(
        refundAmount.value
    ) || 0;

        if (
            refund >
            total
        ) {

            alert(
                'مبلغ بازپرداخت نمی‌تواند بیشتر از مبلغ دواهای برگشتی باشد'
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
                    '/api/sale-returns',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                sale_id:
                                    Number(
                                        selectedSale
                                            .sale.id
                                    ),

                                refund_amount:
                                    refund,

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
                    'ثبت برگشت فروش انجام نشد'
                );

            }


            alert(
                'برگشت فروش با موفقیت ثبت شد'
            );


         if (
    selectedSale.sale.customer_id
) {

    window.location.href =
        `/customer-account.html?id=${
            selectedSale.sale.customer_id
        }`;

} else {

    window.location.href =
        '/sales.html';

}


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message ||
                'خطا در ثبت برگشت فروش';


        } finally {

            saveReturnBtn.disabled =
                false;

        }

    }
);


/* =========================
   شروع
========================= */

loadSales();