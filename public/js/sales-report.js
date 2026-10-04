/* =========================
   عناصر صفحه
========================= */

const fromDate =
    document.getElementById('fromDate');

const toDate =
    document.getElementById('toDate');

const generateReportBtn =
    document.getElementById(
        'generateReportBtn'
    );

const todayBtn =
    document.getElementById(
        'todayBtn'
    );

const thisMonthBtn =
    document.getElementById(
        'thisMonthBtn'
    );

const clearDateBtn =
    document.getElementById(
        'clearDateBtn'
    );

const printReportBtn =
    document.getElementById(
        'printReportBtn'
    );


const grossSales =
    document.getElementById(
        'grossSales'
    );

const totalDiscount =
    document.getElementById(
        'totalDiscount'
    );

const netSales =
    document.getElementById(
        'netSales'
    );

const totalPaid =
    document.getElementById(
        'totalPaid'
    );

const totalRemaining =
    document.getElementById(
        'totalRemaining'
    );

const salesCount =
    document.getElementById(
        'salesCount'
    );

const reportSalesBody =
    document.getElementById(
        'reportSalesBody'
    );

const reportMessage =
    document.getElementById(
        'reportMessage'
    );

const printDateRange =
    document.getElementById(
        'printDateRange'
    );


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
   فرمت تاریخ
========================= */

function formatDate(value) {

    if (!value) {

        return '-';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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
   امروز
========================= */

function getTodayString() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, '0');


    const day =
        String(
            today.getDate()
        ).padStart(2, '0');


    return `${year}-${month}-${day}`;

}


/* =========================
   شروع و پایان ماه
========================= */

function setThisMonth() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        today.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    fromDate.value =
        `${year}-${String(
            firstDay.getMonth() + 1
        ).padStart(2, '0')}-${String(
            firstDay.getDate()
        ).padStart(2, '0')}`;


    toDate.value =
        `${year}-${String(
            lastDay.getMonth() + 1
        ).padStart(2, '0')}-${String(
            lastDay.getDate()
        ).padStart(2, '0')}`;

}


/* =========================
   محدوده چاپ
========================= */

function updatePrintDateRange() {

    if (
        !fromDate.value &&
        !toDate.value
    ) {

        printDateRange.textContent =
            'همه فروش‌ها';

        return;

    }


    if (
        fromDate.value &&
        toDate.value
    ) {

        printDateRange.textContent =
            `از ${fromDate.value} تا ${toDate.value}`;

        return;

    }


    if (fromDate.value) {

        printDateRange.textContent =
            `از ${fromDate.value}`;

        return;

    }


    if (toDate.value) {

        printDateRange.textContent =
            `تا ${toDate.value}`;

    }

}


/* =========================
   دریافت گزارش فروش
========================= */

async function loadSalesReport() {

    try {

        reportMessage.textContent =
            'در حال دریافت گزارش فروش...';


        const params =
            new URLSearchParams();


        if (fromDate.value) {

            params.append(
                'from',
                fromDate.value
            );

        }


        if (toDate.value) {

            params.append(
                'to',
                toDate.value
            );

        }


        const url =
            params.toString()
                ? `/api/report-details?${params.toString()}`
                : '/api/report-details';


        const response =
            await fetch(url);


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت گزارش فروش انجام نشد'
            );

        }


        const data =
            result.data || {};


        const sales =
            data.sales || [];


        /* =========================
           محاسبه مجموع‌ها
        ========================== */

        let gross =
            0;

        let discount =
            0;

        let net =
            0;

        let paid =
            0;

        let remaining =
            0;


        sales.forEach(
            sale => {

                const saleNet =
                    Number(
                        sale.total_amount
                    ) || 0;

                const saleDiscount =
                    Number(
                        sale.discount
                    ) || 0;

                const salePaid =
                    Number(
                        sale.paid_amount
                    ) || 0;

                const saleRemaining =
                    Number(
                        sale.remaining_amount
                    ) ||
                    Math.max(
                        0,
                        saleNet - salePaid
                    );


                gross +=
                    saleNet +
                    saleDiscount;

                discount +=
                    saleDiscount;

                net +=
                    saleNet;

                paid +=
                    salePaid;

                remaining +=
                    saleRemaining;

            }
        );


        /* =========================
           نمایش کارت‌ها
        ========================== */

        grossSales.textContent =
            formatMoney(
                gross
            ) + ' افغانی';


        totalDiscount.textContent =
            formatMoney(
                discount
            ) + ' افغانی';


        netSales.textContent =
            formatMoney(
                net
            ) + ' افغانی';


        totalPaid.textContent =
            formatMoney(
                paid
            ) + ' افغانی';


        totalRemaining.textContent =
            formatMoney(
                remaining
            ) + ' افغانی';


        salesCount.textContent =
            sales.length;


        /* =========================
           نمایش جدول
        ========================== */

        reportSalesBody.innerHTML =
            '';


        if (
            sales.length === 0
        ) {

            reportSalesBody.innerHTML = `

                <tr>

                    <td colspan="8">
                        در این بازه هیچ فروشی ثبت نشده است
                    </td>

                </tr>

            `;

        } else {

            sales.forEach(
                sale => {

                    const saleNet =
                        Number(
                            sale.total_amount
                        ) || 0;


                    const saleDiscount =
                        Number(
                            sale.discount
                        ) || 0;


                    const salePaid =
                        Number(
                            sale.paid_amount
                        ) || 0;


                    const saleRemaining =
                        Number(
                            sale.remaining_amount
                        ) ||
                        Math.max(
                            0,
                            saleNet -
                            salePaid
                        );


                    const saleGross =
                        saleNet +
                        saleDiscount;


                    const row =
                        document.createElement(
                            'tr'
                        );


                    row.innerHTML = `

                        <td>
                            ${sale.invoice_number || '-'}
                        </td>

                        <td>
                            ${
                                sale.customer_name ||
                                'مشتری متفرقه'
                            }
                        </td>

                        <td>
                            ${formatMoney(
                                saleGross
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                saleDiscount
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                saleNet
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                salePaid
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                saleRemaining
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                sale.sale_date
                            )}
                        </td>

                    `;


                    reportSalesBody.appendChild(
                        row
                    );

                }
            );

        }


        updatePrintDateRange();


        reportMessage.textContent =
            `گزارش ${sales.length} فاکتور فروش نمایش داده شد.`;

    } catch (error) {

        console.error(
            'Sales Report Error:',
            error
        );


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت گزارش فروش';

    }

}


/* =========================
   نمایش گزارش
========================= */

generateReportBtn.addEventListener(
    'click',
    () => {

        loadSalesReport();

    }
);


/* =========================
   امروز
========================= */

todayBtn.addEventListener(
    'click',
    () => {

        const today =
            getTodayString();


        fromDate.value =
            today;

        toDate.value =
            today;


        loadSalesReport();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    () => {

        setThisMonth();

        loadSalesReport();

    }
);


/* =========================
   همه
========================= */

clearDateBtn.addEventListener(
    'click',
    () => {

        fromDate.value =
            '';

        toDate.value =
            '';


        loadSalesReport();

    }
);


/* =========================
   چاپ
========================= */

printReportBtn.addEventListener(
    'click',
    () => {

        updatePrintDateRange();

        window.print();

    }
);


/* =========================
   شروع صفحه
========================= */

loadSalesReport();