const supplierForm =
    document.getElementById('supplierForm');

const nameInput =
    document.getElementById('name');

const phoneInput =
    document.getElementById('phone');

const addressInput =
    document.getElementById('address');

const openingBalanceInput =
    document.getElementById('openingBalance');

const descriptionInput =
    document.getElementById('description');

const searchInput =
    document.getElementById('searchInput');

const suppliersBody =
    document.getElementById('suppliersBody');

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


        if (!response.ok ||
            !result.success) {

            throw new Error(
                result.message ||
                'دریافت شرکت ها انجام نشد'
            );

        }


        suppliers =
            result.data || [];


        renderSuppliers();


    } catch (error) {

        console.error(error);

        suppliersBody.innerHTML = `

            <tr>

                <td colspan="6">
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


/* =========================
   نمایش شرکت ها
========================= */

function renderSuppliers() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        suppliers.filter(supplier => {

            const name =
                String(
                    supplier.name || ''
                ).toLowerCase();


            const phone =
                String(
                    supplier.phone || ''
                ).toLowerCase();


            return (
                name.includes(search) ||
                phone.includes(search)
            );

        });


    suppliersBody.innerHTML = '';


    if (filtered.length === 0) {

        suppliersBody.innerHTML = `

            <tr>

                <td colspan="6">
                    هنوز شرکت‌ای ثبت نشده است
                </td>

            </tr>

        `;

        return;

    }


    filtered.forEach(
        (supplier, index) => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${supplier.name || '-'}
                </td>

                <td>
                    ${supplier.phone || '-'}
                </td>

                <td>
                    ${supplier.address || '-'}
                </td>

                <td>
                    ${formatMoney(
                        supplier.opening_balance
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="makePayment(${supplier.id})">

                        پرداخت

                    </button>

                    <button
                        type="button"
                        onclick="viewSupplier(${supplier.id})">

                        حساب

                    </button>

                </td>

            `;


            suppliersBody.appendChild(row);

        }
    );

}


/* =========================
   ثبت شرکت
========================= */

supplierForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const name =
            nameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const address =
            addressInput.value.trim();

        const openingBalance =
            Number(
                openingBalanceInput.value
            ) || 0;

        const description =
            descriptionInput.value.trim();


        if (!name) {

            alert(
                'لطفاً نام شرکت را وارد کنید'
            );

            return;

        }


        try {

            message.textContent =
                'در حال ثبت شرکت...';


            const response =
                await fetch(
                    '/api/suppliers',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({

                            name,
                            phone:
                                phone || null,

                            address:
                                address || null,

                            opening_balance:
                                openingBalance,

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
                    'ثبت شرکت انجام نشد'
                );

            }


            alert(
                'شرکت با موفقیت ثبت شد'
            );


            supplierForm.reset();

            openingBalanceInput.value =
                '0';


            message.textContent =
                '';


            await loadSuppliers();


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message ||
                'خطا در ثبت شرکت';

        }

    }
);


/* =========================
   جستجو
========================= */

searchInput.addEventListener(
    'input',
    renderSuppliers
);


/* =========================
   پرداخت شرکت
========================= */

function makePayment(id) {

    window.location.href =
        `/supplier-payment.html?id=${id}`;

}


/* =========================
   حساب شرکت
========================= */

function viewSupplier(id) {

    window.location.href =
        `/supplier-account.html?id=${id}`;

}

/* =========================
   شروع
========================= */

loadSuppliers();