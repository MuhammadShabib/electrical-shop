let allCashTransactions = [];
let filteredTransactions = [];


/* =========================
   عناصر صفحه
========================= */

const fromDate =
    document.getElementById('fromDate');

const toDate =
    document.getElementById('toDate');

const generateReportBtn =
    document.getElementById('generateReportBtn');

const todayBtn =
    document.getElementById('todayBtn');

const thisMonthBtn =
    document.getElementById('thisMonthBtn');

const clearDateBtn =
    document.getElementById('clearDateBtn');

const printReportBtn =
    document.getElementById('printReportBtn');

const reportMessage =
    document.getElementById('reportMessage');

const cashReportBody =
    document.getElementById('cashReportBody');

const openingBalance =
    document.getElementById('openingBalance');

const totalInflow =
    document.getElementById('totalInflow');

const totalOutflow =
    document.getElementById('totalOutflow');

const netChange =
    document.getElementById('netChange');

const closingBalance =
    document.getElementById('closingBalance');

const totalSales =
    document.getElementById('totalSales');

const totalCustomerPayments =
    document.getElementById('totalCustomerPayments');

const totalPurchases =
    document.getElementById('totalPurchases');

const totalSupplierPayments =
    document.getElementById('totalSupplierPayments');

const totalExpenses =
    document.getElementById('totalExpenses');

const totalWithdrawals =
    document.getElementById('totalWithdrawals');

const totalSaleReturns =
    document.getElementById('totalSaleReturns');

const transactionCount =
    document.getElementById('transactionCount');

const printDateRange =
    document.getElementById('printDateRange');


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
                Number(settings.decimal_places) || 0
            )
        );

    if (settings.amount_format === 'plain') {

        return number.toFixed(decimals);

    }

    return number.toLocaleString(
        'en-US',
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    );

}


/* =========================
   نوع تراکنش
========================= */

function getTypeText(type) {

    const types = {
        sale: 'فروش',
        customer_payment: 'دریافت از مشتری',
        purchase: 'خرید',
        supplier_payment: 'پرداخت به شرکت',
        expense: 'هزینه',
        withdrawal: 'برداشت',
        sale_return: 'برگشت فروش',
        other: 'سایر'
    };

    return types[type] || type || '-';

}


/* =========================
   تشخیص ورود / خروج
========================= */

function isCashIn(type) {

    return (
        type === 'sale' ||
        type === 'customer_payment'
    );

}


function isCashOut(type) {

    return (
        type === 'purchase' ||
        type === 'supplier_payment' ||
        type === 'expense' ||
        type === 'withdrawal' ||
        type === 'sale_return'
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

    if (Number.isNaN(date.getTime())) {
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

    const text = String(value);
    const match = text.match(/\d{4}-\d{2}-\d{2}/);

    if (match) {
        return match[0];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

}


function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

}


function getFirstDayOfMonth() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}-01`;

}


function getLastDayOfMonth() {

    const now = new Date();

    const lastDay =
        new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        );

    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

}


function isInRange(dateValue, from, to) {

    const datePart =
        getDatePart(dateValue);

    if (!datePart) {
        return false;
    }

    if (from && datePart < from) {
        return false;
    }

    if (to && datePart > to) {
        return false;
    }

    return true;

}


/* =========================
   محدوده چاپ
========================= */

function updatePrintDateRange() {

    const from = fromDate.value;
    const to = toDate.value;

    if (!from && !to) {
        printDateRange.textContent = 'همه تراکنش‌ها';
        return;
    }

    if (from && to) {
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
   دریافت تراکنش‌ها
========================= */

async function loadCashTransactions() {

    try {

        const response =
            await fetch('/api/cash-transactions');

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                'خطا در دریافت تراکنش‌های صندوق'
            );
        }

        allCashTransactions =
            result.data || [];

        generateReport();

    } catch (error) {

        console.error(error);

        cashReportBody.innerHTML = `
            <tr>
                <td colspan="7">
                    ${error.message}
                </td>
            </tr>
        `;

        reportMessage.textContent =
            error.message ||
            'خطا در دریافت اطلاعات';

    }

}


/* =========================
   ساخت گزارش
========================= */

function generateReport() {

    const from = fromDate.value;
    const to = toDate.value;

    if (from && to && from > to) {

        reportMessage.textContent =
            'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد';

        return;

    }

    reportMessage.textContent = '';

    updatePrintDateRange();

    filteredTransactions =
        allCashTransactions.filter(
            transaction =>
                isInRange(
                    transaction.transaction_date,
                    from,
                    to
                )
        );

    renderReport(from, to);

}


/* =========================
   نمایش گزارش
========================= */

function renderReport(from, to) {

    let opening = 0;
    let inflow = 0;
    let outflow = 0;

    let sales = 0;
    let customerPayments = 0;
    let purchases = 0;
    let supplierPayments = 0;
    let expenses = 0;
    let withdrawals = 0;
    let saleReturns = 0;


    /* =========================
       موجودی اول بازه
    ========================= */

    if (from) {

        allCashTransactions.forEach(
            transaction => {

                const datePart =
                    getDatePart(
                        transaction.transaction_date
                    );

                if (!datePart || datePart >= from) {
                    return;
                }

                const amount =
                    Number(transaction.amount) || 0;

                if (isCashIn(transaction.type)) {
                    opening += amount;
                }

                if (isCashOut(transaction.type)) {
                    opening -= amount;
                }

            }
        );

    }


    /* =========================
       محاسبه تراکنش‌های بازه
    ========================= */

    filteredTransactions.forEach(
        transaction => {

            const amount =
                Number(transaction.amount) || 0;

            if (isCashIn(transaction.type)) {

                inflow += amount;

            }

            if (isCashOut(transaction.type)) {

                outflow += amount;

            }

            switch (transaction.type) {

                case 'sale':
                    sales += amount;
                    break;

                case 'customer_payment':
                    customerPayments += amount;
                    break;

                case 'purchase':
                    purchases += amount;
                    break;

                case 'supplier_payment':
                    supplierPayments += amount;
                    break;

                case 'expense':
                    expenses += amount;
                    break;

                case 'withdrawal':
                    withdrawals += amount;
                    break;

                case 'sale_return':
                    saleReturns += amount;
                    break;

            }

        }
    );


    const change =
        inflow - outflow;

    const closing =
        opening + change;


    openingBalance.textContent =
        formatMoney(opening);

    totalInflow.textContent =
        formatMoney(inflow);

    totalOutflow.textContent =
        formatMoney(outflow);

    netChange.textContent =
        formatMoney(change);

    closingBalance.textContent =
        formatMoney(closing);

    totalSales.textContent =
        formatMoney(sales);

    totalCustomerPayments.textContent =
        formatMoney(customerPayments);

    totalPurchases.textContent =
        formatMoney(purchases);

    totalSupplierPayments.textContent =
        formatMoney(supplierPayments);

    totalExpenses.textContent =
        formatMoney(expenses);

    totalWithdrawals.textContent =
        formatMoney(withdrawals);

    totalSaleReturns.textContent =
        formatMoney(saleReturns);

    transactionCount.textContent =
        filteredTransactions.length;


    /* =========================
       جدول
    ========================= */

    cashReportBody.innerHTML = '';

    if (filteredTransactions.length === 0) {

        cashReportBody.innerHTML = `
            <tr>
                <td colspan="7">
                    در این بازه تراکنشی ثبت نشده است
                </td>
            </tr>
        `;

        return;

    }


    filteredTransactions.forEach(
        (transaction, index) => {

            const amount =
                Number(transaction.amount) || 0;

            const cashIn =
                isCashIn(transaction.type)
                    ? amount
                    : 0;

            const cashOut =
                isCashOut(transaction.type)
                    ? amount
                    : 0;

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${getTypeText(transaction.type)}</td>
                <td>${formatMoney(amount)}</td>
                <td>${cashIn ? formatMoney(cashIn) : '-'}</td>
                <td>${cashOut ? formatMoney(cashOut) : '-'}</td>
                <td>${transaction.description || '-'}</td>
                <td>${formatDate(transaction.transaction_date)}</td>
            `;

            cashReportBody.appendChild(row);

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

        fromDate.value = today;
        toDate.value = today;

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

        fromDate.value = '';
        toDate.value = '';

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

async function initCashReport() {

    while (!window.systemSettings) {

        await new Promise(
            resolve =>
                setTimeout(resolve, 50)
        );

    }

    await loadCashTransactions();

}


initCashReport();