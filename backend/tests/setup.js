const mongoose = require('mongoose');
const env = require('../src/config/env');

const buildTestUri = (uri) => uri.replace(/\/([^/?]+)(\?.*)?$/, '/$1_test$2');

beforeAll(async () => {
  await mongoose.connect(buildTestUri(env.MONGODB_URI));
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
