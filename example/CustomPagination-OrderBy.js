const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });

const withPagination = require('../lib/sequelize-pagination');

const Article = sequelize.define('Article', {
    id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: Sequelize.STRING,
});

withPagination()(Article); // Fix page size

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
    const {orderBy, order, ...others} = options;

    // Create date
    await Article.sync({ force: true });
    await generateTestData();

    // Custom pagination
    const result = await Article.paginate({
        orders: [[orderBy, order]],
        ...others,
    });
    return {
        orderBy,
        order,
        ...result,
    }
}

paginateArticles({orderBy: 'title', order: 'DESC', pageSize: 2})
    .then(printArticles)
    .catch(console.error);

