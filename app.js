'use strict'

const { mapUser, getRandomFirstName, mapArticle } = require('./util');

// db connection and settings
const connection = require('./config/connection')
const fs = require("fs");
let userCollection, studentCollection, articleCollection;
run();

async function run() {
  await connection.connect();
  await connection.get().dropCollection('users');
  await connection.get().dropCollection('articles');
  await connection.get().dropCollection('students');
  await connection.get().createCollection('users');
  await connection.get().createCollection('articles');
  await connection.get().createCollection('students');
  userCollection = connection.get().collection('users');
  articleCollection = connection.get().collection('articles');
  studentCollection = connection.get().collection('students');

  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  await example7();
  await example8();
  await example9();
  await example10();
  await example11();
  await example12();
  await example13();
  await example14();
  // await example15();
  await example16();
  await example17();
  await connection.close();
}

// #### Users

// - Create 2 users per department (a, b, c)

async function example1() {

  try {
    let usersCount = 0;

    for (const dep of ["a", "b", "c"]) {
      const users = await userCollection.insertMany([
        mapUser({department: dep}),
        mapUser({department: dep})
      ]);
      usersCount += users.insertedCount;
    }
    console.log(`${usersCount} users were inserted`);
  } catch (err) {
    console.error(err);
  }
}

// - Delete 1 user from department (a)

async function example2() {
  try {
    const query = {
      department: "a"
    };
    const result = await userCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      console.log("Successfully deleted one document.");
    } else {
      console.log("No documents matched the query. Deleted 0 documents.");
    }
  } catch (err) {
    console.error(err);
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    const filter = {
      department: "b"
    };
    const updateUser = {
      $set: {
        firstName: getRandomFirstName()
      },
    };

    const result = await userCollection.updateMany(filter, updateUser);
    console.log(`Updated ${result.modifiedCount} users`);
  } catch (err) {
    console.error(err);
  }
}

// - Find all users from department (c)

async function example4() {
  try {
    const query = {
      department: "c"
    };
    const users = await userCollection.find(query).toArray();

    if (users.length === 0) {
      console.log("No users found!");
    } else {
      console.log(`Found ${users.length} users from department (c)`);
    }
  } catch (err) {
    console.error(err);
  }
}

// #### Articles

// - Create 5 articles per each type (a, b, c)

async function example5() {
  try {
    let articlesCount = 0;

    for (const type of ['a', 'b', 'c']) {
      const articles = Array.apply(null, new Array(5))
          .map(() => mapArticle({type: type}));

      const chunk = await articleCollection.insertMany(articles);
      articlesCount += chunk.insertedCount;
    }
    console.log(`${articlesCount} articles were inserted`);
  } catch (err) {
    console.error(err);
  }
}

// - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]

async function example6() {
  try {
    const filter = {
      type: "a"
    };
    const updateArticle = {
      $set: {
        tags: ['tag1-a', 'tag2-a', 'tag3']
      },
    };

    const result = await articleCollection.updateMany(filter, updateArticle);
    console.log(`Updated ${result.modifiedCount} articles`);
  } catch (err) {
    console.error(err);
  }
}

// - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a

async function example7() {
  try {
    const filter = {
      type: { $ne: "a" }
    };
    const updateArticle = {
      $set: {
        tags: ['tag2', 'tag3', 'super']
      },
    };

    const result = await articleCollection.updateMany(filter, updateArticle);
    console.log(`Updated ${result.modifiedCount} articles`);
  } catch (err) {
    console.error(err);
  }
}

// - Find all articles that contains tags [tag2, tag1-a]

async function example8() {
  try {
    const query = {
      tags: { $in: ["tag2", "tag1-a"] }
    };
    const articles = await articleCollection.find(query).toArray();

    if (articles.length === 0) {
      console.log("No articles found!");
    } else {
      console.log(`Found ${articles.length} articles with tags [tag2, tag1-a]`);
    }
  } catch (err) {
    console.error(err);
  }
}

// - Pull [tag2, tag1-a] from all articles

async function example9() {
  try {
    const filter = {};
    const updateArticle = {
      $pull: {
        tags: { $in: ["tag2", "tag1-a"] }
      },
    };

    const result = await articleCollection.updateMany(filter, updateArticle);
    console.log(`Updated ${result.modifiedCount} articles`);
  } catch (err) {
    console.error(err);
  }
}

// #### Students

// - Import all data from students.json into student collection

async function example10() {
  const fs = require('fs');
  const path = './students.json';

  try {
    const studentsArr = JSON.parse(fs.readFileSync(path, 'utf-8'));

    const students = await studentCollection.insertMany(studentsArr);

    console.log(`${students.insertedCount} students were inserted`);
  } catch (err) {
    console.error(err);
  }
}

// - Find all students who have the worst score for homework, sort by descent

async function example11() {
  try {
    const worstScoreBound = 40;
    const pipeline = [
      { $match : { scores: { $elemMatch: { type: 'homework', score: { $lte: worstScoreBound } } } } },
      { $project: { _id: 0, name: 1, homework: { $arrayElemAt: ['$scores.score', -1] } } },
      { $sort: { homework: -1 } },
    ];

    const result = await studentCollection.aggregate(pipeline).toArray();
    console.log(`${result.length} satisfy criteria [worst - homework].`);
    // console.log(result);

  } catch (err) {
    console.error(err);
  }
}

// - Find all students who have the best score for quiz and the worst for homework, sort by ascending

async function example12() {
  try {
    const worstScoreBound = 40;
    const bestScoreBound = 80;
    const pipeline = [
      { $match : { scores: { $elemMatch: { type: 'homework', score: { $lte: worstScoreBound } } } } },
      { $match : { scores: { $elemMatch: { type: 'quiz', score: { $gte: bestScoreBound } } } } },
      { $project: {
          _id: 0,
          name: 1,
          homework: { $arrayElemAt: ["$scores.score", -1] },
          quiz: { $arrayElemAt: ["$scores.score", 1] }
      }},
      { $sort: { quiz: 1, homework: 1 } },
    ];

    const result = await studentCollection.aggregate(pipeline).toArray();
    console.log(`${result.length} satisfy criteria [worst - homework, best - quiz]`);
    // console.log(result);

  } catch (err) {
    console.error(err);
  }
}

// - Find all students who have best score for quiz and exam

async function example13() {
  try {
    const bestScoreBound = 80;

    const pipeline = [
      { $match : { scores: { $elemMatch: { type: 'exam', score: { $gte: bestScoreBound } } } } },
      { $match : { scores: { $elemMatch: { type: 'quiz', score: { $gte: bestScoreBound } } } } },
      { $project: {
        _id: 0,
        name: 1,
        exam: { $arrayElemAt: ["$scores.score", 0] },
        quiz: { $arrayElemAt: ["$scores.score", 1] }
      }},
      { $sort: { exam: 1 } },
    ];

    const result = await studentCollection.aggregate(pipeline).toArray();
    console.log(`${result.length} satisfy criteria [best - quiz, exam]`);
    // console.log(result);

  } catch (err) {
    console.error(err);
  }
}

// - Calculate the average score for homework for all students

async function example14() {
  try {
    const pipeline = [
      { $group : { _id: "homework", averageScore: { $avg: { $arrayElemAt: ["$scores.score", -1] } } } },
    ];

    const result = await studentCollection.aggregate(pipeline).toArray();
    console.log(result);

  } catch (err) {
    console.error(err);
  }
}

// - Delete all students that have homework score <= 60

async function example15() {
  try {
    const query = {
      scores: { $elemMatch: { type: 'homework', score: { $lte: 60 } } }
    };
    const result = await studentCollection.deleteMany(query);

    console.log(`Deleted ${result.deletedCount} documents.`);
  } catch (err) {
    console.error(err);
  }
}

// -  Mark students that have quiz score => 80

async function example16() {
  try {
    const bestScoreBound = 80;

    const pipeline = [
      { $match : { scores: { $elemMatch: { type: 'quiz', score: { $gte: bestScoreBound } } } } },
      { $addFields: { marked : true } },
    ];

    const result = await studentCollection.aggregate(pipeline).toArray();
    console.log(`${result.length} students marked`);
  } catch (err) {
    console.error(err);
  }
}

//- Write a query that group students by 3 categories (calculate the average grade for three subjects)
// - a => (between 0 and 40)
// - b => (between 40 and 60)
// - c => (between 60 and 100)

async function example17() {
  try {
    const pipeline = [
      {
        $facet: {
          "exam": [
            {
              $bucket: {
                groupBy: {$arrayElemAt: ["$scores.score", 0]},
                boundaries: [0, 40, 60, 101],
                default: "Other",
                output: {
                  "average": {$avg: {$arrayElemAt: ["$scores.score", 0]}},
                }
              }
            }
          ],
          "quiz": [
            {
              $bucket: {
                groupBy: {$arrayElemAt: ["$scores.score", 1]},
                boundaries: [0, 40, 60, 101],
                default: "Other",
                output: {
                  "average": {$avg: {$arrayElemAt: ["$scores.score", 1]}},
                }
              }
            }
          ],
          "homework": [
            {
              $bucket: {
                groupBy: {$arrayElemAt: ["$scores.score", 2]},
                boundaries: [0, 40, 60, 101],
                default: "Other",
                output: {
                  "average": {$avg: {$arrayElemAt: ["$scores.score", 2]}},
                }
              }
            }
          ],
        }
      }
    ];

    const cursor = studentCollection.aggregate(pipeline);
    for await (const item of cursor) {
      console.log(item);
    }
  } catch (err) {
    console.error(err);
  }
}
