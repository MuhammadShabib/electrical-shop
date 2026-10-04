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

const productCount =
    document.getElementById('productCount');

const totalSales =
    document.getElementById('totalSales');

const totalCost =
    document.getElementById('totalCost');

const totalProfit =
    document.getElementById('totalProfit');

const productProfitBody =
    document.getElementById('productProfitBody');

const message =
    document.getElementById('message');


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
   فرمت تاریخ
========================= */

function formatDateValue(date) {

    return date
        .toISOString()
        .split('T')[0];

}


/* =========================
   دریافت گزارش
========================= */

async function loadReport() {

    try {

        message.textContent =
            'در حال دریافت گزارش...';


        const params =
            new URLSearchParams();


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
                ? `/api/product-profit?${params.toString()}`
                : '/api/product-profit';


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
                'دریافت گزارش سود دواها انجام نشد'
            );

        }


        const products =
            result.data || [];


        /* =========================
           محاسبه خلاصه
        ========================= */

        let salesTotal = 0;

        let costTotal = 0;

        let profitTotal = 0;


        products.forEach(
            product => {

                salesTotal +=
                    Number(
                        product.total_sales
                    ) || 0;


                costTotal +=
                    Number(
                        product.cost_of_goods_sold
                    ) || 0;


                profitTotal +=
                    Number(
                        product.profit
                    ) || 0;

            }
        );


        productCount.textContent =
            products.length;


        totalSales.textContent =
            formatMoney(
                salesTotal
            ) + ' افغانی';


        totalCost.textContent =
            formatMoney(
                costTotal
            ) + ' افغانی';


        totalProfit.textContent =
            formatMoney(
                profitTotal
            ) + ' افغانی';


        /* =========================
           نمایش جدول
        ========================= */

        productProfitBody.innerHTML =
            '';


        if (products.length === 0) {

            productProfitBody.innerHTML = `

                <tr>

                    <td colspan="8">
                        در این بازه فروشی ثبت نشده است
                    </td>

                </tr>

            `;

            message.textContent =
                'گزارشی برای نمایش وجود ندارد';

            return;

        }


        products.forEach(
            (product, index) => {

                const row =
                    document.createElement(
                        'tr'
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${product.code || '-'}
                    </td>

                    <td>
                        ${product.name || '-'}
                    </td>

                    <td>
                        ${product.unit || '-'}
                    </td>

                    <td>
                        ${formatMoney(
                            product.sold_quantity
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.total_sales
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.cost_of_goods_sold
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.profit
                        )}
                    </td>

                `;


                productProfitBody.appendChild(
                    row
                );

            }
        );


        message.textContent =
            'گزارش با موفقیت دریافت شد';


    } catch (error) {

        console.error(error);


        message.textContent =
            error.message ||
            'خطا در دریافت گزارش';

    }

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
            formatDateValue(
                today
            );


        fromDate.value =
            date;

        toDate.value =
            date;


        loadReport();

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


        loadReport();

    }
);


/* =========================
   همه
========================= */

clearBtn.addEventListener(
    'click',
    function () {

        fromDate.value =
            '';

        toDate.value =
            '';


        loadReport();

    }
);


/* =========================
   نمایش گزارش
========================= */

generateBtn.addEventListener(
    'click',
    loadReport
);


/* =========================
   شروع
========================= */

loadReport();