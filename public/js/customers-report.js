let customers = [];

let customerTransactions = [];


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

const reportMessage =
    document.getElementById(
        'reportMessage'
    );

const customersReportBody =
    document.getElementById(
        'customersReportBody'
    );

const customerCount =
    document.getElementById(
        'customerCount'
    );

const totalDebit =
    document.getElementById(
        'totalDebit'
    );

const totalCredit =
    document.getElementById(
        'totalCredit'
    );

const totalBalance =
    document.getElementById(
        'totalBalance'
    );

const transactionCount =
    document.getElementById(
        'transactionCount'
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
   تاریخ
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


function getDatePart(value) {

    if (!value) {
        return '';
    }

    const text =
        String(value);

    const match =
        text.match(
            /\d{4}-\d{2}-\d{2}/
        );

    if (match) {
        return match[0];
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '';

    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-${day}`;

}


/* =========================
   تاریخ‌های میانبر
========================= */

function getTodayDate() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-${day}`;

}


function getFirstDayOfMonth() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-01`;

}


function getLastDayOfMonth() {

    const now =
        new Date();

    const date =
        new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-${day}`;

}


/* =========================
   بررسی بازه
========================= */

function isInRange(
    value,
    from,
    to
) {

    const datePart =
        getDatePart(value);

    if (!datePart) {
        return false;
    }

    if (
        from &&
        datePart < from
    ) {

        return false;

    }

    if (
        to &&
        datePart > to
    ) {

        return false;

    }

    return true;

}


/* =========================
   محدوده چاپ
========================= */

function updatePrintDateRange() {

    const from =
        fromDate.value;

    const to =
        toDate.value;

    if (!from && !to) {

        printDateRange.textContent =
            'همه معاملات';

        return;

    }

    if (
        from &&
        to
    ) {

        printDateRange.textContent =
            `از ${from} تا ${to}`;

        return;

    }

    if (from) {

        printDateRange.textContent =
            `از ${from}`;

        return;

    }

    printDateRange.textContent =
        `تا ${to}`;

}


/* =========================
   دریافت مشتریان
========================= */

async function loadCustomers() {

    const response =
        await fetch(
            '/api/customers'
        );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت مشتریان انجام نشد'
        );

    }

    return result.data || [];

}


/* =========================
   دریافت معاملات مشتری
========================= */

async function loadCustomerTransactions(
    customerId
) {

    const response =
        await fetch(
            `/api/customers/${customerId}/transactions`
        );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت معاملات مشتری انجام نشد'
        );

    }

    return result.data || [];

}


/* =========================
   دریافت تمام اطلاعات
========================= */

async function loadReportData() {

    try {

        reportMessage.textContent =
            'در حال دریافت اطلاعات...';

        customers =
            await loadCustomers();

        customerTransactions = [];


        const requests =
            customers.map(
                async customer => {

                    const transactions =
                        await loadCustomerTransactions(
                            customer.id
                        );

                    return {
                        customer,
                        transactions
                    };

                }
            );


        const results =
            await Promise.all(
                requests
            );


        results.forEach(
            result => {

                customerTransactions.push(
                    ...result.transactions.map(
                        transaction => ({
                            ...transaction,
                            customer_id:
                                result.customer.id
                        })
                    )
                );

            }
        );


        reportMessage.textContent = '';

        generateReport();

    } catch (error) {

        console.error(error);

        reportMessage.textContent =
            error.message ||
            'خطا در دریافت اطلاعات مشتریان';

        customersReportBody.innerHTML = `
            <tr>
                <td colspan="8">
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


/* =========================
   ساخت گزارش
========================= */

function generateReport() {

    const from =
        fromDate.value;

    const to =
        toDate.value;


    if (
        from &&
        to &&
        from > to
    ) {

        reportMessage.textContent =
            'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد';

        return;

    }


    reportMessage.textContent = '';

    updatePrintDateRange();


    const reportRows =
        customers.map(
            customer => {

                const transactions =
                    customerTransactions.filter(
                        transaction =>
                            Number(
                                transaction.customer_id
                            ) ===
                            Number(
                                customer.id
                            )
                    );


                let openingDebit = 0;
                let openingCredit = 0;

                let debit = 0;
                let credit = 0;

                let count = 0;


                /* =========================
                   مانده قبل از بازه
                ========================= */

                if (from) {

                    transactions.forEach(
                        transaction => {

                            const datePart =
                                getDatePart(
                                    transaction.transaction_date
                                );

                            if (
                                !datePart ||
                                datePart >= from
                            ) {

                                return;

                            }

                            const amount =
                                Number(
                                    transaction.amount
                                ) || 0;


                            if (
                                transaction.type ===
                                'debit'
                            ) {

                                openingDebit +=
                                    amount;

                            }


                            if (
                                transaction.type ===
                                'credit'
                            ) {

                                openingCredit +=
                                    amount;

                            }

                        }
                    );

                }


                /* =========================
                   معاملات بازه
                ========================= */

                transactions.forEach(
                    transaction => {

                        if (
                            !isInRange(
                                transaction.transaction_date,
                                from,
                                to
                            )
                        ) {

                            return;

                        }


                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;


                        count++;


                        if (
                            transaction.type ===
                            'debit'
                        ) {

                            debit +=
                                amount;

                        }


                        if (
                            transaction.type ===
                            'credit'
                        ) {

                            credit +=
                                amount;

                        }

                    }
                );


                const openingBalance =
                    openingCredit -
                    openingDebit;


                const periodBalance =
                    credit -
                    debit;


                const closingBalance =
                    openingBalance +
                    periodBalance;


                return {

                    customer,

                    openingBalance,

                    debit,

                    credit,

                    closingBalance,

                    count

                };

            }
        );


    /* =========================
       خلاصه کل
    ========================= */

    let grandDebit = 0;
    let grandCredit = 0;
    let grandBalance = 0;
    let grandTransactions = 0;

    let activeCustomerCount = 0;


    reportRows.forEach(
        row => {

            grandDebit +=
                row.debit;

            grandCredit +=
                row.credit;

            grandBalance +=
                row.closingBalance;

            grandTransactions +=
                row.count;


            if (
                row.count > 0 ||
                row.closingBalance !== 0
            ) {

                activeCustomerCount++;

            }

        }
    );


    customerCount.textContent =
        activeCustomerCount;

    totalDebit.textContent =
        formatMoney(grandDebit);

    totalCredit.textContent =
        formatMoney(grandCredit);

    totalBalance.textContent =
        formatMoney(grandBalance);

    transactionCount.textContent =
        grandTransactions;


    /* =========================
       جدول
    ========================= */

    customersReportBody.innerHTML =
        '';


    const visibleRows =
        reportRows.filter(
            row =>
                row.count > 0 ||
                row.closingBalance !== 0
        );


    if (
        visibleRows.length === 0
    ) {

        customersReportBody.innerHTML = `
            <tr>
                <td colspan="8">
                    در این بازه معامله‌ای برای مشتریان ثبت نشده است
                </td>
            </tr>
        `;

        return;

    }


    visibleRows.forEach(
        (row, index) => {

            const balance =
                row.closingBalance;


            let balanceText =
                formatMoney(
                    Math.abs(balance)
                );


            let status =
                '-';


            if (balance > 0) {

                status =
                    'بستانکار';

            }


            if (balance < 0) {

                status =
                    'بدهکار';

            }


            if (balance === 0) {

                balanceText =
                    '0';

                status =
                    'تسویه';

            }


            const customerName =
                `${row.customer.first_name || ''} ${
                    row.customer.last_name || ''
                }`.trim();


            const rowElement =
                document.createElement(
                    'tr'
                );


            rowElement.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${customerName || '-'}
                </td>

                <td>
                    ${row.customer.phone || '-'}
                </td>

                <td>
                    ${formatMoney(row.debit)}
                </td>

                <td>
                    ${formatMoney(row.credit)}
                </td>

                <td>
                    ${balanceText}
                </td>

                <td>
                    ${status}
                </td>

                <td>
                    ${row.count}
                </td>

            `;


            customersReportBody.appendChild(
                rowElement
            );

        }
    );

}


/* =========================
   دکمه‌ها
========================= */

generateReportBtn.addEventListener(
    'click',
    generateReport
);


todayBtn.addEventListener(
    'click',
    function () {

        const today =
            getTodayDate();

        fromDate.value =
            today;

        toDate.value =
            today;

        generateReport();

    }
);


thisMonthBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            getFirstDayOfMonth();

        toDate.value =
            getLastDayOfMonth();

        generateReport();

    }
);


clearDateBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            '';

        toDate.value =
            '';

        generateReport();

    }
);


printReportBtn.addEventListener(
    'click',
    function () {

        updatePrintDateRange();

        window.print();

    }
);


/* =========================
   شروع
========================= */

async function initCustomerReport() {

    while (
        !window.systemSettings
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    50
                )
        );

    }


    await loadReportData();

}


initCustomerReport();