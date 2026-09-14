const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

const notifications = [];

// Health check
app.get("/", (req, res) => {
  res.json({
    service: "Notification Service",
    status: "running",
  });
});

// Receive events from Broker Service
app.post("/events", (req, res) => {
  const { event, data } = req.body;

  console.log("Notification Service received event:");
  console.log(event);
  console.log(data);

  if (!event) {
    return res.status(400).json({
      message: "event is required",
    });
  }

  let notificationMessage = "";

  // Handle ORDER_CREATED event
  if (event === "ORDER_CREATED") {
    notificationMessage =
      `Order ${data.id} was created successfully for ${data.customerName}.`;
  }

  // Handle INVENTORY_UPDATED event
  else if (event === "INVENTORY_UPDATED") {
    notificationMessage =
      `Inventory updated for product ${data.productId}.`;
  }

  // Handle PRODUCT_CREATED event
  else if (event === "PRODUCT_CREATED") {
    notificationMessage =
      `New product ${data.name} was created.`;
  }

  // Unknown event
  else {
    return res.status(200).json({
      message: `Notification Service does not handle ${event}`,
    });
  }

  const notification = {
    id: `NOT-${Date.now()}`,
    event,
    message: notificationMessage,
    data,
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);

  console.log("Notification created:");
  console.log(notification);

  res.status(200).json({
    message: "Notification created successfully",
    notification,
  });
});

// Get all notifications
app.get("/notifications", (req, res) => {
  res.json(notifications);
});

// Get single notification
app.get("/notifications/:id", (req, res) => {
  const notification = notifications.find(
    (item) => item.id === req.params.id
  );

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  res.json(notification);
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});