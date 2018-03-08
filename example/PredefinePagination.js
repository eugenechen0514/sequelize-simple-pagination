const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });

const withPagination = require('../lib/sequelize-pagination');

const Article = sequelize.define('Article', {
    id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: Sequelize.STRING,
    inactive: { type:  Sequelize.BOOLEAN, defaultValue: false },
    attachment: Sequelize.STRING,
});

withPagination({
    pageSize: 3,                            // Fix page size
    where: {inactive: false},               // Paginate active articles
    attributes: {exclude: ['attachment']}   // Exclude 'attachment' attribute
})(Article);

function generateTestData() {
    return Promise.all([
        Article.create({ id: 1, title: 'title1', attachment: 'big data, do not read'}),
        Article.create({ id: 2, title: 'title2', inactive: true}),
        Article.create({ id: 3, title: 'title3'}),
        Article.create({ id: 4, title: 'title4'}),
        Article.create({ id: 5, title: 'title5'}),
    ]);
}

function printArticles(result) {
    result.entities.forEach(entity => {
        console.log(`id = ${entity.id}, title = ${entity.title}, attachment = ${entity.attachment}`)
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

