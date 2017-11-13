module.exports = {
    development: {
        storage: './database/dev_db.sqlite',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialect: 'sqlite'
    },
    test: {
        storage: './database/test_db.sqlite',
        dialect: 'sqlite'
    },
    production: {
        storage: './database/prod_db.sqlite',
        dialect: 'sqlite'
    }
};
