const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });

const withPagination = require('../lib/sequelize-pagination');
const {withPaginationHook} = require('../lib/utilities');

const Article = sequelize.define('Article', {
    id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: Sequelize.STRING,
});


// Mount pagination function
const withPaginationArticle = withPagination({
    pageSize: 3,
})(Article);

// Hook 'afterPaginationFunction' function
withPaginationHook({
    afterPaginationFunction: (data) => {
        // Change title value
        data.entities.forEach(entity => {
            entity.title = `${entity.id} => ${entity.title}`
        });
        return data;
    }
})(withPaginationArticle);

function generateTestData() {
    return Promise.all([
        Article.create({ id: 1, title: 'title1'}),
        Article.create({ id: 2, title: 'title2'}),
        Article.create({ id: 3, title: 'title3'}),
        Article.create({ id: 4, title: 'title4'}),
        Article.create({ id: 5, title: 'title5'}),
    ]);
}

function printArticles(result) {
    result.entities.forEach(entity => {
        console.log(`id = ${entity.id}, title = ${entity.title}`)
    });
}


async function paginateArticles(options) {
    // Create date
    await Article.sync({ force: true });
    await generateTestData();

    // Custom pagination
    return await Article.paginate(options);
}

paginateArticles()
    .then(printArticles)
    .catch(console.error);

