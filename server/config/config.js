module.exports = {
  "development": {
    "storage": "./server/dev_db.sqlite",
    "dialect": "sqlite"
  },
  "test": {
    "storage": "./server/test_db.sqlite",
    "dialect": "sqlite"
  },
  "production": {
    "storage": "./server/prod_db.sqlite",
    "dialect": "sqlite"
  }
}
