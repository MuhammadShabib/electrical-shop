/* =========================
   دریافت ID مشتری
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const customerId =
    params.get('id');


/* =========================
   عناصر صفحه
========================= */

const customerName =
    document.getElementById(
        'customerName'
    );

const customerPhone =
    document.getElementById(
        'customerPhone'
    );

const customerAddress =
    document.getElementById(
        'customerAddress'
    );

const accountStatus =
    document.getElementById(
        'accountStatus'
    );

const openingBalance =
    document.getElementById(
        'openingBalance'
    );

const totalDebit =
    document.getElementById(
        'totalDebit'
    );

const totalCredit =
    document.getElementById(
        'totalCredit'
    );

const finalBalance =
    document.getElementById(
        'finalBalance'
    );

const transactionsBody =
    document.getElementById(
        'transactionsBody'
    );


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

    const date =
        new Date(value);

    if (Number.isNaN(
        date.getTime()
    )) {
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
   بررسی ID
========================= */

if (!customerId) {

    alert(
        'شناسه مشتری مشخص نیست'
    );

    window.location.href =
        '/customers-list.html';

}


/* =========================
   دریافت گردش حساب
========================= */

async function loadCustomerDetails() {

    try {

        const response =
            await fetch(
                `/api/customers/${customerId}/transactions`
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            alert(
                result.message ||
                'اطلاعات مشتری پیدا نشد'
            );

            return;

        }


        const customer =
            result.data.customer;


        const transactions =
            result.data.transactions || [];


        /* =====================
           اطلاعات مشتری
        ===================== */

        customerName.textContent =
            customer.name || '-';


        customerPhone.textContent =
            customer.phone || '-';


        customerAddress.textContent =
            customer.address || '-';


        /* =====================
           مانده اولیه
        ===================== */

        const opening =
            Number(
                customer.opening_balance
            ) || 0;


        openingBalance.textContent =
            formatMoney(opening);


        /* =====================
           محاسبه گردش
        ===================== */

        let debit = 0;

        let credit = 0;


        transactions.forEach(
            transaction => {

                if (
                    transaction.type ===
                    'debit'
                ) {

                    debit +=
                        Number(
                            transaction.amount
                        ) || 0;

                }

                else if (
                    transaction.type ===
                    'credit'
                ) {

                    credit +=
                        Number(
                            transaction.amount
                        ) || 0;

                }

            }
        );


        /*
         * مانده اولیه را هم در محاسبه
         * حساب مشتری در نظر می‌گیریم.
         */

        const openingType =
            customer.opening_balance_type ||
            'debit';


        if (openingType === 'debit') {

            debit += opening;

        }
        else {

            credit += opening;

        }


        const balance =
            debit - credit;


        totalDebit.textContent =
            formatMoney(debit);


        totalCredit.textContent =
            formatMoney(credit);


        finalBalance.textContent =
            formatMoney(
                Math.abs(balance)
            );


        if (balance > 0) {

            accountStatus.textContent =
                'بدهکار';

        }
        else if (balance < 0) {

            accountStatus.textContent =
                'بستانکار';

        }
        else {

            accountStatus.textContent =
                'تسویه';

        }


        /* =====================
           نمایش تراکنش‌ها
        ===================== */

        transactionsBody.innerHTML = '';


        if (transactions.length === 0) {

            transactionsBody.innerHTML = `

                <tr>

                    <td colspan="7">
                        هنوز تراکنشی برای این مشتری ثبت نشده است
                    </td>

                </tr>

            `;

            return;

        }


        let runningBalance = 0;


        if (openingType === 'debit') {

            runningBalance =
                opening;

        }
        else {

            runningBalance =
                -opening;

        }


        transactions.forEach(
            (transaction, index) => {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                let debitAmount = 0;

                let creditAmount = 0;


                if (
                    transaction.type ===
                    'debit'
                ) {

                    debitAmount =
                        amount;

                    runningBalance +=
                        amount;

                }
                else {

                    creditAmount =
                        amount;

                    runningBalance -=
                        amount;

                }


                let typeText =
                    'نامشخص';


                if (
                    transaction.type ===
                    'debit'
                ) {

                    typeText =
                        'بدهکار';

                }
                else if (
                    transaction.type ===
                    'credit'
                ) {

                    typeText =
                        'بستانکار';

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
                        ${formatDate(
                            transaction.created_at
                        )}
                    </td>

                    <td>
                        ${typeText}
                    </td>

                    <td>
                        ${
                            transaction.description ||
                            '-'
                        }
                    </td>

                    <td>
                        ${formatMoney(
                            debitAmount
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            creditAmount
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            Math.abs(
                                runningBalance
                            )
                        )}
                    </td>

                `;


                transactionsBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(error);


        transactionsBody.innerHTML = `

            <tr>

                <td colspan="7">
                    ارتباط با سرور برقرار نشد
                </td>

            </tr>

        `;

    }

}


/* =========================
   شروع
========================= */

loadCustomerDetails();