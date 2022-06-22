//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");

const todolistschema = new mongoose.Schema({
  name: String
}
);

const list = mongoose.model("list", todolistschema);

const item1 = new list({
  name: " welcome to your new todo list!"
});

const item2 = new list({
  name: " Hit the + button to add a new item"
});

const item3 = new list({
  name: " <-- hit this to remove an item"
});

const defaultitem = [item1, item2, item3];

const ListSchema = new mongoose.Schema({
  name: String,
  listItems: [todolistschema]
});

const customList = mongoose.model("customList", ListSchema);

app.get("/", function (req, res) {

  list.find(function (err, doc) {

    const day = date.getDate();

    if (doc.length === 0) {
      list.insertMany(defaultitem, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("sucessful")
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: doc });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const list1 = new list({
    name: itemName
  });

  if (listName === date.getDate()) {
    list1.save();
    res.redirect("/");
  } else {
    customList.findOne({ name: listName }, function (err, doc) {
      doc.listItems.push(list1);
      doc.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function (req, res) {

  const checkedListItem = req.body.checkedItem;
  const ListName = req.body.ListName;

  if (date.getDate() === ListName) {

    list.findByIdAndDelete(checkedListItem, function (err) {
      console.log("successfull");
    });

    res.redirect("/");
  }
  else{
    customList.findOneAndUpdate({name:ListName} , {$pull:{listItems:{_id : checkedListItem} }} , function(err , doc){
      if(!err){
        res.redirect("/" + ListName);
      }
    });
  }


})

app.get("/:route", function (req, res) {

  const customListName = _.capitalize(req.params.route);

  customList.findOne({ name: customListName }, function (err, doc) {
    if (!err) {
      if (!doc) {
        console.log("doesnt exixt");
        const List1 = new customList({
          name: customListName,
          listItems: defaultitem
        });
        List1.save();

        res.redirect("/" + customListName);
      }
      else {
        console.log("created");
        res.render("list", { listTitle: customListName, newListItems: doc.listItems });
      }
    }
  })


})

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
