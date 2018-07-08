/**
 *
 * @param {SequelizePaginationResult} data
 * @return
 * @private
 */
const __defaultAfterFunction = data => data;


/**
 *
 * @param {string} paginateMethod
 * @param {function(SequelizePaginationResult)} afterPaginationFunction
 * @return {function}
 */
function withPaginationHook({paginateMethod = 'paginate', afterPaginationFunction = __defaultAfterFunction}) {
    return model => {
        const _orgPaginateFunction = model[paginateMethod];
        const hookedPaginate = (...args) => {
            return _orgPaginateFunction(...args)
                .then(result => {
                    return afterPaginationFunction(result);
                })
        };
        model[paginateMethod] = hookedPaginate;
    };
}

module.exports = {
    withPaginationHook,
};
