/* =========================
   عناصر صفحه
========================= */

const fromDate =
    document.getElementById(
        'fromDate'
    );

const toDate =
    document.getElementById(
        'toDate'
    );

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


const totalPurchases =
    document.getElementById(
        'totalPurchases'
    );

const totalPaid =
    document.getElementById(
        'totalPaid'
    );

const totalRemaining =
    document.getElementById(
        'totalRemaining'
    );

const purchasesCount =
    document.getElementById(
        'purchasesCount'
    );

const reportPurchasesBody =
    document.getElementById(
        'reportPurchasesBody'
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
   تاریخ امروز
========================= */

function getTodayString() {

    const today =
        new Date();


    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, '0')}-${String(
        today.getDate()
    ).padStart(2, '0')}`;

}


/* =========================
   این ماه
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
            'همه خریدها';

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


    printDateRange.textContent =
        `تا ${toDate.value}`;

}


/* =========================
   دریافت گزارش خرید
========================= */

async function loadPurchasesReport() {

    try {

        reportMessage.textContent =
            'در حال دریافت گزارش خرید...';


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
                'دریافت گزارش خرید انجام نشد'
            );

        }


        const data =
            result.data || {};


        const purchases =
            data.purchases || [];


        /* =========================
           محاسبه مجموع‌ها
        ========================== */

        let total =
            0;

        let paid =
            0;

        let remaining =
            0;


        purchases.forEach(
            purchase => {

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

            }
        );


        /* =========================
           نمایش کارت‌ها
        ========================== */

        totalPurchases.textContent =
            formatMoney(
                total
            ) + ' افغانی';


        totalPaid.textContent =
            formatMoney(
                paid
            ) + ' افغانی';


        totalRemaining.textContent =
            formatMoney(
                remaining
            ) + ' افغانی';


        purchasesCount.textContent =
            purchases.length;


        /* =========================
           جدول
        ========================== */

        reportPurchasesBody.innerHTML =
            '';


        if (
            purchases.length === 0
        ) {

            reportPurchasesBody.innerHTML = `

                <tr>

                    <td colspan="6">
                        در این بازه خریدی ثبت نشده است
                    </td>

                </tr>

            `;

        } else {

            purchases.forEach(
                purchase => {

                    const row =
                        document.createElement(
                            'tr'
                        );


                    row.innerHTML = `

                        <td>
                            ${
                                purchase.invoice_number ||
                                '-'
                            }
                        </td>

                        <td>
                            ${
                                purchase.supplier_name ||
                                'شرکت متفرقه'
                            }
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

                    `;


                    reportPurchasesBody.appendChild(
                        row
                    );

                }
            );

        }


        updatePrintDateRange();


        reportMessage.textContent =
            `گزارش ${purchases.length} خرید نمایش داده شد.`;

    } catch (error) {

        console.error(
            'Purchases Report Error:',
            error
        );


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت گزارش خرید';

    }

}


/* =========================
   نمایش گزارش
========================= */

generateReportBtn.addEventListener(
    'click',
    () => {

        loadPurchasesReport();

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


        loadPurchasesReport();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    () => {

        setThisMonth();

        loadPurchasesReport();

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


        loadPurchasesReport();

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
   شروع
========================= */

loadPurchasesReport();