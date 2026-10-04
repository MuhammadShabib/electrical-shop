const supplierSelect =
    document.getElementById('supplier');

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


let suppliers = [];


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
   دریافت شرکت ها
========================= */

async function loadSuppliers() {

    try {

        const response =
            await fetch('/api/suppliers');


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'خطا در دریافت شرکت ها'
            );

        }


        suppliers =
            result.data || [];


        supplierSelect.innerHTML = `
            <option value="">
                انتخاب شرکت
            </option>
        `;


        suppliers.forEach(supplier => {

            const option =
                document.createElement('option');


            option.value =
                supplier.id;


            option.textContent =
                supplier.name +
                (
                    supplier.phone
                        ? ` - ${supplier.phone}`
                        : ''
                );


            supplierSelect.appendChild(
                option
            );

        });


    } catch (error) {

        console.error(error);


        supplierSelect.innerHTML = `
            <option value="">
                خطا در دریافت شرکت ها
            </option>
        `;


        message.textContent =
            'ارتباط با سرور برقرار نشد';

    }

}


/* =========================
   نمایش مانده شرکت
========================= */

supplierSelect.addEventListener(
    'change',
    function () {

        const supplier =
            suppliers.find(
                item =>
                    Number(item.id) ===
                    Number(this.value)
            );


        if (!supplier) {

            balanceAmount.textContent =
                '0';

            return;

        }


        /*
         * اگر API شرکت ها مانده حساب را
         * ارسال کند، از آن استفاده می‌کنیم.
         */

        const balance =
            Number(
                supplier.balance ||
                supplier.remaining_amount ||
                0
            );


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


        const supplierId =
            supplierSelect.value;


        const amount =
            Number(amountInput.value);


        const method =
            paymentMethod.value;


        const description =
            descriptionInput.value.trim();


        if (!supplierId) {

            alert(
                'لطفاً شرکت را انتخاب کنید'
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


            const response =
                await fetch(
                    '/api/supplier-payments',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({

                            supplier_id:
                                Number(supplierId),

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


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    'ثبت پرداخت انجام نشد'
                );

            }


            alert(
                'پرداخت به شرکت با موفقیت ثبت شد'
            );


            window.location.href =
                `/supplier-details.html?id=${supplierId}`;


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

loadSuppliers();