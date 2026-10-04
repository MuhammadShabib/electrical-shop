/* =====================================================
   ورود به سیستم
===================================================== */


/* =========================
   عناصر صفحه
========================= */

const loginForm =
    document.getElementById(
        'loginForm'
    );

const usernameInput =
    document.getElementById(
        'username'
    );

const passwordInput =
    document.getElementById(
        'password'
    );

const loginBtn =
    document.getElementById(
        'loginBtn'
    );

const loginMessage =
    document.getElementById(
        'loginMessage'
    );

const loginSystemTitle =
    document.getElementById(
        'loginSystemTitle'
    );


/* =========================
   نمایش پیام
========================= */

function showMessage(
    message,
    type = 'error'
) {

    loginMessage.textContent =
        message;


    loginMessage.className =
        'login-message';


    if (type === 'success') {

        loginMessage.classList.add(
            'login-success'
        );

    } else {

        loginMessage.classList.add(
            'login-error'
        );

    }

}


/* =====================================================
   دریافت نام سیستم
===================================================== */

async function loadLoginSettings() {

    try {

        const response =
            await fetch(
                '/api/settings'
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            return;

        }


        const settings =
            result.data || {};


        if (
            loginSystemTitle &&
            settings.shop_name
        ) {

            loginSystemTitle.textContent =
                settings.shop_name;

        }

    } catch (error) {

        console.error(
            'Login settings error:',
            error
        );

    }

}


/* =====================================================
   بررسی اینکه قبلاً وارد شده یا نه
===================================================== */

async function checkCurrentUser() {

    try {

        const response =
            await fetch(
                '/api/auth/me'
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success
        ) {

            window.location.href =
                '/';

        }

    } catch (error) {

        console.error(
            'Session check error:',
            error
        );

    }

}


/* =====================================================
   ورود
===================================================== */

loginForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (!username) {

            showMessage(
                'نام کاربری را وارد کنید'
            );

            usernameInput.focus();

            return;

        }


        if (!password) {

            showMessage(
                'رمز عبور را وارد کنید'
            );

            passwordInput.focus();

            return;

        }


        try {

            loginBtn.disabled =
                true;


            loginBtn.textContent =
                'در حال ورود...';


            showMessage(
                'در حال بررسی اطلاعات...',
                'success'
            );


            const response =
                await fetch(
                    '/api/auth/login',
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                username,

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
                    'ورود انجام نشد'
                );

            }


            showMessage(
                'ورود با موفقیت انجام شد. در حال انتقال...',
                'success'
            );


            window.location.href =
                '/';


        } catch (error) {

            console.error(
                'Login error:',
                error
            );


            showMessage(
                error.message ||
                'خطا در ورود به سیستم'
            );

        } finally {

            loginBtn.disabled =
                false;


            loginBtn.textContent =
                '🔐 ورود به سیستم';

        }

    }
);


/* =====================================================
   شروع
===================================================== */

loadLoginSettings();

checkCurrentUser();