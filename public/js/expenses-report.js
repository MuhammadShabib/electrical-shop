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


const totalExpenses =
    document.getElementById(
        'totalExpenses'
    );

const expensesCount =
    document.getElementById(
        'expensesCount'
    );

const reportExpensesBody =
    document.getElementById(
        'reportExpensesBody'
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
   همه مصارف
========================= */

let allExpenses = [];


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
   تاریخ به صورت YYYY-MM-DD
========================= */

function getDatePart(value) {

    if (!value) {

        return '';

    }


    return String(value)
        .substring(0, 10);

}


/* =========================
   بررسی بازه تاریخ
========================= */

function isDateInRange(
    expenseDate
) {

    const date =
        getDatePart(
            expenseDate
        );


    if (!date) {

        return false;

    }


    if (
        fromDate.value &&
        date < fromDate.value
    ) {

        return false;

    }


    if (
        toDate.value &&
        date > toDate.value
    ) {

        return false;

    }


    return true;

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
            'همه مصارف';

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
   دریافت همه مصارف
========================= */

async function loadExpenses() {

    try {

        reportMessage.textContent =
            'در حال دریافت مصارف...';


        const response =
            await fetch(
                '/api/expenses'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت مصارف انجام نشد'
            );

        }


        allExpenses =
            result.data || [];


        renderReport();


    } catch (error) {

        console.error(
            'Expenses Report Error:',
            error
        );


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت مصارف';


        reportExpensesBody.innerHTML = `

            <tr>

                <td colspan="5">
                    ${
                        error.message ||
                        'خطا در دریافت مصارف'
                    }
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش گزارش
========================= */

function renderReport() {

    const filteredExpenses =
        allExpenses.filter(
            expense =>
                isDateInRange(
                    expense.expense_date
                )
        );


    let total =
        0;


    filteredExpenses.forEach(
        expense => {

            total +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    /* =========================
       کارت‌ها
    ========================== */

    totalExpenses.textContent =
        formatMoney(
            total
        ) + ' افغانی';


    expensesCount.textContent =
        filteredExpenses.length;


    /* =========================
       جدول
    ========================== */

    reportExpensesBody.innerHTML =
        '';


    if (
        filteredExpenses.length === 0
    ) {

        reportExpensesBody.innerHTML = `

            <tr>

                <td colspan="5">
                    در این بازه هزینه‌ای ثبت نشده است
                </td>

            </tr>

        `;

    } else {

        filteredExpenses.forEach(
            (expense, index) => {

                const row =
                    document.createElement(
                        'tr'
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${
                            expense.title ||
                            '-'
                        }
                    </td>

                    <td>
                        ${formatMoney(
                            expense.amount
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            expense.expense_date
                        )}
                    </td>

                    <td>
                        ${
                            expense.description ||
                            '-'
                        }
                    </td>

                `;


                reportExpensesBody.appendChild(
                    row
                );

            }
        );

    }


    updatePrintDateRange();


    reportMessage.textContent =
        `گزارش ${filteredExpenses.length} هزینه نمایش داده شد.`;

}


/* =========================
   نمایش گزارش
========================= */

generateReportBtn.addEventListener(
    'click',
    () => {

        renderReport();

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


        renderReport();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    () => {

        setThisMonth();

        renderReport();

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


        renderReport();

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

loadExpenses();