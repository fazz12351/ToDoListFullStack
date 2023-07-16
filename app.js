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

const listModel = new mongoose.model("Events", listSchema)

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const items = [];
const workItems = [];

app.get("/", function (req, res) {

  const day = date.getDate();

  res.render("list", {
    listTitle: day,
    newListItems: items
  });

});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const newListItem=new listModel({
    task:item
  })
  newListItem.save()

  items.push(item);
  res.redirect("/");

});


app.post("/remove", (req, res) => {
  let delIndex = parseInt(req.body.click)
  listModel.deleteOne({"task":items[delIndex]}).then(function(){
    console.log("succesfully deleted")
  })
  items.splice(delIndex, 1)

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

app.listen(3000, function() {
  console.log("server running on port 3000");
})



function pushDataToArr(){
  listModel.find({}).then(function(res){
    for(let i=0;i<res.length;i++){
      items.push(res[i].task)
    }
  })

}



pushDataToArr()

