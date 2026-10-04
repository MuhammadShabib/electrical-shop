let sales = [];


/* =========================
   عناصر صفحه
========================= */

const tableBody =
    document.getElementById('salesTableBody');

const searchInput =
    document.getElementById('searchInput');

const saleCount =
    document.getElementById('saleCount');

const totalSales =
    document.getElementById('totalSales');

const totalDiscount =
    document.getElementById('totalDiscount');

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

function formatDate(value) {

    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
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
   دریافت فروش‌ها
========================= */

async function loadSales() {

    try {

        const response =
            await fetch('/api/sales');

        const result =
            await response.json();


        if (!response.ok || !result.success) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="9">

                        ${
                            result.message ||
                            'خطا در دریافت فاکتورهای فروش'
                        }

                    </td>

                </tr>

            `;

            return;

        }


        sales =
            result.data || [];


        renderSales();


    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `

            <tr>

                <td colspan="9">
                    ارتباط با سرور برقرار نشد
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش فروش‌ها
========================= */

function renderSales() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        sales.filter(sale => {

            const invoice =
                String(
                    sale.invoice_number || ''
                ).toLowerCase();


            const customer =
                String(
                    sale.customer_name || ''
                ).toLowerCase();


            return (
                invoice.includes(search) ||
                customer.includes(search)
            );

        });


    tableBody.innerHTML = '';


    if (filtered.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="9">
                    هیچ فاکتوری پیدا نشد
                </td>

            </tr>

        `;

        updateSummary(filtered);

        return;

    }


    filtered.forEach(
        (sale, index) => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${sale.invoice_number || '-'}
                </td>

                <td>
                    ${sale.customer_name || 'مشتری متفرقه'}
                </td>

                <td>
                    ${formatMoney(
                        sale.total_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        sale.discount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        sale.paid_amount
                    )}
                </td>

                <td>
                    ${formatMoney(
                        sale.remaining_amount
                    )}
                </td>

                <td>
                    ${formatDate(
                        sale.sale_date
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="viewSale(${sale.id})">

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
   خلاصه فروش‌ها
========================= */

function updateSummary(list) {

    let total = 0;

    let discount = 0;

    let paid = 0;

    let remaining = 0;


    list.forEach(sale => {

        total +=
            Number(
                sale.total_amount
            ) || 0;


        discount +=
            Number(
                sale.discount
            ) || 0;


        paid +=
            Number(
                sale.paid_amount
            ) || 0;


        remaining +=
            Number(
                sale.remaining_amount
            ) || 0;

    });


    saleCount.textContent =
        list.length;


    totalSales.textContent =
        formatMoney(total);


    totalDiscount.textContent =
        formatMoney(discount);


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
    renderSales
);


/* =========================
   مشاهده فاکتور
========================= */

function viewSale(id) {

    window.location.href =
        `/sale-details.html?id=${id}`;

}


/* =========================
   شروع
========================= */

loadSales();