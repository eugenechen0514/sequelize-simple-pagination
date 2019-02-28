const path = require('path');
const Sequelize = require('sequelize');
const chai = require('chai');
chai.should();
const expect = chai.expect;
const assert = chai.assert;


const sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });

const withPagination = require('../lib/sequelize-pagination');

const Test = sequelize.define('test', {
    id: { type:  Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    counter: Sequelize.INTEGER,
});

withPagination()(Test);

withPagination({methodName: 'paginateZeroBase', oneBaseIndex: true})(Test);

function generateTestData() {
    return Promise.all([
        Test.create({ counter: 4, id: 1 }),
        Test.create({ counter: 4, id: 2 }),
        Test.create({ counter: 1, id: 3 }),
        Test.create({ counter: 3, id: 4 }),
        Test.create({ counter: 2, id: 5 }),
    ]);
}

beforeEach(() => sequelize.sync({ force: true }));

test('set the correct default method', () => {
    expect(typeof Test.paginate).to.eql('function');
});

test('paginates correctly when paginationField is primaryKeyField', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ pageSize: 2 });
    pagination.should.have.property('entities').with.lengthOf(2);
    pagination.entities[0].should.have.property('id').with.eql(1);
    pagination.entities[1].should.have.property('id').with.eql(2);
    pagination.should.have.property('pageIndex').with.eql(0);
    pagination.should.have.property('pageSize').with.eql(2);
    pagination.should.have.property('pageCount').with.eql(3);
    pagination.should.have.property('count').with.eql(5);


    pagination = await Test.paginate({ pageSize: 2, pageIndex: 1 });
    pagination.should.have.property('entities').with.lengthOf(2);
    pagination.entities[0].should.have.property('id').with.eql(3);
    pagination.entities[1].should.have.property('id').with.eql(4);
    pagination.should.have.property('pageIndex').with.eql(1);
    pagination.should.have.property('pageSize').with.eql(2);
    pagination.should.have.property('pageCount').with.eql(3);
    pagination.should.have.property('count').with.eql(5);


    pagination = await Test.paginate({ pageSize: 2, pageIndex: 2 });
    pagination.should.have.property('entities').with.lengthOf(1);
    pagination.entities[0].should.have.property('id').with.eql(5);
    pagination.should.have.property('pageIndex').with.eql(2);
    pagination.should.have.property('pageSize').with.eql(2);
    pagination.should.have.property('pageCount').with.eql(3);
    pagination.should.have.property('count').with.eql(5);

});

test('paginates correctly when pageIndex exceed the max index', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ pageSize: 2, pageIndex: 3 });
    pagination.should.have.property('entities').with.lengthOf(0);
    pagination.should.have.property('pageIndex').with.eql(3);
    pagination.should.have.property('pageSize').with.eql(2);
    pagination.should.have.property('pageCount').with.eql(3);
});

test('paginates correctly when sort direction is descending', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ pageSize: 2, orders: [['id', 'desc']] });
    pagination.entities[0].should.have.property('id').with.eql(5);
    pagination.entities[1].should.have.property('id').with.eql(4);


    pagination = await Test.paginate({ pageSize: 2, pageIndex: 1, orders: [['id', 'desc']] });
    pagination.entities[0].should.have.property('id').with.eql(3);
    pagination.entities[1].should.have.property('id').with.eql(2);


    pagination = await Test.paginate({ pageSize: 2, pageIndex: 2, orders: [['id', 'desc']] });
    pagination.entities[0].should.have.property('id').with.eql(1);
});


test('paginates correctly when paginationField is not the primaryKeyField', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ pageSize: 2, orders: [['counter']] });
    pagination.entities[0].should.include({counter: 1, id: 3});
    pagination.entities[1].should.include({counter: 2, id: 5});


    pagination = await Test.paginate({ pageSize: 2, pageIndex: 1, orders: [['counter']] });
    pagination.entities[0].should.include({counter: 3, id: 4});
    pagination.entities[1].should.include({counter: 4, id: 1});

    pagination = await Test.paginate({ pageSize: 2, pageIndex: 2, orders: [['counter']] });
    pagination.entities[0].should.include({counter: 4, id: 2});
});

test('paginates correctly when paginationField is not the primaryKeyField and primaryDesc = true', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ primaryDesc:true, pageSize: 2, pageIndex: 2, orders: [['counter']] });
    pagination.entities[0].should.include({counter: 4, id: 1});
});

test('paginates correctly when findAll attributes are provided', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginate({ pageSize: 2, attributes: ['id']});
    pagination.entities[0].should.property('id', 1);
    pagination.entities[0].should.property('counter', undefined);
});

test('paginates with base zero correctly', async () => {
    const data = await generateTestData();

    let pagination = await Test.paginateZeroBase({ pageSize: 2});
    pagination.should.have.property('pageIndex').with.eql(1);
    pagination.entities[0].should.property('id', 1);
    pagination.entities[1].should.property('id', 2);


    pagination = await Test.paginateZeroBase({ pageSize: 2, pageIndex: 2});
    pagination.should.have.property('pageIndex').with.eql(2);
    pagination.entities[0].should.property('id', 3);
    pagination.entities[1].should.property('id', 4);


    pagination = await Test.paginateZeroBase({ pageSize: 2, pageIndex: 3});
    pagination.should.have.property('pageIndex').with.eql(3);
    pagination.entities[0].should.property('id', 5);
});

//TODO: Implement test cases to cover the `humanizeWhere` method behavior