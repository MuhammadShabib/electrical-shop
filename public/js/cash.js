let cashTransactions = [];


/* =========================
   عناصر صفحه
========================= */

const cashBalance =
    document.getElementById('cashBalance');

const totalSales =
    document.getElementById('totalSales');

const totalCustomerPayments =
    document.getElementById('totalCustomerPayments');

const totalSupplierPayments =
    document.getElementById('totalSupplierPayments');

const totalPurchases =
    document.getElementById('totalPurchases');

const totalExpenses =
    document.getElementById('totalExpenses');

const totalWithdrawals =
    document.getElementById('totalWithdrawals');

const tableBody =
    document.getElementById(
        'cashTransactionsBody'
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
   نوع تراکنش
========================= */

function getTypeText(type) {

    const types = {

        sale:
            'فروش',

        customer_payment:
            'دریافت از مشتری',

        purchase:
            'خرید',

        supplier_payment:
            'پرداخت به شرکت',

        expense:
            'هزینه',

        withdrawal:
            'برداشت',

        other:
            'سایر'

    };


    return types[type] || type || '-';

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


/* =========================
   دریافت تراکنش‌های صندوق
========================= */

async function loadCashTransactions() {

    try {

        const response =
            await fetch(
                '/api/cash-transactions'
            );


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


        cashTransactions =
            result.data || [];


        renderCash();


    } catch (error) {

        console.error(error);


        tableBody.innerHTML = `

            <tr>

                <td colspan="5">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش صندوق
========================= */

function renderCash() {

    tableBody.innerHTML = '';


    let balance = 0;

    let sales = 0;

    let customerPayments = 0;

    let supplierPayments = 0;

    let purchases = 0;

    let expenses = 0;

    let withdrawals = 0;


    cashTransactions.forEach(
        (transaction, index) => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            /*
             * ورود پول به صندوق
             */

            if (
                transaction.type === 'sale' ||
                transaction.type === 'customer_payment'
            ) {

                balance += amount;

            }


            /*
             * خروج پول از صندوق
             */

            if (
                transaction.type === 'purchase' ||
                transaction.type === 'supplier_payment' ||
                transaction.type === 'expense' ||
                transaction.type === 'withdrawal' ||
                transaction.type === 'sale_return'
            ) {

                balance -= amount;

            }


            if (
                transaction.type === 'sale'
            ) {

                sales += amount;

            }


            if (
                transaction.type ===
                'customer_payment'
            ) {

                customerPayments += amount;

            }


            if (
                transaction.type ===
                'supplier_payment'
            ) {

                supplierPayments += amount;

            }


            if (
                transaction.type ===
                'purchase'
            ) {

                purchases += amount;

            }


            if (
                transaction.type ===
                'expense'
            ) {

                expenses += amount;

            }


            if (
                transaction.type ===
                'withdrawal'
            ) {

                withdrawals += amount;

            }


            const row =
                document.createElement(
                    'tr'
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${getTypeText(
                        transaction.type
                    )}
                </td>

                <td>
                    ${formatMoney(amount)}
                </td>

                <td>
                    ${
                        transaction.description ||
                        '-'
                    }
                </td>

                <td>
                    ${formatDate(
                        transaction.transaction_date
                    )}
                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    cashBalance.textContent =
        formatMoney(balance);


    totalSales.textContent =
        formatMoney(sales);


    totalCustomerPayments.textContent =
        formatMoney(customerPayments);


    totalSupplierPayments.textContent =
        formatMoney(supplierPayments);


    totalPurchases.textContent =
        formatMoney(purchases);


    totalExpenses.textContent =
        formatMoney(expenses);


    totalWithdrawals.textContent =
        formatMoney(withdrawals);

}


/* =========================
   شروع
========================= */

/* =========================
   شروع
========================= */

async function initCash() {

    /* =========================
       منتظر ماندن برای تنظیمات
    ========================= */

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


    /* =========================
       دریافت و نمایش صندوق
    ========================= */

    await loadCashTransactions();

}


/* =========================
   شروع سیستم صندوق
========================= */

initCash();