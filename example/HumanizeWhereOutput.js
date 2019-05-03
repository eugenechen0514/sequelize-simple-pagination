const path = require('path');
const assert = require('assert');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;
const withPagination = require('../lib/sequelize-pagination');
const {withPaginationHook} = require('../lib/utilities');

////////////////////////////////////////
// Humanize-Where helper
////////////////////////////////////////

// Dictionary for translate the symbol operators to human representation
const humanizeOp = {
    [Op.not]: 'not',
    [Op.is]: 'is',
    [Op.and]: 'and',
    [Op.or]: 'or',
    [Op.eq]: 'equal',
    [Op.gt]: 'greater then',
    [Op.gte]: 'greater then or equal',
    [Op.lt]: 'less then',
    [Op.lte]: 'less then or equal',
    [Op.between]: 'between',
    [Op.notBetween]: 'not between',
    [Op.in]: 'in',
    [Op.notIn]: 'not in',

    [Op.like]: 'like',
    [Op.notLike]: 'like',
    [Op.startsWith]: 'starts with',
    [Op.endsWith]: 'ends with',
};

/**
 * @description Method responsible to process the values of `where` object (recursively), this method
 *  is only used by `humanizeWhere` method.
 * @param {*} valueItm Value to be processed
 */
const processValue = valueItm => {
    if (valueItm !== null && valueItm !== undefined) {
        if (typeof(valueItm) === 'object' && typeof(valueItm.length) !== 'undefined') {
            return valueItm.map(processValue);
        } else if (typeof(valueItm) === 'object') {
            return humanizeWhere(valueItm);
        } else {
            return valueItm;
        }
    } else {
        return valueItm;
    }
};

/**
 * @description Method responsible for serializing the `where` parameter to another object with humanized
 *  texts because in` sequelize` v5 the operators were implemented as symbols.
 * @param {Object} where The `where` parameter of `findAll`
 */
const humanizeWhere = (where) => {
    if (where) {
        const symbols = Object.getOwnPropertySymbols(where);
        const keys = Object.keys(where);
        return [...keys, ...symbols].reduce((newWhere, key, index) => {
            const value = where[key];
            const newKey = typeof(key) === 'symbol' ? humanizeOp[key] || `<unknown${index}>` : key;
            newWhere[newKey] = processValue(value);
            return newWhere;
        },{});
    } else {
        return where;
    }
};

////////////////////////////////////////
// Init model
////////////////////////////////////////
const sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });


const Test = sequelize.define('test', {
    id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    counter: Sequelize.INTEGER,
});

// Mount for "Test.pagination()"
withPagination()(Test); //

// Mount for "Test.paginateHumanize()"
withPagination({
    methodName: 'paginateHumanize'
})(Test);
withPaginationHook({
    paginateMethod: 'paginateHumanize',
    afterPaginationFunction: (data) => {
        if(data.where) {
            data.where = humanizeWhere(data.where);
        }
        return data;
    }
})(Test);

////////////////////////////////////////
// Demo helper
////////////////////////////////////////

function generateTestData() {
    return Promise.all([
        Test.create({ counter: 4, id: 1 }),
        Test.create({ counter: 4, id: 2 }),
        Test.create({ counter: 1, id: 3 }),
        Test.create({ counter: 3, id: 4 }),
        Test.create({ counter: 2, id: 5 }),
    ]);
}

////////////////////////////////////////
// Demo
////////////////////////////////////////

(async () => {
    await sequelize.sync({ force: true });
    await generateTestData();

    const pagination1 = await Test.paginate({
        where: {
            counter: {
                [Op.or]: {
                    [Op.gt]: 3,
                    [Op.eq]: 1,
                }
            }
        },
        pageSize: 100, // list all entities
    });
    assert(pagination1.entities.length === 3, 'the size of entities should be 3 when "counter = 1 or counter > 3"');
    console.log('org "where" => \n', pagination1.where);

    const pagination2 = await Test.paginateHumanize({
        where: {
            counter: {
                [Op.or]: {
                    [Op.gt]: 3,
                    [Op.eq]: 1,
                }
            }
        },
        pageSize: 100, // list all entities
    });
    assert(pagination2.entities.length === 3, 'the size of entities should be 3 when "counter = 1 or counter > 3"');
    console.log('new "where" => \n', pagination2.where);
})()
    .then(() => {
        console.log('done');
    })
    .catch(console.error);
