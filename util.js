const faker = require('faker');

const generateUser = ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  department,
  createdAt = new Date()
} = {}) => ({
  firstName,
  lastName,
  department,
  createdAt
});

const generateArticle = ({
    name = faker.random.word(),
    description = faker.random.words(6),
    type,
    tags = [],
    createdAt = new Date()
} = {}) => ({
    name,
    description,
    type,
    tags,
    createdAt
});

module.exports = {
  mapUser: generateUser,
  mapArticle: generateArticle,
  getRandomFirstName: () => faker.name.firstName()
};
