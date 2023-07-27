//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const day = date.getDate();

mongoose.connect('mongodb://127.0.0.1:27017/myList');

const listSchema = new mongoose.Schema({
  task: {
    type: String
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
  res.render("list", {
    listTitle: day,
    newListItems: defualtItems
  });

});

app.post("/", function (req, res) {
  const clientRequest = req.body

  const appendNewItem = new listModel({
    task: clientRequest.newItem

  })

  if (clientRequest.Header == day) {
    appendNewItem.save()
    defualtItems.push(appendNewItem)
    res.redirect("/")


  } else {

    customModel.find({
      name: clientRequest.Header
    }).then((result) => {
      let allItems = []
      for (let i = 0; i < result[0].items.length; i++) {
        allItems.push(result[0].items[i])
      }
      allItems.push(appendNewItem)
      customModel.findOneAndUpdate({
        name: clientRequest.Header
      }, {
        items: allItems
      }).then(function (responce) {
        res.redirect("/" + clientRequest.Header)

      })


    })
  }

});













app.post("/remove", (req, res) => {
  let delIndex = parseInt(req.body.click)
  const Header = req.body.removeTitle[0]

  if (Header != day) {
    customModel.find({
      name: Header
    }).then(function (result) {
      let allItems = []
      allItems = result[0].items
      allItems.splice(delIndex, 1)
      customModel.findOneAndUpdate({
        name: Header
      }, {
        items: allItems
      }).then(function (responce) {
        console.log("done")
      })
    })
    res.redirect("/" +Header)


  } else {
    let currentDelObject = defualtItems[delIndex].task
    listModel.deleteOne({
      "task": currentDelObject
    }).then(function () {

    })
    defualtItems.splice(delIndex, 1)
    res.redirect("/")
  }





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

    if (responce.length > 0) {
      res.render("list", {
        listTitle: data.name,
        newListItems: data.items
      })
    } else {
      const item = new customModel({
        name: currentList,
        items: []
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