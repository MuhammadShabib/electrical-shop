/* =========================
   عناصر صفحه
========================= */

const tableBody =
    document.getElementById(
        'employeesTableBody'
    );


const searchInput =
    document.getElementById(
        'employeeSearch'
    );


const addEmployeeBtn =
    document.getElementById(
        'addEmployeeBtn'
    );


const cancelEmployeeBtn =
    document.getElementById(
        'cancelEmployeeBtn'
    );


const employeeFormContainer =
    document.getElementById(
        'employeeFormContainer'
    );


const employeeForm =
    document.getElementById(
        'employeeForm'
    );


let employees = [];



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
   دریافت کارمندان
========================= */

async function loadEmployees() {

    try {

        const response =
            await fetch(
                '/api/employees'
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                'خطا در دریافت کارمندان'
            );

            return;

        }


        employees =
            result.data || [];


        displayEmployees(
            employees
        );


    } catch (error) {

        console.error(error);

        alert(
            'ارتباط با سرور برقرار نشد'
        );

    }

}



/* =========================
   نمایش کارمندان
========================= */

function displayEmployees(data) {

    tableBody.innerHTML = '';


    if (data.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    هنوز کارمندی ثبت نشده است

                </td>

            </tr>

        `;

        return;

    }


    data.forEach(
        employee => {

            const row =
                document.createElement('tr');


            const fullName =
                `${employee.first_name}
                 ${employee.last_name}`;


            row.innerHTML = `

                <td>
                    ${fullName}
                </td>


                <td>
                    ${employee.phone || '-'}
                </td>


                <td>
                    ${employee.address || '-'}
                </td>


                <td>
                    ${formatMoney(
                        employee.salary
                    )}
                </td>


                <td>
                    ${employee.work_time || '-'}
                </td>


                <td>

                    ${
                        Number(
                            employee.status
                        ) === 1

                        ? 'فعال'

                        : 'غیرفعال'
                    }

                </td>


                <td>

                    <div
                        class="action-buttons"
                    >


                        <button
                            class="edit-btn"
                            onclick="
                                editEmployee(
                                    ${employee.id}
                                )
                            "
                        >
                            ویرایش
                        </button>



                        ${
                            Number(
                                employee.status
                            ) === 1

                            ?

                            `
                            <button
                                class="disable-btn"
                                onclick="
                                    disableEmployee(
                                        ${employee.id}
                                    )
                                "
                            >
                                غیرفعال
                            </button>
                            `

                            :

                            `
                            <button
                                class="enable-btn"
                                onclick="
                                    enableEmployee(
                                        ${employee.id}
                                    )
                                "
                            >
                                فعال
                            </button>
                            `
                        }



                        <button
                            class="account-btn"
                            onclick="
                                employeeAccount(
                                    ${employee.id}
                                )
                            "
                        >
                            حساب
                        </button>


                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}



/* =========================
   باز کردن فرم
========================= */

addEmployeeBtn.addEventListener(
    'click',
    () => {

        employeeForm.reset();


        document.getElementById(
            'employeeId'
        ).value = '';


        document.getElementById(
            'employeeFormTitle'
        ).textContent =
            'ثبت کارمند جدید';


        document.getElementById(
            'saveEmployeeBtn'
        ).textContent =
            '💾 ذخیره کارمند';


        document.getElementById(
            'employeeSalary'
        ).value = 0;


        employeeFormContainer
            .classList
            .remove('hidden');


        document.getElementById(
            'employeeFirstName'
        ).focus();

    }
);



/* =========================
   بستن فرم
========================= */

cancelEmployeeBtn.addEventListener(
    'click',
    () => {

        employeeForm.reset();


        document.getElementById(
            'employeeId'
        ).value = '';


        employeeFormContainer
            .classList
            .add('hidden');

    }
);



/* =========================
   ثبت / ویرایش
========================= */

employeeForm.addEventListener(
    'submit',
    async event => {

        event.preventDefault();


        const employeeId =
            document.getElementById(
                'employeeId'
            ).value;


        const data = {

            first_name:
                document.getElementById(
                    'employeeFirstName'
                )
                .value
                .trim(),


            last_name:
                document.getElementById(
                    'employeeLastName'
                )
                .value
                .trim(),


            phone:
                document.getElementById(
                    'employeePhone'
                )
                .value
                .trim(),


            address:
                document.getElementById(
                    'employeeAddress'
                )
                .value
                .trim(),


            salary:
                Number(
                    document.getElementById(
                        'employeeSalary'
                    ).value
                ) || 0,


            work_time:
                document.getElementById(
                    'employeeWorkTime'
                )
                .value
                .trim()

        };


        try {

            const url =
                employeeId

                ? `/api/employees/${employeeId}`

                : '/api/employees';


            const method =
                employeeId
                ? 'PUT'
                : 'POST';


            const response =
                await fetch(
                    url,
                    {

                        method,

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                data
                            )

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    'خطا در ذخیره کارمند'
                );

                return;

            }


            alert(

                employeeId

                ? 'اطلاعات کارمند با موفقیت ویرایش شد'

                : 'کارمند با موفقیت ثبت شد'

            );


            employeeForm.reset();


            document.getElementById(
                'employeeId'
            ).value = '';


            employeeFormContainer
                .classList
                .add('hidden');


            await loadEmployees();


        } catch (error) {

            console.error(error);

            alert(
                'خطا در ذخیره کارمند'
            );

        }

    }
);



/* =========================
   ویرایش کارمند
========================= */

async function editEmployee(id) {

    try {

        const response =
            await fetch(
                `/api/employees/${id}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'خطا در دریافت کارمند'
            );

            return;

        }


        const employee =
            result.data;


        employeeFormContainer
            .classList
            .remove('hidden');


        document.getElementById(
            'employeeFormTitle'
        ).textContent =
            'ویرایش کارمند';


        document.getElementById(
            'saveEmployeeBtn'
        ).textContent =
            '💾 ذخیره تغییرات';


        document.getElementById(
            'employeeId'
        ).value =
            employee.id;


        document.getElementById(
            'employeeFirstName'
        ).value =
            employee.first_name || '';


        document.getElementById(
            'employeeLastName'
        ).value =
            employee.last_name || '';


        document.getElementById(
            'employeePhone'
        ).value =
            employee.phone || '';


        document.getElementById(
            'employeeAddress'
        ).value =
            employee.address || '';


        document.getElementById(
            'employeeSalary'
        ).value =
            employee.salary || 0;


        document.getElementById(
            'employeeWorkTime'
        ).value =
            employee.work_time || '';


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


    } catch (error) {

        console.error(error);

        alert(
            'خطا در دریافت اطلاعات کارمند'
        );

    }

}



/* =========================
   غیرفعال کردن
========================= */

async function disableEmployee(id) {

    const confirmed =
        confirm(
            'آیا مطمئن هستید که می‌خواهید این کارمند غیرفعال شود؟'
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/employees/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'خطا در غیرفعال کردن کارمند'
            );

            return;

        }


        alert(
            'کارمند غیرفعال شد'
        );


        await loadEmployees();


    } catch (error) {

        console.error(error);

        alert(
            'خطا در غیرفعال کردن کارمند'
        );

    }

}



/* =========================
   فعال کردن
========================= */

async function enableEmployee(id) {

    try {

        const response =
            await fetch(
                `/api/employees/${id}/enable`,
                {
                    method: 'PUT'
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'خطا در فعال کردن کارمند'
            );

            return;

        }


        alert(
            'کارمند فعال شد'
        );


        await loadEmployees();


    } catch (error) {

        console.error(error);

        alert(
            'خطا در فعال کردن کارمند'
        );

    }

}



/* =========================
   جستجو
========================= */

searchInput.addEventListener(
    'input',
    () => {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        const filtered =
            employees.filter(
                employee => {

                    const fullName =
                        `${employee.first_name}
                         ${employee.last_name}`
                        .toLowerCase();


                    const phone =
                        (
                            employee.phone ||
                            ''
                        )
                        .toLowerCase();


                    return (

                        fullName.includes(
                            search
                        )

                        ||

                        phone.includes(
                            search
                        )

                    );

                }
            );


        displayEmployees(
            filtered
        );

    }
);



/* =========================
   حساب کارمند
========================= */

function employeeAccount(id) {

    window.location.href =
        `/employee-account.html?id=${id}`;

}



/* =========================
   شروع صفحه
========================= */

loadEmployees();