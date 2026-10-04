const withdrawalForm =
    document.getElementById(
        'withdrawalForm'
    );

const amountInput =
    document.getElementById(
        'amount'
    );

const descriptionInput =
    document.getElementById(
        'description'
    );

const cashBalance =
    document.getElementById(
        'cashBalance'
    );

const message =
    document.getElementById(
        'message'
    );


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
   دریافت موجودی صندوق
========================= */

async function loadCashBalance() {

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
                'خطا در دریافت صندوق'
            );

        }


        const transactions =
            result.data || [];


        let balance = 0;


        transactions.forEach(
            transaction => {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                if (
                    transaction.type === 'sale' ||
                    transaction.type === 'customer_payment'
                ) {

                    balance += amount;

                }


                if (
                    transaction.type === 'purchase' ||
                    transaction.type === 'supplier_payment' ||
                    transaction.type === 'expense' ||
                    transaction.type === 'withdrawal'
                ) {

                    balance -= amount;

                }

            }
        );


        cashBalance.textContent =
            formatMoney(balance);


        return balance;


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;

        return 0;

    }

}


/* =========================
   ثبت برداشت
========================= */

withdrawalForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const amount =
            Number(
                amountInput.value
            );


        const description =
            descriptionInput.value.trim();


        if (!amount || amount <= 0) {

            alert(
                'مبلغ برداشت معتبر نیست'
            );

            return;

        }


        const currentBalance =
            await loadCashBalance();


        if (
            amount > currentBalance
        ) {

            alert(
                `موجودی صندوق کافی نیست. موجودی فعلی: ${formatMoney(currentBalance)} افغانی`
            );

            return;

        }


        try {

            message.textContent =
                'در حال ثبت برداشت...';


            const response =
                await fetch(
                    '/api/withdrawals',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({

                                amount,

                                description:
                                    description ||
                                    null

                            })

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    'ثبت برداشت انجام نشد'
                );

            }


            alert(
                'برداشت با موفقیت ثبت شد'
            );


            withdrawalForm.reset();

            message.textContent =
                '';


            await loadCashBalance();


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message ||
                'خطا در ثبت برداشت';

        }

    }
);


/* =========================
   شروع
========================= */

loadCashBalance();