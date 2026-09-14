const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Temporary in-memory database
const inventory = [];

/*
Example:

[
  {
    productId: "123",
    productName: "Laptop",
    quantity: 0
  }
]
*/


// ------------------------------------
// Health Check
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    service: "Inventory Service",
    status: "running",
  });
});


// ------------------------------------
// Get All Inventory
// ------------------------------------

app.get("/inventory", (req, res) => {
  res.json(inventory);
});


// ------------------------------------
// Get Inventory By Product ID
// ------------------------------------

app.get("/inventory/:productId", (req, res) => {
  const item = inventory.find(
    (item) => item.productId === req.params.productId
  );

  if (!item) {
    return res.status(404).json({
      message: "Inventory not found",
    });
  }

  res.json(item);
});


// ------------------------------------
// Manually Update Stock
// ------------------------------------

app.patch("/inventory/:productId", (req, res) => {
  const { quantity } = req.body;

  const item = inventory.find(
    (item) => item.productId === req.params.productId
  );

  if (!item) {
    return res.status(404).json({
      message: "Inventory not found",
    });
  }

  if (quantity === undefined || Number(quantity) < 0) {
    return res.status(400).json({
      message: "Valid quantity is required",
    });
  }

  item.quantity = Number(quantity);

  res.json({
    message: "Inventory updated successfully",
    inventory: item,
  });
});


// ------------------------------------
// Receive Events From Broker
// ------------------------------------

app.post("/events", async (req, res) => {
  const { event, data } = req.body;

  console.log("\nInventory Service received event:");
  console.log("Event:", event);
  console.log("Data:", data);

  if (!event) {
    return res.status(400).json({
      message: "event is required",
    });
  }


  // ====================================
  // PRODUCT_CREATED
  // ====================================

  if (event === "PRODUCT_CREATED") {

    const existingItem = inventory.find(
      (item) => item.productId === data.id
    );

    if (existingItem) {
      return res.status(200).json({
        message: "Inventory already exists for this product",
        inventory: existingItem,
      });
    }

    const inventoryItem = {
      productId: data.id,
      productName: data.name,
      quantity: 0,
    };

    inventory.push(inventoryItem);

    console.log("Inventory created:");
    console.log(inventoryItem);

    return res.status(201).json({
      message: "Inventory created successfully",
      inventory: inventoryItem,
    });
  }


  // ====================================
  // ORDER_CREATED
  // ====================================

  if (event === "ORDER_CREATED") {

    const item = inventory.find(
      (item) => item.productId === data.productId
    );

    if (!item) {
      console.log(
        `Inventory not found for product ${data.productId}`
      );

      return res.status(404).json({
        message: "Inventory not found for product",
      });
    }

    const orderQuantity = Number(data.quantity);

    if (item.quantity < orderQuantity) {
      console.log("Insufficient stock");

      return res.status(400).json({
        message: "Insufficient stock",
        available: item.quantity,
        requested: orderQuantity,
      });
    }

    item.quantity -= orderQuantity;

    console.log("Stock reduced:");
    console.log(item);


    // Publish INVENTORY_UPDATED event
    try {
      await fetch("http://broker-service/publish", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          event: "INVENTORY_UPDATED",

          data: {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            orderId: data.id,
          },
        }),
      });
    } catch (error) {
      console.error(
        "Failed to publish INVENTORY_UPDATED:",
        error.message
      );
    }


    return res.status(200).json({
      message: "Inventory reduced successfully",
      inventory: item,
    });
  }


  // ====================================
  // Unknown Event
  // ====================================

  return res.status(200).json({
    message: `Inventory Service does not handle ${event}`,
  });
});


// ------------------------------------
// Start Server
// ------------------------------------

app.listen(PORT, () => {
  console.log(
    `Inventory Service running on port ${PORT}`
  );
});