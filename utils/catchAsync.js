//The catchAsync() function is only adding functionality to a function, WITHOUT executing it, that is, it received a function, added something to it, and then returned the 'powered version' of that function. But, when that function should be executed, it's still up to Express to decide. So here, the only thing which is being added is a .catch() 'power-up'.
//IMP: This is only temperory. When express 5 is released, all this nonsense can be skipped and error can be handled directly for async functions.

module.exports= fn => {
    return function (req, res, next) {
        fn(req, res, next).catch((e) => next(e));
    };
}