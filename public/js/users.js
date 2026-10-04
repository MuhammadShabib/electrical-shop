/* =====================================================
   مدیریت کاربران
===================================================== */

let users = [];


/* =========================
   عناصر صفحه
========================= */

const usersBody =
    document.getElementById('usersBody');

const userForm =
    document.getElementById('userForm');

const userId =
    document.getElementById('userId');

const userName =
    document.getElementById('userName');

const username =
    document.getElementById('username');

const userPassword =
    document.getElementById('userPassword');

const userRole =
    document.getElementById('userRole');

const userStatus =
    document.getElementById('userStatus');

const userFormTitle =
    document.getElementById('userFormTitle');

const saveUserBtn =
    document.getElementById('saveUserBtn');

const cancelEditUserBtn =
    document.getElementById(
        'cancelEditUserBtn'
    );

const usersMessage =
    document.getElementById('usersMessage');


/* =====================================================
   نام نقش
===================================================== */

function getRoleText(role) {

    const roles = {

        admin:
            'مدیر سیستم',

        seller:
            'شرکت',

        accountant:
            'حسابدار'

    };


    return (
        roles[role] ||
        role ||
        '-'
    );

}


/* =====================================================
   وضعیت کاربر
===================================================== */

function getStatusText(status) {

    return Number(status) === 1
        ? 'فعال'
        : 'غیرفعال';

}


/* =====================================================
   دریافت کاربران
===================================================== */

async function loadUsers() {

    try {

        usersMessage.textContent =
            'در حال دریافت کاربران...';


        const response =
            await fetch(
                '/api/users'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                'دریافت کاربران انجام نشد'
            );

        }


        users =
            result.data || [];


        renderUsers();


        usersMessage.textContent =
            '';


    } catch (error) {

        console.error(error);


        usersBody.innerHTML = `

            <tr>

                <td colspan="7">
                    ${
                        error.message ||
                        'خطا در دریافت کاربران'
                    }
                </td>

            </tr>

        `;


        usersMessage.textContent =
            error.message ||
            'خطا در دریافت کاربران';

    }

}


/* =====================================================
   نمایش کاربران
===================================================== */

function renderUsers() {

    usersBody.innerHTML =
        '';


    if (users.length === 0) {

        usersBody.innerHTML = `

            <tr>

                <td colspan="7">
                    هیچ کاربری ثبت نشده است
                </td>

            </tr>

        `;

        return;

    }


    users.forEach(
        (user, index) => {

            const row =
                document.createElement(
                    'tr'
                );


            const isActive =
                Number(
                    user.status
                ) === 1;


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${user.name || '-'}
                </td>

                <td>
                    ${user.username || '-'}
                </td>

                <td>
                    ${getRoleText(
                        user.role
                    )}
                </td>

                <td>
                    ${
                        getStatusText(
                            user.status
                        )
                    }
                </td>

                <td>
                    ${
                        user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleString(
                                'fa-IR'
                              )
                            : '-'
                    }
                </td>

                <td>

                    <div
                        class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editUser(${user.id})">

                            ✏️ ویرایش

                        </button>


                        <button
                            type="button"
                            class="${
                                isActive
                                    ? 'disable-btn'
                                    : 'enable-btn'
                            }"
                            onclick="toggleUserStatus(
                                ${user.id},
                                ${isActive ? 0 : 1}
                            )">

                            ${
                                isActive
                                    ? '🔴 غیرفعال'
                                    : '🟢 فعال'
                            }

                        </button>


                        <button
                            type="button"
                            class="account-btn"
                            onclick="changeUserPassword(
                                ${user.id}
                            )">

                            🔑 رمز

                        </button>


                        <button
                            type="button"
                            class="disable-btn"
                            onclick="deleteUser(
                                ${user.id}
                            )">

                            🗑 حذف

                        </button>

                    </div>

                </td>

            `;


            usersBody.appendChild(
                row
            );

        }
    );

}


/* =====================================================
   ایجاد کاربر جدید
===================================================== */

function resetUserForm() {

    userId.value =
        '';

    userName.value =
        '';

    username.value =
        '';

    userPassword.value =
        '';

    userRole.value =
        'seller';

    userStatus.value =
        '1';


    userFormTitle.textContent =
        'ایجاد کاربر جدید';


    saveUserBtn.textContent =
        '➕ ایجاد کاربر';


    cancelEditUserBtn.style.display =
        'none';

}


/* =====================================================
   ویرایش کاربر
===================================================== */

function editUser(id) {

    const user =
        users.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!user) {

        alert(
            'کاربر پیدا نشد'
        );

        return;

    }


    userId.value =
        user.id;


    userName.value =
        user.name || '';


    username.value =
        user.username || '';


    userPassword.value =
        '';


    userRole.value =
        user.role || 'seller';


    userStatus.value =
        Number(user.status) === 1
            ? '1'
            : '0';


    userFormTitle.textContent =
        'ویرایش کاربر';


    saveUserBtn.textContent =
        '💾 ذخیره تغییرات';


    cancelEditUserBtn.style.display =
        'inline-block';


    userForm.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

}


/* =====================================================
   ذخیره کاربر
===================================================== */

userForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        try {

            saveUserBtn.disabled =
                true;


            const editing =
                Boolean(
                    userId.value
                );


            const data = {

                name:
                    userName.value.trim(),

                username:
                    username.value.trim(),

                role:
                    userRole.value,

                status:
                    Number(
                        userStatus.value
                    )

            };


            /* =========================
               ایجاد کاربر
            ========================= */

            if (!editing) {

                const password =
                    userPassword.value;


                if (
                    password.length < 6
                ) {

                    alert(
                        'رمز عبور باید حداقل ۶ کاراکتر باشد'
                    );

                    return;

                }


                data.password =
                    password;


                const response =
                    await fetch(
                        '/api/users',
                        {

                            method:
                                'POST',

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

                    throw new Error(
                        result.message ||
                        'ایجاد کاربر انجام نشد'
                    );

                }


                alert(
                    'کاربر با موفقیت ایجاد شد'
                );

            }


            /* =========================
               ویرایش کاربر
            ========================= */

            else {

                const response =
                    await fetch(
                        `/api/users/${userId.value}`,
                        {

                            method:
                                'PUT',

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

                    throw new Error(
                        result.message ||
                        'ویرایش کاربر انجام نشد'
                    );

                }


                alert(
                    'اطلاعات کاربر با موفقیت ویرایش شد'
                );

            }


            resetUserForm();

            await loadUsers();


        } catch (error) {

            console.error(error);


            alert(
                error.message ||
                'خطا در ذخیره کاربر'
            );

        } finally {

            saveUserBtn.disabled =
                false;

        }

    }
);


/* =====================================================
   لغو ویرایش
===================================================== */

cancelEditUserBtn.addEventListener(
    'click',
    function () {

        resetUserForm();

    }
);


/* =====================================================
   تغییر وضعیت کاربر
===================================================== */

async function toggleUserStatus(
    id,
    status
) {

    const user =
        users.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!user) {

        return;

    }


    const action =
        Number(status) === 1
            ? 'فعال'
            : 'غیرفعال';


    const confirmed =
        confirm(
            `آیا کاربر "${user.name}" ${action} شود؟`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/users/${id}/status`,
                {

                    method:
                        'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({
                            status
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
                'تغییر وضعیت انجام نشد'
            );

        }


        await loadUsers();


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            'خطا در تغییر وضعیت کاربر'
        );

    }

}


/* =====================================================
   تغییر رمز
===================================================== */

async function changeUserPassword(
    id
) {

    const user =
        users.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!user) {

        return;

    }


    const password =
        prompt(
            `رمز جدید برای "${user.name}" را وارد کنید:`
        );


    if (
        password === null
    ) {

        return;

    }


    if (
        password.length < 6
    ) {

        alert(
            'رمز عبور باید حداقل ۶ کاراکتر باشد'
        );

        return;

    }


    const confirmed =
        confirm(
            'آیا از تغییر رمز این کاربر مطمئن هستید؟'
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/users/${id}/password`,
                {

                    method:
                        'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({
                            password
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
                'تغییر رمز انجام نشد'
            );

        }


        alert(
            'رمز عبور با موفقیت تغییر کرد'
        );


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            'خطا در تغییر رمز'
        );

    }

}


/* =====================================================
   حذف کاربر
===================================================== */

async function deleteUser(
    id
) {

    const user =
        users.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!user) {

        return;

    }


    const confirmed =
        confirm(
            `هشدار!\n\nآیا از حذف کاربر "${user.name}" مطمئن هستید؟`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/users/${id}`,
                {
                    method:
                        'DELETE'
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
                'حذف کاربر انجام نشد'
            );

        }


        alert(
            'کاربر با موفقیت حذف شد'
        );


        resetUserForm();

        await loadUsers();


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            'خطا در حذف کاربر'
        );

    }

}


/* =====================================================
   شروع
===================================================== */

resetUserForm();

loadUsers();