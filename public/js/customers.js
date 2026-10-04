const tableBody =
    document.getElementById('customersTableBody');

const searchInput =
    document.getElementById('customerSearch');

const addCustomerBtn =
    document.getElementById('addCustomerBtn');

const cancelCustomerBtn =
    document.getElementById('cancelCustomerBtn');

const customerFormContainer =
    document.getElementById('customerFormContainer');

const customerForm =
    document.getElementById('customerForm');

let customers = [];


/* =========================
   دریافت مشتریان
========================= */

async function loadCustomers() {

    try {

        const response =
            await fetch('/api/customers');

        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        customers = result.data;

        displayCustomers(customers);


    } catch (error) {

        console.error(error);

        alert('ارتباط با سرور برقرار نشد');

    }

}


/* =========================
   نمایش مشتریان
========================= */

function displayCustomers(data) {

    tableBody.innerHTML = '';


    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">

                    هنوز مشتری ثبت نشده است

                </td>

            </tr>
        `;

        return;

    }


    data.forEach(customer => {

        const row =
            document.createElement('tr');


        row.innerHTML = `

            <td>
                ${customer.name}
            </td>

            <td>
                ${customer.phone || '-'}
            </td>

            <td>
                ${customer.address || '-'}
            </td>

            <td>
                ${Number(customer.opening_balance)
                    .toLocaleString()}
            </td>

            <td>

                ${
                    customer.opening_balance_type === 'debit'

                    ? 'بدهکار'

                    : 'طلبکار'
                }

            </td>

            <td>

                ${
                    customer.status == 1

                    ? 'فعال'

                    : 'غیرفعال'
                }

            </td>

            <td>

                <div class="action-buttons">


                    <button
                        class="edit-btn"
                        onclick="editCustomer(${customer.id})"
                    >
                        ویرایش
                    </button>


                    ${
                        customer.status == 1

                        ?

                        `
                        <button
                            class="disable-btn"
                            onclick="disableCustomer(${customer.id})"
                        >
                            غیرفعال
                        </button>
                        `

                        :

                        `
                        <button
                            class="enable-btn"
                            onclick="enableCustomer(${customer.id})"
                        >
                            فعال
                        </button>
                        `
                    }


                    <button
                        class="account-btn"
                        onclick="customerAccount(${customer.id})"
                    >
                        حساب
                    </button>


                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =========================
   باز کردن فرم
========================= */

addCustomerBtn.addEventListener('click', () => {

    customerForm.reset();


    document.getElementById('customerId')
        .value = '';


    document.getElementById('customerFormTitle')
        .textContent = 'ثبت مشتری جدید';


    document.getElementById('saveCustomerBtn')
        .textContent = 'ذخیره مشتری';


    customerFormContainer
        .classList
        .remove('hidden');


    document.getElementById('customerName')
        .focus();

});


/* =========================
   بستن فرم
========================= */

cancelCustomerBtn.addEventListener('click', () => {

    customerForm.reset();


    document.getElementById('customerId')
        .value = '';


    customerFormContainer
        .classList
        .add('hidden');

});


/* =========================
   ثبت / ویرایش مشتری
========================= */

customerForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const customerId =
            document.getElementById('customerId')
                .value;


        const data = {

            name:
                document.getElementById('customerName')
                    .value
                    .trim(),

            phone:
                document.getElementById('customerPhone')
                    .value
                    .trim(),

            address:
                document.getElementById('customerAddress')
                    .value
                    .trim(),

            opening_balance:
                Number(
                    document.getElementById('openingBalance')
                        .value
                ),

            opening_balance_type:
                document.getElementById(
                    'openingBalanceType'
                ).value,

            description:
                document.getElementById(
                    'customerDescription'
                ).value
                .trim()

        };


        try {


            const url =
                customerId

                ? `/api/customers/${customerId}`

                : '/api/customers';


            const method =
                customerId

                ? 'PUT'

                : 'POST';


            const response =
                await fetch(url, {

                    method: method,

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify(data)

                });


            const result =
                await response.json();


            if (!result.success) {

                alert(result.message);

                return;

            }


            alert(

                customerId

                ? 'مشتری با موفقیت ویرایش شد'

                : 'مشتری با موفقیت ثبت شد'

            );


            customerForm.reset();


            document.getElementById('customerId')
                .value = '';


            customerFormContainer
                .classList
                .add('hidden');


            await loadCustomers();


        } catch (error) {

            console.error(error);

            alert('خطا در ذخیره مشتری');

        }

    }
);


/* =========================
   ویرایش مشتری
========================= */

async function editCustomer(id) {

    try {

        const response =
            await fetch(`/api/customers/${id}`);


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        const customer =
            result.data;


        customerFormContainer
            .classList
            .remove('hidden');


        document.getElementById(
            'customerFormTitle'
        )
        .textContent = 'ویرایش مشتری';


        document.getElementById(
            'saveCustomerBtn'
        )
        .textContent = 'ذخیره تغییرات';


        document.getElementById(
            'customerId'
        )
        .value = customer.id;


        document.getElementById(
            'customerName'
        )
        .value = customer.name;


        document.getElementById(
            'customerPhone'
        )
        .value = customer.phone || '';


        document.getElementById(
            'customerAddress'
        )
        .value = customer.address || '';


        document.getElementById(
            'openingBalance'
        )
        .value = customer.opening_balance;


        document.getElementById(
            'openingBalanceType'
        )
        .value = customer.opening_balance_type;


        document.getElementById(
            'customerDescription'
        )
        .value = customer.description || '';


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


    } catch (error) {

        console.error(error);

        alert('خطا در دریافت اطلاعات مشتری');

    }

}


/* =========================
   غیرفعال کردن
========================= */

async function disableCustomer(id) {

    const confirmed =
        confirm(
            'آیا مطمئن هستید که می‌خواهید این مشتری غیرفعال شود؟'
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(`/api/customers/${id}`, {

                method: 'DELETE'

            });


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert('مشتری غیرفعال شد');


        await loadCustomers();


    } catch (error) {

        console.error(error);

        alert('خطا در غیرفعال کردن مشتری');

    }

}


/* =========================
   فعال کردن
========================= */

async function enableCustomer(id) {

    try {

        const response =
            await fetch(
                `/api/customers/${id}/enable`,
                {
                    method: 'PUT'
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert('مشتری فعال شد');


        await loadCustomers();


    } catch (error) {

        console.error(error);

        alert('خطا در فعال کردن مشتری');

    }

}


/* =========================
   جستجو
========================= */

searchInput.addEventListener('input', () => {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        customers.filter(customer => {

            return (

                customer.name
                    .toLowerCase()
                    .includes(search)

                ||

                (customer.phone || '')
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayCustomers(filtered);

});


/* =========================
   حساب مشتری
========================= */

function customerAccount(id) {

    window.location.href =
        `/customer-account.html?id=${id}`;

}


/* =========================
   شروع
========================= */

loadCustomers();