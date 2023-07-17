//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/myList');

const listSchema = new mongoose.Schema({
  task: {
    type: String,
    min: 0
  }
})
const customSchema = new mongoose.Schema({
  name: String,
  items: [listSchema]

})

const listModel = new mongoose.model("Events", listSchema)
const customModel = new mongoose.model("Custom", customSchema)
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const defualtItems = [];
const workItems = [];

app.get("/", function (req, res) {

  const day = date.getDate();

  res.render("list", {
    listTitle: day,
    newListItems: defualtItems
  });

});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const newListItem = new listModel({
    task: item
  })
  newListItem.save()

  defualtItems.push(newListItem);
  res.redirect("/");

});


app.post("/remove", (req, res) => {
  let delIndex = parseInt(req.body.click)
  let currentDelObject = defualtItems[delIndex].task
  console.log(currentDelObject)

  listModel.deleteOne({
    "task": currentDelObject
  }).then(function () {
    console.log("succesfully deleted")
  })
  defualtItems.splice(delIndex, 1)

  res.redirect("/")

})

app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/:customList", function (req, res) {
  const currentList = req.params.customList

  customModel.find({
    "name": currentList
  }).then(function (responce) {
    const data = responce[0]
    console.log(res)
    if (responce.length > 0) {
      res.render("list", {
        listTitle: data.name,
        newListItems: data.items
      })
    } else {
      const item = new customModel({
        name: currentList,
        items: defualtItems
      })
      item.save()
      res.redirect("/" + currentList + "")
    }

  })





})

app.listen(3000, function () {
  console.log("server running on port 3000");
})









function pushDataToArr() {
  listModel.find({}).then(function (res) {
    for (let i = 0; i < res.length; i++) {
      defualtItems.push(res[i])
    }
  })

}
pushDataToArr()