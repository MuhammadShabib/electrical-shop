const params =
    new URLSearchParams(
        window.location.search
    );

const supplierId =
    params.get('id');


const supplierName =
    document.getElementById(
        'supplierName'
    );

const supplierPhone =
    document.getElementById(
        'supplierPhone'
    );

const balanceAmount =
    document.getElementById(
        'balanceAmount'
    );

const balanceType =
    document.getElementById(
        'balanceType'
    );

const totalPurchases =
    document.getElementById(
        'totalPurchases'
    );

const totalPayments =
    document.getElementById(
        'totalPayments'
    );

const transactionsTableBody =
    document.getElementById(
        'transactionsTableBody'
    );

const addPaymentBtn =
    document.getElementById(
        'addPaymentBtn'
    );


/* =========================
   بررسی شناسه شرکت
========================= */

if (!supplierId) {

    alert(
        'شناسه شرکت مشخص نیست'
    );

}


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


/* =========================
   دریافت حساب شرکت
========================= */

async function loadSupplierAccount() {

    try {

        const response =
            await fetch(
                `/api/suppliers/${supplierId}/account`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت حساب شرکت انجام نشد'
            );

        }


        const data =
            result.data;


        const supplier =
            data.supplier;


        /* =========================
           اطلاعات شرکت
        ========================= */

        supplierName.textContent =
            supplier.name ||
            'حساب شرکت';


        supplierPhone.textContent =
            supplier.phone ||
            'شماره تماس ثبت نشده';


        /* =========================
           خلاصه حساب
        ========================= */

        totalPurchases.textContent =
            formatMoney(
                data.total_purchases
            );


        totalPayments.textContent =
            formatMoney(
                data.total_payments
            );


        balanceAmount.textContent =
            formatMoney(
                data.balance
            );


        if (
            Number(data.balance) > 0
        ) {

            balanceType.textContent =
                'بدهکار به شرکت';

        }

        else {

            balanceType.textContent =
                'تسویه';

        }


   


    } catch (error) {

        console.error(error);


        transactionsTableBody.innerHTML = `

            <tr>

                <td colspan="4">

                    ${error.message}

                </td>

            </tr>

        `;

    }

}
/* =========================
   دریافت گردش حساب شرکت
========================= */

async function loadSupplierTransactions() {

    try {

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
                'دریافت گردش حساب انجام نشد'
            );

        }


        const transactions =
            result.data.transactions || [];


        transactionsTableBody.innerHTML =
            '';


        if (transactions.length === 0) {

            transactionsTableBody.innerHTML = `

                <tr>

                    <td colspan="4">

                        هنوز تراکنشی برای این شرکت ثبت نشده است

                    </td>

                </tr>

            `;

            return;

        }


        transactions.forEach(
            transaction => {

                const row =
                    document.createElement('tr');


                const date =
                    new Date(
                        transaction.transaction_date
                    );


                const dateText =
                    date.toLocaleDateString(
                        'fa-IR'
                    );


                row.innerHTML = `

                    <td>
                        ${dateText}
                    </td>

                    <td>
                        ${
                            transaction.description ||
                            '-'
                        }
                    </td>

                    <td>
                        ${
                            Number(
                                transaction.debit
                            ) > 0

                            ? formatMoney(
                                transaction.debit
                              )

                            : '-'
                        }
                    </td>

                    <td>
                        ${
                            Number(
                                transaction.credit
                            ) > 0

                            ? formatMoney(
                                transaction.credit
                              )

                            : '-'
                        }
                    </td>

                `;


                transactionsTableBody
                    .appendChild(row);

            }
        );


    } catch (error) {

        console.error(error);


        transactionsTableBody.innerHTML = `

            <tr>

                <td colspan="4">

                    ${error.message}

                </td>

            </tr>

        `;

    }

}

/* =========================
   ثبت پرداخت
========================= */

addPaymentBtn.addEventListener(
    'click',
    function () {

        window.location.href =
            `/supplier-payment.html?id=${supplierId}`;

    }
);


/* =========================
   بازگشت
========================= */

function goBack() {

    window.location.href =
        '/suppliers.html';

}


/* =========================
   شروع
========================= */

if (supplierId) {

    loadSupplierAccount();

    loadSupplierTransactions();

}