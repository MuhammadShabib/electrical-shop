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


const totalReturns =
    document.getElementById(
        'totalReturns'
    );

const totalRefund =
    document.getElementById(
        'totalRefund'
    );

const returnsCount =
    document.getElementById(
        'returnsCount'
    );


const reportReturnsBody =
    document.getElementById(
        'reportReturnsBody'
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
            'همه برگشت‌های فروش';

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
   دریافت گزارش
========================= */

async function loadSaleReturnsReport() {

    try {

        reportMessage.textContent =
            'در حال دریافت گزارش برگشت فروش...';


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
                'دریافت گزارش برگشت فروش انجام نشد'
            );

        }


        const data =
            result.data || {};


        const returns =
            data.sale_returns || [];


        /* =========================
           محاسبه مجموع
        ========================== */

        let total =
            0;

        let refund =
            0;


        returns.forEach(
            item => {

                total +=
                    Number(
                        item.total_amount
                    ) || 0;


                refund +=
                    Number(
                        item.refund_amount
                    ) || 0;

            }
        );


        /* =========================
           نمایش خلاصه
        ========================== */

        totalReturns.textContent =
            formatMoney(
                total
            ) + ' افغانی';


        totalRefund.textContent =
            formatMoney(
                refund
            ) + ' افغانی';


        returnsCount.textContent =
            returns.length;


        /* =========================
           نمایش جدول
        ========================== */

        reportReturnsBody.innerHTML =
            '';


        if (
            returns.length === 0
        ) {

            reportReturnsBody.innerHTML = `

                <tr>

                    <td colspan="5">
                        در این بازه برگشت فروشی ثبت نشده است
                    </td>

                </tr>

            `;

        } else {

            returns.forEach(
                item => {

                    const row =
                        document.createElement(
                            'tr'
                        );


                    row.innerHTML = `

                        <td>
                            ${
                                item.invoice_number ||
                                '-'
                            }
                        </td>

                        <td>
                            ${
                                item.customer_name ||
                                'مشتری متفرقه'
                            }
                        </td>

                        <td>
                            ${formatMoney(
                                item.total_amount
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                item.refund_amount
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                item.return_date
                            )}
                        </td>

                    `;


                    reportReturnsBody.appendChild(
                        row
                    );

                }
            );

        }


        updatePrintDateRange();


        reportMessage.textContent =
            `گزارش ${returns.length} برگشت فروش نمایش داده شد.`;

    } catch (error) {

        console.error(
            'Sale Returns Report Error:',
            error
        );


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت گزارش برگشت فروش';

    }

}


/* =========================
   نمایش گزارش
========================= */

generateReportBtn.addEventListener(
    'click',
    () => {

        loadSaleReturnsReport();

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


        loadSaleReturnsReport();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    () => {

        setThisMonth();

        loadSaleReturnsReport();

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


        loadSaleReturnsReport();

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

loadSaleReturnsReport();