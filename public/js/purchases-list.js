let purchases = [];


/* =========================
   عناصر صفحه
========================= */

const tableBody =
    document.getElementById('purchasesTableBody');

const searchInput =
    document.getElementById('searchInput');

const purchaseCount =
    document.getElementById('purchaseCount');

const totalPurchases =
    document.getElementById('totalPurchases');

const totalPaid =
    document.getElementById('totalPaid');

const totalRemaining =
    document.getElementById('totalRemaining');


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

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

}


/* =========================
   دریافت خریدها
========================= */

async function loadPurchases() {

    try {

        const response =
            await fetch('/api/purchases');

        const result =
            await response.json();


        if (!result.success) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="8">
                        ${result.message || 'خطا در دریافت خریدها'}
                    </td>

                </tr>

            `;

            return;

        }


        purchases =
            result.data || [];


        renderPurchases();


    } catch (error) {

        console.error(error);


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    ارتباط با سرور برقرار نشد
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش خریدها
========================= */

function renderPurchases() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        purchases.filter(purchase => {

            const invoice =
                String(
                    purchase.invoice_number || ''
                ).toLowerCase();


            const supplier =
                String(
                    purchase.supplier_name || ''
                ).toLowerCase();


            return (
                invoice.includes(search) ||
                supplier.includes(search)
            );

        });


    tableBody.innerHTML = '';


    if (filtered.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    هیچ خریدی پیدا نشد
                </td>

            </tr>

        `;

        updateSummary(filtered);

        return;

    }


    filtered.forEach(
        (purchase, index) => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${purchase.invoice_number || '-'}
                </td>

                <td>
                    ${purchase.supplier_name || 'متفرقه'}
                </td>

                <td>
                    ${formatMoney(
                        purchase.total_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        purchase.paid_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        purchase.remaining_amount
                    )}
                </td>

                <td>
                    ${formatDate(
                        purchase.purchase_date
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="viewPurchase(${purchase.id})">
                        مشاهده
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    updateSummary(filtered);

}


/* =========================
   جمع‌بندی
========================= */

function updateSummary(list) {

    let total = 0;

    let paid = 0;

    let remaining = 0;


    list.forEach(purchase => {

        total +=
            Number(
                purchase.total_amount
            ) || 0;


        paid +=
            Number(
                purchase.paid_amount
            ) || 0;


        remaining +=
            Number(
                purchase.remaining_amount
            ) || 0;

    });


    purchaseCount.textContent =
        list.length;


    totalPurchases.textContent =
        formatMoney(total);


    totalPaid.textContent =
        formatMoney(paid);


    totalRemaining.textContent =
        formatMoney(remaining);

}


/* =========================
   جستجو
========================= */

searchInput.addEventListener(
    'input',
    renderPurchases
);


/* =========================
   مشاهده خرید
========================= */

function viewPurchase(id) {

    window.location.href =
        `/purchase-details.html?id=${id}`;

}


/* =========================
   شروع
========================= */

loadPurchases();