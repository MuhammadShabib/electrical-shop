let suppliers = [];

let supplierAccounts = [];


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


const suppliersReportBody =
    document.getElementById(
        'suppliersReportBody'
    );


const supplierCount =
    document.getElementById(
        'supplierCount'
    );


const totalPurchases =
    document.getElementById(
        'totalPurchases'
    );


const totalPayments =
    document.getElementById(
        'totalPayments'
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
   تاریخ میانبر
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
   فرمت تاریخ برای چاپ
========================= */

function updatePrintDateRange() {

    const from =
        fromDate.value;


    const to =
        toDate.value;


    if (
        !from &&
        !to
    ) {

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
   دریافت فروشندگان
========================= */

async function loadSuppliers() {

    const response =
        await fetch(
            '/api/suppliers'
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت فروشندگان انجام نشد'
        );

    }


    return result.data || [];

}


/* =========================
   دریافت حساب فروشنده
========================= */

async function loadSupplierAccount(
    supplierId
) {

    const response =
        await fetch(
            `/api/suppliers/${supplierId}/transactions`
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            'دریافت حساب فروشنده انجام نشد'
        );

    }


    return result.data || {};

}


/* =========================
   دریافت اطلاعات گزارش
========================= */

async function loadReportData() {

    try {

        reportMessage.textContent =
            'در حال دریافت اطلاعات...';


        suppliers =
            await loadSuppliers();


        supplierAccounts = [];


        const requests =
            suppliers.map(
                async supplier => {

                    const account =
                        await loadSupplierAccount(
                            supplier.id
                        );


                    return {
                        supplier,
                        account
                    };

                }
            );


        const results =
            await Promise.all(
                requests
            );


        results.forEach(
            result => {

                supplierAccounts.push(
                    result
                );

            }
        );


        reportMessage.textContent =
            '';


        generateReport();


    } catch (error) {

        console.error(error);


        reportMessage.textContent =
            error.message ||
            'خطا در دریافت اطلاعات';


        suppliersReportBody.innerHTML = `

            <tr>

                <td colspan="9">
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


    reportMessage.textContent =
        '';


    updatePrintDateRange();


    const reportRows =
        supplierAccounts.map(
            item => {

                const supplier =
                    item.supplier;


                const account =
                    item.account;


                const transactions =
                    account.transactions || [];


                const opening =
                    Number(
                        supplier.opening_balance
                    ) || 0;


                let openingBalance =
                    opening;


                let purchases =
                    0;


                let payments =
                    0;


                let count =
                    0;


                /* =========================
                   معاملات قبل از بازه
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


                            const debit =
                                Number(
                                    transaction.debit
                                ) || 0;


                            const credit =
                                Number(
                                    transaction.credit
                                ) || 0;


                            openingBalance +=
                                debit -
                                credit;

                        }
                    );

                }


                /* =========================
                   معاملات داخل بازه
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


                        const debit =
                            Number(
                                transaction.debit
                            ) || 0;


                        const credit =
                            Number(
                                transaction.credit
                            ) || 0;


                        purchases +=
                            debit;


                        payments +=
                            credit;


                        count++;

                    }
                );


                const balance =
                    openingBalance +
                    purchases -
                    payments;


                return {

                    supplier,

                    openingBalance,

                    purchases,

                    payments,

                    balance,

                    count

                };

            }
        );


    /* =========================
       خلاصه کل
    ========================= */

    let grandPurchases =
        0;


    let grandPayments =
        0;


    let grandBalance =
        0;


    let grandTransactions =
        0;


    let visibleSupplierCount =
        0;


    reportRows.forEach(
        row => {

            grandPurchases +=
                row.purchases;


            grandPayments +=
                row.payments;


            grandBalance +=
                row.balance;


            grandTransactions +=
                row.count;


            if (
                row.count > 0 ||
                row.balance !== 0
            ) {

                visibleSupplierCount++;

            }

        }
    );


    supplierCount.textContent =
        visibleSupplierCount;


    totalPurchases.textContent =
        formatMoney(
            grandPurchases
        );


    totalPayments.textContent =
        formatMoney(
            grandPayments
        );


    totalBalance.textContent =
        formatMoney(
            grandBalance
        );


    transactionCount.textContent =
        grandTransactions;


    /* =========================
       جدول
    ========================= */

    suppliersReportBody.innerHTML =
        '';


    const visibleRows =
        reportRows.filter(
            row =>
                row.count > 0 ||
                row.balance !== 0
        );


    if (
        visibleRows.length === 0
    ) {

        suppliersReportBody.innerHTML = `

            <tr>

                <td colspan="9">

                    در این بازه معامله‌ای برای فروشندگان ثبت نشده است

                </td>

            </tr>

        `;

        return;

    }


    visibleRows.forEach(
        (row, index) => {

            let balanceText =
                formatMoney(
                    Math.abs(
                        row.balance
                    )
                );


            let status =
                'تسویه';


            if (
                row.balance > 0
            ) {

                status =
                    'بدهکار';

            }


            if (
                row.balance < 0
            ) {

                status =
                    'بستانکار';

            }


            if (
                row.balance === 0
            ) {

                balanceText =
                    '0';

            }


            const tableRow =
                document.createElement(
                    'tr'
                );


            tableRow.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${row.supplier.name || '-'}
                </td>

                <td>
                    ${row.supplier.phone || '-'}
                </td>

                <td>
                    ${formatMoney(
                        row.openingBalance
                    )}
                </td>

                <td>
                    ${formatMoney(
                        row.purchases
                    )}
                </td>

                <td>
                    ${formatMoney(
                        row.payments
                    )}
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


            suppliersReportBody.appendChild(
                tableRow
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

async function initSupplierReport() {

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


initSupplierReport();