const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const orders = [];

// Health check
app.get("/", (req, res) => {
  res.json({
    service: "Order Service",
    status: "running",
  });
});

// Get all orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

// Get single order
app.get("/orders/:id", (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json(order);
});

// Create order
app.post("/orders", async (req, res) => {
  try {
    const {
      productId,
      quantity,
      customerName,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Valid quantity is required",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        message: "customerName is required",
      });
    }

    const order = {
      id: `ORD-${Date.now()}`,
      productId,
      quantity: Number(quantity),
      customerName,
      status: "CREATED",
      createdAt: new Date().toISOString(),
    };

    // Store order in memory
    orders.push(order);

    console.log("Order created:");
    console.log(order);

    // Publish ORDER_CREATED event to broker
    try {
      const brokerResponse = await fetch(
        "http://localhost:4000/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "ORDER_CREATED",
            data: order,
          }),
        }
      );

      const brokerData = await brokerResponse.json();

      console.log("Broker response:");
      console.log(brokerData);
    } catch (brokerError) {
      console.error(
        "Failed to publish ORDER_CREATED:",
        brokerError.message
      );
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Delete order
app.delete("/orders/:id", (req, res) => {
  const index = orders.findIndex(
    (item) => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const deletedOrder = orders.splice(index, 1)[0];

  res.json({
    message: "Order deleted successfully",
    order: deletedOrder,
  });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});