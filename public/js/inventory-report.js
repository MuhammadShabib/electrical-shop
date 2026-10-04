const productCount =
    document.getElementById('productCount');

const totalStock =
    document.getElementById('totalStock');

const inventoryCostValue =
    document.getElementById(
        'inventoryCostValue'
    );

const inventorySaleValue =
    document.getElementById(
        'inventorySaleValue'
    );

const potentialProfit =
    document.getElementById(
        'potentialProfit'
    );

const inventoryReportBody =
    document.getElementById(
        'inventoryReportBody'
    );

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
   دریافت گزارش موجودی
========================= */

async function loadInventoryReport() {

    try {

        message.textContent =
            'در حال دریافت گزارش موجودی...';


        const response =
            await fetch(
                '/api/inventory-report'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت گزارش موجودی انجام نشد'
            );

        }


        const products =
            result.data || [];
            window.inventoryProducts =
    products;


        /* =========================
           محاسبه خلاصه
        ========================= */

        let stockTotal = 0;

        let costValueTotal = 0;

        let saleValueTotal = 0;

        let profitTotal = 0;


        products.forEach(
            product => {

                stockTotal +=
                    Number(
                        product.stock
                    ) || 0;


                costValueTotal +=
                    Number(
                        product.inventory_cost_value
                    ) || 0;


                saleValueTotal +=
                    Number(
                        product.inventory_sale_value
                    ) || 0;


                profitTotal +=
                    Number(
                        product.potential_profit
                    ) || 0;

            }
        );


        productCount.textContent =
            products.length;


        totalStock.textContent =
            formatMoney(
                stockTotal
            );


        inventoryCostValue.textContent =
            formatMoney(
                costValueTotal
            ) + ' افغانی';


        inventorySaleValue.textContent =
            formatMoney(
                saleValueTotal
            ) + ' افغانی';


        potentialProfit.textContent =
            formatMoney(
                profitTotal
            ) + ' افغانی';


        /* =========================
           نمایش جدول
        ========================= */

        inventoryReportBody.innerHTML =
            '';


        if (products.length === 0) {

            inventoryReportBody.innerHTML = `

                <tr>

                    <td colspan="10">
                        هیچ دوای فعالی پیدا نشد
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
                            product.stock
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.purchase_price
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.sale_price
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.inventory_cost_value
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.inventory_sale_value
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.potential_profit
                        )}
                    </td>

                    <td>
    <button
        type="button"
        class="account-btn"
        onclick="openInventoryBatches(${product.id})"
    >
        📦 بچ‌ها
    </button>
</td>

                `;


                inventoryReportBody.appendChild(
                    row
                );

            }
        );


        message.textContent =
            'گزارش موجودی با موفقیت دریافت شد';


    } catch (error) {

        console.error(error);


        message.textContent =
            error.message ||
            'خطا در دریافت گزارش موجودی';

    }

}


/* =========================
   شروع
========================= */

/* =========================
   نمایش بچ‌های دوا
========================= */

async function openInventoryBatches(productId) {

    try {

        const product =
            (window.inventoryProducts || [])
                .find(
                    product =>
                        Number(product.id) ===
                        Number(productId)
                );


        const modal =
            document.createElement('div');

        modal.className =
            'modal';


        modal.innerHTML = `

            <div class="modal-content">

                <h3>
                    بچ‌های دوا
                </h3>

                <div
                    id="inventoryBatchContent"
                    style="margin-top:15px;">
                    
                    در حال دریافت اطلاعات...

                </div>

                <div class="form-buttons">

                    <button
                        type="button"
                        id="closeInventoryBatchBtn"
                        class="cancel-btn">

                        بستن

                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const content =
            document.getElementById(
                'inventoryBatchContent'
            );


        const closeBtn =
            document.getElementById(
                'closeInventoryBatchBtn'
            );


        closeBtn.addEventListener(
            'click',
            () => {

                modal.remove();

            }
        );


        /* =========================
           دریافت بچ‌ها
        ========================= */

        const response =
            await fetch(
                `/api/batches/product/${productId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت بچ‌ها انجام نشد'
            );

        }


        const batches =
            result.data || [];


        if (
            batches.length === 0
        ) {

            content.innerHTML = `
            
                <p>
                    برای این دوا بچی ثبت نشده است.
                </p>

            `;

            return;

        }


        /* =========================
           ساخت جدول
        ========================= */

        const table =
            document.createElement(
                'table'
            );


        table.innerHTML = `

            <thead>

                <tr>

                    <th>
                        شماره بچ
                    </th>

                    <th>
                        تاریخ انقضا
                    </th>

                    <th>
                        موجودی
                    </th>

                    <th>
                        وضعیت
                    </th>

                </tr>

            </thead>

            <tbody>
            </tbody>

        `;


        const tbody =
            table.querySelector(
                'tbody'
            );


        const today =
            new Date()
                .toISOString()
                .split('T')[0];


        batches.forEach(
            batch => {

                const row =
                    document.createElement(
                        'tr'
                    );


                const batchCell =
                    document.createElement(
                        'td'
                    );

                batchCell.textContent =
                    batch.batch_number || '-';


                const expiryCell =
                    document.createElement(
                        'td'
                    );

                expiryCell.textContent =
                    batch.expiry_date || '-';


                const quantityCell =
                    document.createElement(
                        'td'
                    );

                quantityCell.textContent =
                    batch.quantity;


                const statusCell =
                    document.createElement(
                        'td'
                    );


                if (
                    Number(batch.status) !== 1
                ) {

                    statusCell.textContent =
                        'غیرفعال';

                    row.classList.add(
                        'inactive-row'
                    );

                } else if (
                    batch.expiry_date < today
                ) {

                    statusCell.textContent =
                        '❌ منقضی';

                    row.classList.add(
                        'inactive-row'
                    );

                } else {

                    statusCell.textContent =
                        'فعال';

                }


                row.appendChild(
                    batchCell
                );

                row.appendChild(
                    expiryCell
                );

                row.appendChild(
                    quantityCell
                );

                row.appendChild(
                    statusCell
                );


                tbody.appendChild(
                    row
                );

            }
        );


        content.innerHTML = '';


        const title =
            document.createElement(
                'h4'
            );


        if (product) {

            title.textContent =
                product.name;

            content.appendChild(
                title
            );

        }


        content.appendChild(
            table
        );


    } catch (error) {

        console.error(
            'Inventory batches error:',
            error
        );


        const content =
            document.getElementById(
                'inventoryBatchContent'
            );


        if (content) {

            content.textContent =
                error.message ||
                'خطا در دریافت بچ‌ها';

        }

    }

}


loadInventoryReport();