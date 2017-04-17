module.exports = {
  "development": {
    "storage": "./database/dev_db.sqlite",
    "dialect": "sqlite"
  },
  "test": {
    "storage": "./database/test_db.sqlite",
    "dialect": "sqlite"
  },
  "production": {
    "storage": "./database/prod_db.sqlite",
    "dialect": "sqlite"
  }
}
