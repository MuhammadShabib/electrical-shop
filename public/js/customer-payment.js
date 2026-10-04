const customerSelect =
    document.getElementById('customer');

const amountInput =
    document.getElementById('amount');

const paymentMethod =
    document.getElementById('paymentMethod');

const descriptionInput =
    document.getElementById('description');

const balanceAmount =
    document.getElementById('balanceAmount');

const paymentForm =
    document.getElementById('paymentForm');

const message =
    document.getElementById('message');


let customers = [];


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
   دریافت مشتریان
========================= */

async function loadCustomers() {

    try {

        const response =
            await fetch('/api/customers');

        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            throw new Error(
                result.message ||
                'خطا در دریافت مشتریان'
            );

        }


        customers =
            result.data || [];


        customerSelect.innerHTML = `
            <option value="">
                انتخاب مشتری
            </option>
        `;


        customers.forEach(customer => {

            const option =
                document.createElement('option');

            option.value =
                customer.id;

            option.textContent =
                customer.name +
                (
                    customer.phone
                        ? ` - ${customer.phone}`
                        : ''
                );

            customerSelect.appendChild(
                option
            );

        });


    } catch (error) {

        console.error(error);

        customerSelect.innerHTML = `
            <option value="">
                خطا در دریافت مشتریان
            </option>
        `;

        message.textContent =
            'ارتباط با سرور برقرار نشد';

    }

}


/* =========================
   نمایش مانده مشتری
========================= */

customerSelect.addEventListener(
    'change',
    function () {

        const customer =
            customers.find(
                item =>
                    Number(item.id) ===
                    Number(this.value)
            );


        if (!customer) {

            balanceAmount.textContent =
                '0';

            return;

        }


        const debit =
            Number(customer.debit) || 0;

        const credit =
            Number(customer.credit) || 0;

        const balance =
            debit - credit;


        balanceAmount.textContent =
            formatMoney(
                Math.abs(balance)
            );

    }
);


/* =========================
   ثبت پرداخت
========================= */

paymentForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const customerId =
            customerSelect.value;

        const amount =
            Number(amountInput.value);

        const method =
            paymentMethod.value;

        const description =
            descriptionInput.value.trim();


        if (!customerId) {

            alert(
                'لطفاً مشتری را انتخاب کنید'
            );

            return;

        }


        if (!amount || amount <= 0) {

            alert(
                'مبلغ پرداختی را درست وارد کنید'
            );

            return;

        }


        try {

            message.textContent =
                'در حال ثبت پرداخت...';


            /*
             * فعلاً درخواست را به API
             * پرداخت مشتری می‌فرستیم.
             */

            const response =
                await fetch(
                    '/api/customer-payments',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({

                            customer_id:
                                Number(customerId),

                            amount:
                                amount,

                            payment_method:
                                method,

                            description:
                                description || null

                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok ||
                !result.success) {

                throw new Error(
                    result.message ||
                    'ثبت پرداخت انجام نشد'
                );

            }


            alert(
                'پرداخت با موفقیت ثبت شد'
            );


            window.location.href =
                `/customer-details.html?id=${customerId}`;


        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                'خطا در ثبت پرداخت';

        }

    }
);


/* =========================
   شروع
========================= */

loadCustomers();