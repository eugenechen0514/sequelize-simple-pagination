const _ = require('lodash');

/**
 * @typedef {Object} SequelizePaginationResult
 * @property {array} entities - the results of the query
 * @property {number} pageIndex - page index
 * @property {number} pageCount - page count(total page amount)
 * @property {number} pageSize - page size for one page
 * @property {number} count - all entities for a model
 * @property [where] - the `where` parameter of `findAll`
 * @property {array} orders - the `orders` parameter of `findAll`
 * @property [attributes] - the `attributes` parameter of `findAll`
 * @property [include] - the `include` parameter of `findAll`
 */


/**
 *
 * @param {string} [methodName] - the name of the pagination method. Default: `paginate`
 * @param {string} [primaryKeyField] - the primary key field of the model. Default: `id`
 * @param {boolean} [oneBaseIndex] - page index base. Page index starts from 1 if `true`. Default: `false`
 * @param {number} [pageSize] Default: 1
 * @param [where] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [where](http://docs.sequelizejs.com/manual/tutorial/querying.html#where)
 * @param {array} [orders] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and add a primary key to [order](http://docs.sequelizejs.com/manual/tutorial/querying.html#ordering)
 * @param [attributes] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [attributes](http://docs.sequelizejs.com/manual/tutorial/querying.html#attributes)
 * @param [include] the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [include](http://docs.sequelizejs.com/manual/tutorial/querying.html#relations-associations)
 * @return {function(model)}
 * @example withPagination(options)(Model);
 */
function withPagination({methodName = 'paginate', primaryKeyField = 'id', oneBaseIndex = false, pageSize: __pageSize = 1, where: _where = undefined, orders: _orders = [], attributes: _attributes = undefined, include: _include = undefined} = {}) {
    let __pageIndex = 0;
    if(oneBaseIndex) {
        __pageIndex = 1;
    }

    return model => {
        /**
         *
         * @param primaryDesc primary key desc order. Default: false
         * @param {number} [pageSize]
         * @param {number} [pageIndex]
         * @param [where] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [where](http://docs.sequelizejs.com/manual/tutorial/querying.html#where)
         * @param {array} [orders] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and add a primary key to [order](http://docs.sequelizejs.com/manual/tutorial/querying.html#ordering)
         * @param [attributes] - the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [attributes](http://docs.sequelizejs.com/manual/tutorial/querying.html#attributes)
         * @param [include] the query applied to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and pass value directly to [include](http://docs.sequelizejs.com/manual/tutorial/querying.html#relations-associations)
         * @return {Promise<SequelizePaginationResult>}
         */
        const paginate = ({primaryDesc = false, pageSize = __pageSize, pageIndex = __pageIndex, where = _where, orders = _orders, attributes = _attributes, include = _include} = {}) => {

            let zeroBasePageIndex = pageIndex;
            if (oneBaseIndex)
                zeroBasePageIndex = pageIndex - 1;
            if (zeroBasePageIndex < 0) {
                return Promise.reject(new Error(`page index under zero-base < 1: pageIndex = ${pageIndex} zeroBasePageIndex = ${zeroBasePageIndex}`))
            }

            // findAllQueryObject
            let findAllQueryObject = {};


            // order of findAll
            let ordersArray = orders;
            const paginationFieldIsNonId = (ordersArray.filter(order => order[0] === primaryKeyField)).length === 0;
            if (paginationFieldIsNonId) {
                ordersArray.push([primaryKeyField, ...(primaryDesc ? ['desc'] : ['asc'])]);
            }
            findAllQueryObject.order = ordersArray;

            // include of findAll
            if (include)
                findAllQueryObject.include = include;


            // where of findAll
            if (where)
                findAllQueryObject.where = where;


            // attributes of findAll
            if (attributes)
                findAllQueryObject.attributes = attributes;

            // pagination(offset, pageSize) of findAll
            findAllQueryObject.offset = zeroBasePageIndex * pageSize;
            findAllQueryObject.limit = pageSize;

            // exec
            return model.count({
                where: findAllQueryObject.where,
                include: findAllQueryObject.include,
            })
                .then(size => {
                    const pageCount = _.ceil(size / pageSize);
                    return model.findAll(findAllQueryObject)
                        .then(results => {
                            return {
                                entities: results,
                                pageIndex: oneBaseIndex ? zeroBasePageIndex + 1 : zeroBasePageIndex,
                                count: size,
                                pageSize,
                                pageCount,
                                where,
                                orders,
                                attributes,
                                include,
                            };
                        });
                });
        };

        model[methodName] = paginate;
    };
}

module.exports = withPagination;
