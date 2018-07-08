[![Build Status](https://travis-ci.org/eugenechen0514/sequelize-simple-pagination.svg?branch=master)](https://travis-ci.org/eugenechen0514/sequelize-simple-pagination)

# Sequelize Simple Pagination

Add a method on a sequelize model for pagination queries

The project is inspired by [sequelize-cursor-pagination](https://www.npmjs.com/package/sequelize-cursor-pagination)

## Quick start

Define a sequelize model and add a pagination method:

```javascript
// Define a model
const withPagination = require('sequelize-simple-pagination');

const Counter = sequelize.define('counter', {
  id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  value: Sequelize.INTEGER,
});

const options = {
  methodName: 'paginate', // the name of the pagination method
  primaryKey: 'id',       // the primary key field of the model
};

// Add a pagination method for the model
withPagination(options)(Counter);
```


Call the `paginate` (default method name) method:
```javascript
Counter.paginate({
  pageIndex: 0,
  pageSize: 10,
})
.then(pagination => {
    console.log(pagination.entities)
})
```

The `paginate` method returns a promise with resolve data of `SequelizePaginationResult` type.


## Use examples

### Predefine pagination configuration

```javascript
withPagination({
    pageSize: 3,                            // Fix page size
})(Counter);
```

[example/PredefinePagination.js](example/PredefinePagination.js)


### Custom pagination

Create a pagination with orderBy, order options

```javascript
async function paginateCounter(options) {
    const {orderBy, order, ...others} = options;
    const result = await Counter.paginate({
        orders: [[orderBy, order]],
        ...others,
    });
    return {orderBy, order, ...result};
}
```

[example/CustomPagination-OrderBy.js](example/CustomPagination-OrderBy.js)

### Pagination hook

Alter the resolve data after pagination completion by the hook `afterPaginationFunction()`

```javascript
const {withPaginationHook} = require('sequelize-simple-pagination/util');

withPaginationHook({
    afterPaginationFunction: (data) => {
        // Alter data ...
        data.queriedDate = new Date();
        return data;
    }
})(Counter);

Counter.paginate()
    .then(data => {
        console.log(`Pagination completion: ${data.queriedDate}`)
    })
```

[example/CustomPagination-OrderBy.js](example/CustomOutput.js)


## API

### Module: **sequelize-simple-pagination**
#### withPagination(options) -  for adding pagination method
`withPagination()` decorates sequelize models by a pagination function (default: paginate()).

`options` is an object with following properties:
* **methodName**: the name of the pagination method. Default: `paginate`
* **primaryKey**: the primary key field of the model. Default: `id`
* **oneBaseIndex**: page index base. Pag index starts from 0 if `oneBaseIndex` is `false`. Page index starts from 1 if `oneBaseIndex` is `true`. Default: `false`
* **pageSize**: Default: 1
* **where**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [where](http://docs.sequelizejs.com/manual/tutorial/querying.html#where)
* **orders**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and adds a primary key to [order](http://docs.sequelizejs.com/manual/tutorial/querying.html#ordering)
* **attributes**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [attributes](http://docs.sequelizejs.com/manual/tutorial/querying.html#attributes)
* **include**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [include](http://docs.sequelizejs.com/manual/tutorial/querying.html#relations-associations)


### Module: **sequelize-simple-pagination/util**
#### withPaginationHook({paginateMethod, afterPaginationFunction}) - hook functions

* **paginateMethod**:  pagination method. Default: paginate
* **afterPaginationFunction**: Alter the resolve data after pagination completion

### Pagination query
#### paginate(options) - execute a pagination query (suppose `options.methodName` is `paginate`)

`options` is an object with following properties:
* **primaryDesc**: primary key desc order. Default: false
* **pageSize**: Default: 1
* **pageIndex**: Pag index starts from 0 if oneBaseIndex is `false`. Page index starts from 1 if oneBaseIndex is`true`.
* **where**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [where](http://docs.sequelizejs.com/manual/tutorial/querying.html#where)
* **orders**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and adds a primary key to [order](http://docs.sequelizejs.com/manual/tutorial/querying.html#ordering)
* **attributes**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [attributes](http://docs.sequelizejs.com/manual/tutorial/querying.html#attributes)
* **include**: the query applies to [findAll](http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-findall-search-for-multiple-elements-in-the-database) and passes value directly to [include](http://docs.sequelizejs.com/manual/tutorial/querying.html#relations-associations)

return a promise with resolve data of `SequelizePaginationResult` type.

### Type
#### SequelizePaginationResult - pagination resolve data

`SequelizePaginationResult` is an object type with following properties:
* **entities** the results of the query
* **pageIndex** page index
* **pageCount** page count(total page amount)
* **pageSize** page size for one page
* **count** all entities for a model
* **where** the `where` parameter of `findAll`
* **orders** the `orders` parameter of `findAll`
* **attributes** the `attributes` parameter of `findAll`
* **include** the `include` parameter of `findAll`

## Run tests

```
npm run test
```
