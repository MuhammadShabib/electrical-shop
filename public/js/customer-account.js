const params = new URLSearchParams(window.location.search);

const customerId = params.get('id');


const customerName =
    document.getElementById('customerName');

const customerPhone =
    document.getElementById('customerPhone');

const balanceAmount =
    document.getElementById('balanceAmount');

const balanceType =
    document.getElementById('balanceType');

const totalDebit =
    document.getElementById('totalDebit');

const totalCredit =
    document.getElementById('totalCredit');

const transactionsTableBody =
    document.getElementById('transactionsTableBody');


const addDebitBtn =
    document.getElementById('addDebitBtn');

const addCreditBtn =
    document.getElementById('addCreditBtn');

const returnSaleBtn =
    document.getElementById('returnSaleBtn');

const transactionFormContainer =
    document.getElementById(
        'transactionFormContainer'
    );

const transactionForm =
    document.getElementById('transactionForm');

const transactionType =
    document.getElementById('transactionType');

const transactionAmount =
    document.getElementById('transactionAmount');

const transactionDescription =
    document.getElementById(
        'transactionDescription'
    );

const transactionFormTitle =
    document.getElementById(
        'transactionFormTitle'
    );

const cancelTransactionBtn =
    document.getElementById(
        'cancelTransactionBtn'
    );


/* =========================
   بررسی شناسه مشتری
========================= */

if (!customerId) {

    alert('شناسه مشتری مشخص نیست');

}


/* =========================
   فرمت مبلغ
========================= */

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString('en-US');

}


/* =========================
   دریافت اطلاعات مشتری
========================= */

async function loadCustomer() {

    try {

        const response =
            await fetch(
                `/api/customers/${customerId}`
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        const customer =
            result.data;


        customerName.textContent =
            customer.name;


        customerPhone.textContent =
            customer.phone || 'شماره تماس ثبت نشده';


    } catch (error) {

        console.error(error);

        alert(
            'خطا در دریافت اطلاعات مشتری'
        );

    }

}


/* =========================
   دریافت مانده حساب
========================= */

async function loadBalance() {

    try {

        const response =
            await fetch(
                `/api/customers/${customerId}/balance`
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        const data =
            result.data;


        balanceAmount.textContent =
            formatMoney(data.balance);


        totalDebit.textContent =
            formatMoney(data.total_debit);


        totalCredit.textContent =
            formatMoney(data.total_credit);


        if (data.balance_type === 'debit') {

            balanceType.textContent =
                'بدهکار';

        }

        else if (
            data.balance_type === 'credit'
        ) {

            balanceType.textContent =
                'طلبکار';

        }

        else {

            balanceType.textContent =
                'تسویه';

        }

    } catch (error) {

        console.error(error);

        alert(
            'خطا در دریافت مانده حساب'
        );

    }

}


/* =========================
   دریافت گردش حساب
========================= */

async function loadTransactions() {

    try {

        const response =
            await fetch(
                `/api/customers/${customerId}/transactions`
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        const transactions =
            result.data;


        transactionsTableBody.innerHTML =
            '';


        if (transactions.length === 0) {

            transactionsTableBody.innerHTML = `

                <tr>

                    <td colspan="4">

                        هنوز تراکنشی ثبت نشده است

                    </td>

                </tr>

            `;

            return;

        }


        transactions.forEach(transaction => {

            const row =
                document.createElement('tr');


            const date =
                new Date(
                    transaction.created_at
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
                    ${transaction.description || '-'}
                </td>


                <td>

                    ${
                        transaction.type === 'debit'

                        ? formatMoney(
                            transaction.amount
                          )

                        : '-'
                    }

                </td>


                <td>

                    ${
                        transaction.type === 'credit'

                        ? formatMoney(
                            transaction.amount
                          )

                        : '-'
                    }

                </td>

            `;


            transactionsTableBody
                .appendChild(row);

        });


    } catch (error) {

        console.error(error);

        alert(
            'خطا در دریافت گردش حساب'
        );

    }

}


/* =========================
   باز کردن فرم بدهی
========================= */

addDebitBtn.addEventListener(
    'click',
    () => {

        transactionType.value =
            'debit';


        transactionFormTitle.textContent =
            'ثبت بدهی مشتری';


        transactionFormContainer
            .classList
            .remove('hidden');


        transactionAmount.focus();

    }
);


/* =========================
   باز کردن فرم پرداخت
========================= */

addCreditBtn.addEventListener(
    'click',
    () => {

        transactionType.value =
            'credit';


        transactionFormTitle.textContent =
            'ثبت پرداخت مشتری';


        transactionFormContainer
            .classList
            .remove('hidden');


        transactionAmount.focus();

    }
);

/* =========================
   برگشت دوا از مشتری
========================= */

returnSaleBtn.addEventListener(
    'click',
    () => {

        window.location.href =
            `/sale-return.html?customer_id=${customerId}`;

    }
);

/* =========================
   بستن فرم
========================= */

cancelTransactionBtn.addEventListener(
    'click',
    () => {

        transactionForm.reset();


        transactionFormContainer
            .classList
            .add('hidden');

    }
);


/* =========================
   ثبت تراکنش
========================= */

transactionForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const type =
            transactionType.value;


        const amount =
            Number(
                transactionAmount.value
            );


        const description =
            transactionDescription.value
                .trim();


        if (!amount || amount <= 0) {

            alert(
                'مبلغ باید بیشتر از صفر باشد'
            );

            return;

        }


        try {

          let requestUrl;
let requestBody;


/* =========================
   پرداخت مشتری
========================= */

if (type === 'credit') {

    requestUrl =
        '/api/customer-payments';


    requestBody = {

        customer_id:
            Number(customerId),

        amount,

        payment_method:
            'cash',

        description:
            description || null

    };


}


/* =========================
   ثبت بدهی دستی
========================= */

else {

    requestUrl =
        `/api/customers/${customerId}/transactions`;


    requestBody = {

        type:
            'debit',

        amount,

        description

    };

}


/* =========================
   ارسال درخواست
========================= */

const response =
    await fetch(
        requestUrl,
        {

            method: 'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify(
                    requestBody
                )

        }
    );

            const result =
                await response.json();


            if (!result.success) {

                alert(result.message);

                return;

            }


            alert(
                'تراکنش با موفقیت ثبت شد'
            );


            transactionForm.reset();


            transactionFormContainer
                .classList
                .add('hidden');


            await loadBalance();

            await loadTransactions();


        } catch (error) {

            console.error(error);

            alert(
                'خطا در ثبت تراکنش'
            );

        }

    }
);


/* =========================
   بازگشت
========================= */

function goBack() {

    window.location.href =
        '/customers.html';

}


/* =========================
   شروع صفحه
========================= */

if (customerId) {

    loadCustomer();

    loadBalance();

    loadTransactions();

}