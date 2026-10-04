/* =========================
   عناصر صفحه
========================= */

const daysInput =
    document.getElementById(
        'daysInput'
    );

const searchBtn =
    document.getElementById(
        'searchBtn'
    );

const tableBody =
    document.getElementById(
        'expiringTableBody'
    );

const message =
    document.getElementById(
        'message'
    );


/* =========================
   تبدیل مبلغ/عدد
========================= */

function formatNumber(value) {

    return Number(value || 0)
        .toLocaleString(
            'en-US',
            {
                maximumFractionDigits: 3
            }
        );

}


/* =========================
   محاسبه روز باقی‌مانده
========================= */

function getDaysRemaining(
    expiryDate
) {

    if (!expiryDate) {

        return null;

    }


    const dateString =
        String(expiryDate)
            .substring(0, 10);


    const parts =
        dateString
            .split('-')
            .map(Number);


    if (
        parts.length !== 3 ||
        parts.some(
            value =>
                Number.isNaN(value)
        )
    ) {

        return null;

    }


    const expiry =
        new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    expiry.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiry.getTime() -
        today.getTime();


    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}

/* =========================
   دریافت دواهای تاریخ کم
========================= */

async function loadExpiringMedicines() {

    try {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    در حال دریافت اطلاعات...
                </td>

            </tr>

        `;


        message.textContent =
            '';


        const days =
            Number(
                daysInput.value
            );


        if (
            !Number.isInteger(days) ||
            days <= 0
        ) {

            message.textContent =
                'تعداد روز باید یک عدد صحیح بیشتر از صفر باشد';

            return;

        }


        /* =========================
           دریافت دواها
        ========================= */

        const productsResponse =
            await fetch(
                '/api/products'
            );


        const productsResult =
            await productsResponse.json();


        if (
            !productsResponse.ok ||
            !productsResult.success
        ) {

            throw new Error(
                productsResult.message ||
                'دریافت دواها انجام نشد'
            );

        }


        const products =
            productsResult.data || [];


        const expiringBatches = [];


        /* =========================
           دریافت بچ‌های هر دوا
        ========================= */

        for (
            const product of products
        ) {

            if (
                Number(product.status) !== 1
            ) {

                continue;

            }


            const response =
                await fetch(
                    `/api/batches/product/${product.id}`
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                continue;

            }


            const batches =
                result.data || [];


            batches.forEach(
                batch => {

                    const quantity =
                        Number(
                            batch.quantity
                        ) || 0;


                    if (
                        quantity <= 0
                    ) {

                        return;

                    }


                    if (
                        Number(batch.status) !== 1
                    ) {

                        return;

                    }


                    const daysRemaining =
                        getDaysRemaining(
                            batch.expiry_date
                        );


                    if (
                        daysRemaining === null
                    ) {

                        return;

                    }


                    /*
                     * فقط دواهایی که:
                     * منقضی نشده‌اند
                     * و تا تعداد روز تعیین‌شده
                     */

                    if (
                        daysRemaining >= 0 &&
                        daysRemaining <= days
                    ) {

                        expiringBatches.push({

                            product_id:
                                product.id,

                            code:
                                product.code,

                            name:
                                product.name,

                            batch_number:
                                batch.batch_number,

                            expiry_date:
                                batch.expiry_date,

                            quantity:
                                quantity,

                            days_remaining:
                                daysRemaining

                        });

                    }

                }
            );

        }


        /* =========================
           مرتب‌سازی
        ========================= */

        expiringBatches.sort(
            (
                a,
                b
            ) =>
                a.days_remaining -
                b.days_remaining
        );


        /* =========================
           نمایش جدول
        ========================= */

        tableBody.innerHTML =
            '';


        if (
            expiringBatches.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="8">

                        در این بازه، دوای تاریخ کم پیدا نشد.

                    </td>

                </tr>

            `;


            message.textContent =
                `هیچ دوایی در ${days} روز آینده به تاریخ انقضا نمی‌رسد`;

            return;

        }


        expiringBatches.forEach(
            (
                item,
                index
            ) => {

                const row =
                    document.createElement(
                        'tr'
                    );


                let daysText;


                if (
                    item.days_remaining === 0
                ) {

                    daysText =
                        'امروز';

                } else {

                    daysText =
                        `${formatNumber(
                            item.days_remaining
                        )} روز`;

                }


                let statusText;


                if (
                    item.days_remaining <= 7
                ) {

                    statusText =
                        '⚠️ خیلی نزدیک';

                } else if (
                    item.days_remaining <= 30
                ) {

                    statusText =
                        '⚠️ نزدیک';

                } else {

                    statusText =
                        'قابل توجه';

                }


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${item.code || '-'}
                    </td>

                    <td>
                        ${item.name || '-'}
                    </td>

                    <td>
                        ${item.batch_number || '-'}
                    </td>

                    <td>
                        ${item.expiry_date || '-'}
                    </td>

                    <td>
                        ${formatNumber(
                            item.quantity
                        )}
                    </td>

                    <td>
                        ${daysText}
                    </td>

                    <td>
                        ${statusText}
                    </td>

                `;


                if (
                    item.days_remaining <= 7
                ) {

                    row.classList.add(
                        'low-stock'
                    );

                }


                tableBody.appendChild(
                    row
                );

            }
        );


        message.textContent =
            `${expiringBatches.length} بچ دوا در بازه ${days} روز پیدا شد`;


    } catch (error) {

        console.error(
            'Expiring medicines error:',
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    خطا در دریافت اطلاعات
                </td>

            </tr>

        `;


        message.textContent =
            error.message ||
            'خطا در دریافت اطلاعات دواهای تاریخ کم';

    }

}


/* =========================
   دکمه نمایش
========================= */

searchBtn.addEventListener(
    'click',
    loadExpiringMedicines
);


/* =========================
   شروع صفحه
========================= */

loadExpiringMedicines();