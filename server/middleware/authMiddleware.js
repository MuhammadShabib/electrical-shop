/* =====================================================
   Middleware احراز هویت
===================================================== */

function requireAuth(req, res, next) {

    if (
        !req.session ||
        !req.session.user
    ) {

        return res.status(401).json({

            success: false,

            message:
                'برای استفاده از این بخش باید وارد سیستم شوید'

        });

    }


    next();

}


/* =====================================================
   Middleware بررسی نقش
===================================================== */

function requireRole(...allowedRoles) {

    return function (req, res, next) {

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.status(401).json({

                success: false,

                message:
                    'برای استفاده از این بخش باید وارد سیستم شوید'

            });

        }


        const userRole =
            req.session.user.role;


        if (
            !allowedRoles.includes(
                userRole
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'شما اجازه دسترسی به این بخش را ندارید'

            });

        }


        next();

    };

}


/* =====================================================
   فقط مدیر سیستم
===================================================== */

function requireAdmin(
    req,
    res,
    next
) {

    return requireRole(
        'admin'
    )(
        req,
        res,
        next
    );

}


/* =====================================================
   صادرات
===================================================== */

module.exports = {

    requireAuth,

    requireRole,

    requireAdmin

};