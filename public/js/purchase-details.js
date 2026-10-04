/* =========================
   دریافت ID خرید از URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const purchaseId =
    params.get('id');


/* =========================
   عناصر صفحه
========================= */

const invoiceNumber =
    document.getElementById(
        'invoiceNumber'
    );

const purchaseDate =
    document.getElementById(
        'purchaseDate'
    );

const supplierName =
    document.getElementById(
        'supplierName'
    );

const supplierPhone =
    document.getElementById(
        'supplierPhone'
    );

const itemsBody =
    document.getElementById(
        'purchaseItemsBody'
    );

const totalAmount =
    document.getElementById(
        'totalAmount'
    );

const paidAmount =
    document.getElementById(
        'paidAmount'
    );

const remainingAmount =
    document.getElementById(
        'remainingAmount'
    );

const description =
    document.getElementById(
        'description'
    );


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString('en-US', {

            minimumFractionDigits: 0,

            maximumFractionDigits: 2

        });

}


/* =========================
   فرمت تاریخ
========================= */

function formatDate(value) {

    if (!value) {

        return '-';

    }


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return value;

    }


    return date.toLocaleString(
        'fa-IR',
        {

            year: 'numeric',

            month: '2-digit',

            day: '2-digit',

            hour: '2-digit',

            minute: '2-digit'

        }
    );

}


/* =========================
   بررسی ID
========================= */

if (!purchaseId) {

    alert(
        'شناسه خرید مشخص نیست'
    );

    window.location.href =
        '/purchases-list.html';

}


/* =========================
   دریافت اطلاعات خرید
========================= */

async function loadPurchase() {

    try {

        const response =
            await fetch(
                `/api/purchases/${purchaseId}`
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            alert(
                result.message ||
                'خرید پیدا نشد'
            );

            window.location.href =
                '/purchases-list.html';

            return;

        }


        const purchase =
            result.data.purchase;


        const items =
            result.data.items || [];


        /* =====================
           اطلاعات خرید
        ===================== */

        invoiceNumber.textContent =
            purchase.invoice_number || '-';

            const printInvoiceNumber =
    document.getElementById(
        'printInvoiceNumber'
    );

if (printInvoiceNumber) {

    printInvoiceNumber.textContent =
        purchase.invoice_number || '-';

}


        purchaseDate.textContent =
            formatDate(
                purchase.purchase_date
            );


        supplierName.textContent =
            purchase.supplier_name ||
            'شرکت متفرقه';


        supplierPhone.textContent =
            purchase.supplier_phone ||
            '-';


        totalAmount.textContent =
            formatMoney(
                purchase.total_amount
            );


        paidAmount.textContent =
            formatMoney(
                purchase.paid_amount
            );


        remainingAmount.textContent =
            formatMoney(
                purchase.remaining_amount
            );


        description.textContent =
            purchase.description ||
            '-';


/* =========================
   دکمه برگشت دوا
========================= */

const returnPurchaseBtn =
    document.getElementById(
        'returnPurchaseBtn'
    );


if (returnPurchaseBtn) {

    returnPurchaseBtn.addEventListener(
        'click',
        function () {

            window.location.href =
                `/purchase-return.html?id=${purchaseId}`;

        }
    );

}

        /* =====================
           اقلام خرید
        ===================== */

        itemsBody.innerHTML = '';


        if (items.length === 0) {

            itemsBody.innerHTML = `

                <tr>

                    <td colspan="7">
                        هیچ دوایی برای این خرید ثبت نشده است
                    </td>

                </tr>

            `;

            return;

        }


        items.forEach(
            (item, index) => {

                const row =
                    document.createElement(
                        'tr'
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${item.product_code || '-'}
                    </td>

                   <td>

    ${item.product_name || '-'}

    <br>

    <small>
        بچ: ${item.batch_number || '-'}
        |
        انقضا: ${item.expiry_date || '-'}
    </small>

</td>
                    <td>
                        ${item.product_unit || '-'}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        ${formatMoney(
                            item.purchase_price
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            item.total_price
                        )}
                    </td>

                `;


                itemsBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(error);


        alert(
            'ارتباط با سرور برقرار نشد'
        );

    }

}


/* =========================
   شروع
========================= */

loadPurchase();