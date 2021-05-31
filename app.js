'use strict'

const {mapUser, getRandomFirstName} = require('./util')

// db connection and settings
const connection = require('./config/connection')
const { Db } = require('mongodb')
let userCollection
run()

async function run() {
  await connection.connect()
  // await connection.get().createCollection('users')
  await connection.get().dropCollection('users')
  userCollection = connection.get().collection('users')

  await example1()
  await example2()
  await example3()
  await example4()
  
  
  await task5()
  await task6()
  await task7()
  await task8()
  await task9()
  await connection.close()
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {

  try {

    const departments = ['a', 'a', 'b', 'b', 'c', 'c']
    const users = departments.map(dep => ({ department: dep })).map(mapUser)
    try {
      const {result} = await userCollection.insertMany(users)
      console.log(`added ${result.n} users`)
    } catch (err) {
      console.error(err)
    }
  } catch (err) {
    console.log(err)
  }
}
// - Delete 1 user from department (a)

async function example2() {
  try {
    const { result } = await userCollection.deleteOne({ department: 'a' })
    console.log(`removed ${result.n} user`)
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    const usersB = await userCollection.find({ department: 'b' }).toArray()
    const bulkWrite = usersB.map(user => ({
      updateOne: {
        filter: { _id: user._id},
        update: {$set: {firstName: getRandomFirstName()}}
      }
    }))
    const { result } = await userCollection.bulkWrite(bulkWrite)
    console.log(`updated ${result.nModified} users`)
  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const usersFromC = await userCollection.find({ department: 'c' }).toArray()

    console.log(`found ${usersFromC.length} users`)
  } catch (err) {
    console.error(err)
  }
}

//Create 5 articles per each type (a, b, c)
async function task5() {
  try {
    
    const types = ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c', 'c']
    const articles = types.map(type => ({
      name:  'Mongodb - introduction',
      description: 'Mongodb - text',
      type: type,
      tags: []
    }))

    const { result } = await userCollection.insertMany(articles)
    console.log(`added ${result.n} articles`)
  } catch (err) {
    console.log(err)
  }
}

//Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function task6() {
  try {
    
    const articleTypeA = await userCollection.find({ type: 'a' }).toArray()
    const bulkWrite = articleTypeA.map(article => ({
      updateOne: {
        filter: {
          _id: article._id,
          type: 'a'
        },
        update: {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}}
      }
    }))
    const { result } = await userCollection.bulkWrite(bulkWrite)
    console.log(`updated ${result.nModified} articles`)
  } catch (err) {
    console.log(err)
  }
}
//Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function task7() {
  try {
    const articlesNotTypeA = await userCollection.find({type: {$nin: ['a']}}).toArray()
    const bulkWrite = articlesNotTypeA.map(article => ({
      updateOne: {
        filter:{_id: article._id},
        update:{$set: {tags: ['tag2', 'tag3', 'super']}}
      }
    }))
    const { result } = await userCollection.bulkWrite(bulkWrite)
    console.log(`updated ${result.nModified} articles`)

  } catch (err) {
    console.log(err)
  }
}

//Find all articles that contains tags [tag2, tag1-a]
async function task8() {
  try {
    const strictArticles = await userCollection.find({ tags: { $in: ['tag2', 'tag1-a'] }}).toArray()
    console.log(`found ${strictArticles.length} articles`)
  } catch (err) {
    console.log(err)
  }
}
//Pull [tag2, tag1-a] from all articles
async function task9() {
  try {
    
    const { result } = await userCollection.updateMany(
      {},
      { $pull: { tags: { $in: ['tag2', 'tag1-a'] } }},
      {multi: true}
    )
    console.log(`pulled tags from ${result.nModified} articles`)
  } catch (err) {
    console.log(err)
  }
}