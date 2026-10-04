const productSelect =
    document.getElementById('productSelect');

const fromDate =
    document.getElementById('fromDate');

const toDate =
    document.getElementById('toDate');

const generateBtn =
    document.getElementById('generateBtn');

const todayBtn =
    document.getElementById('todayBtn');

const thisMonthBtn =
    document.getElementById('thisMonthBtn');

const clearBtn =
    document.getElementById('clearBtn');

const movementCount =
    document.getElementById('movementCount');

const totalIn =
    document.getElementById('totalIn');

const totalOut =
    document.getElementById('totalOut');

const netMovement =
    document.getElementById('netMovement');

const movementsBody =
    document.getElementById('movementsBody');

const message =
    document.getElementById('message');


let movements = [];


/* =========================
   فرمت عدد
========================= */

function formatNumber(value) {

    return Number(value || 0)
        .toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }
        );

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
   نام نوع حرکت
========================= */

function movementType(type) {

    switch (type) {

        case 'purchase':
            return 'خرید';

        case 'sale':
            return 'فروش';

        case 'return_purchase':
            return 'برگشت خرید';

        case 'return_sale':
            return 'برگشت فروش';

        case 'adjustment':
            return 'اصلاح موجودی';

        default:
            return type || '-';

    }

}


/* =========================
   نوع ورود / خروج
========================= */

function getMovementDirection(type) {

    if (
        type === 'purchase' ||
        type === 'return_sale'
    ) {

        return 'in';

    }


    if (
        type === 'sale' ||
        type === 'return_purchase'
    ) {

        return 'out';

    }


    return 'other';

}


/* =========================
   دریافت لیست دواها
========================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                '/api/products'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت دواها انجام نشد'
            );

        }


        const products =
            result.data || [];


        productSelect.innerHTML = `

            <option value="">
                همه دواها
            </option>

        `;


        products.forEach(
            product => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    product.id;


                option.textContent =
                    `${product.code || ''} - ${
                        product.name || ''
                    }`;


                productSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            'خطا در دریافت دواها';

    }

}


/* =========================
   دریافت گردش انبار
========================= */

async function loadMovements() {

    try {

        message.textContent =
            'در حال دریافت گردش انبار...';


        const params =
            new URLSearchParams();


        if (productSelect.value) {

            params.append(
                'product_id',
                productSelect.value
            );

        }


        if (fromDate.value) {

            params.append(
                'from',
                fromDate.value
            );

        }


        if (toDate.value) {

            params.append(
                'to',
                toDate.value
            );

        }


        const url =
            params.toString()
                ? `/api/stock-movements?${params.toString()}`
                : '/api/stock-movements';


        const response =
            await fetch(url);


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت گردش انبار انجام نشد'
            );

        }


        movements =
            result.data || [];


        renderMovements();


    } catch (error) {

        console.error(error);


        movementsBody.innerHTML = `

            <tr>

                <td colspan="7">
                    ${
                        error.message ||
                        'خطا در دریافت اطلاعات'
                    }
                </td>

            </tr>

        `;


        message.textContent =
            error.message ||
            'خطا در دریافت گردش انبار';

    }

}


/* =========================
   نمایش گردش انبار
========================= */

function renderMovements() {

    movementsBody.innerHTML =
        '';


    let incoming = 0;

    let outgoing = 0;


    movementCount.textContent =
        movements.length;


    if (movements.length === 0) {

        movementsBody.innerHTML = `

            <tr>

                <td colspan="7">
                    در این بازه گردش انباری ثبت نشده است
                </td>

            </tr>

        `;


        totalIn.textContent =
            '0';

        totalOut.textContent =
            '0';

        netMovement.textContent =
            '0';

        message.textContent =
            'گردشی برای نمایش وجود ندارد';

        return;

    }


    movements.forEach(
        (movement, index) => {

            const quantity =
                Number(
                    movement.quantity
                ) || 0;


            const direction =
                getMovementDirection(
                    movement.type
                );


            if (direction === 'in') {

                incoming +=
                    quantity;

            }

            else if (
                direction === 'out'
            ) {

                outgoing +=
                    quantity;

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
                    ${movement.product_name || '-'}
                </td>

                <td>
                    ${movementType(
                        movement.type
                    )}
                </td>

                <td>
                    ${formatNumber(
                        quantity
                    )}
                </td>

                <td>
                    ${
                        movement.reference_id ||
                        '-'
                    }
                </td>

                <td>
                    ${
                        movement.description ||
                        '-'
                    }
                </td>

                <td>
                    ${formatDate(
                        movement.movement_date
                    )}
                </td>

            `;


            movementsBody.appendChild(
                row
            );

        }
    );


    totalIn.textContent =
        formatNumber(
            incoming
        );


    totalOut.textContent =
        formatNumber(
            outgoing
        );


    netMovement.textContent =
        formatNumber(
            incoming -
            outgoing
        );


    message.textContent =
        'گزارش گردش انبار با موفقیت دریافت شد';

}


/* =========================
   امروز
========================= */

todayBtn.addEventListener(
    'click',
    function () {

        const today =
            new Date();


        const date =
            today.toISOString()
                .split('T')[0];


        fromDate.value =
            date;

        toDate.value =
            date;


        loadMovements();

    }
);


/* =========================
   این ماه
========================= */

thisMonthBtn.addEventListener(
    'click',
    function () {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, '0');


        const firstDay =
            `${year}-${month}-01`;


        const lastDay =
            new Date(
                year,
                today.getMonth() + 1,
                0
            );


        const lastDayString =
            `${year}-${month}-${String(
                lastDay.getDate()
            ).padStart(2, '0')}`;


        fromDate.value =
            firstDay;

        toDate.value =
            lastDayString;


        loadMovements();

    }
);


/* =========================
   همه
========================= */

clearBtn.addEventListener(
    'click',
    function () {

        productSelect.value =
            '';

        fromDate.value =
            '';

        toDate.value =
            '';


        loadMovements();

    }
);


/* =========================
   نمایش
========================= */

generateBtn.addEventListener(
    'click',
    loadMovements
);


/* =========================
   تغییر دوا
========================= */

productSelect.addEventListener(
    'change',
    loadMovements
);


/* =========================
   شروع
========================= */

loadProducts();

loadMovements();