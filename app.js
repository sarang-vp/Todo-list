//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
});
console.log(mongoose.connection.readyState);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// schemas
const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);
const items = new Item({
  name: "cook food",
});
const items1 = new Item({
  name: "cook food",
});
const items2 = new Item({
  name: "cook food",
});
const totalitems = [items, items1, items2];
//  custom parameter schema
const customSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const Custom = mongoose.model("Custom", customSchema);

const workitemSchema = new mongoose.Schema({
  name: String,
});
const WorkItem = mongoose.model("WorkItem", itemSchema);

//  items.save();
// Item.find (function (err, itemarray) {
//       if (err) {
//           console.log(err);
//       } else
//       mongoose.connection.close();

//       itemarray.forEach(function (arrayItem) {
//       console.log(arrayItem);
//       });
//     });

// const items1 = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {
  const day = date.getDate();

  // fetching from db
  Item.find(function (err, itemarray) {
    res.render("list", { listTitle: "Today", newListItems: itemarray });
  });
});

// adding items to db
app.post("/", function (req, res) {
  const itemIn = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemIn,
  });

  if (req.body.list === "Today") {
    item.save();
    res.redirect("/");
  } else {
    Custom.findOne({ name: listName }, function (err, customitemarray) {
      customitemarray.items.push(item);
      customitemarray.save();
      res.redirect("/" + listName);
    });
  }
});
    // deleting items from db
app.post("/delete", function (req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  console.log(checkedId);
  if (req.body.listName === "Today") {
    Item.deleteOne({ _id: checkedId }, function (err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log("Update successful");
      }
    });
    res.redirect("/");
  } else {
    Custom.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedId } } },
      function (err, obj) {
        if (err) {
          console.error(err);
        } else {
          console.log("Update successful");
        }
      }
    );
    res.redirect("/" + listName);
  }
});
  // creating db collection dynamically
app.get("/:customParametername", function (req, res) {
  const customParametername = _.startCase(req.params.customParametername);

  Custom.findOne(
    { name: customParametername },
    function (err, customitemarray) {
      console.log(customitemarray);
      if (!err) {
        if (!customitemarray) {
          const custom = new Custom({
            name: customParametername,
            items: totalitems,
          });
          custom.save();
          res.redirect("/" + customParametername);
        } else {
          res.render("list", {
            listTitle: customitemarray.name,
            newListItems: customitemarray.items,
          });
        }
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
