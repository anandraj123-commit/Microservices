const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

/*
  For now, subscriptions are hardcoded.

  Later we can make services dynamically register themselves.
*/

const subscribers = {
  PRODUCT_CREATED: [
    "http://inventory-service/events"
  ],

  ORDER_CREATED: [
    "http://inventory-service/events",
    "http://notification-service/events"
  ],

  INVENTORY_UPDATED: [
    "http://notification-service/events"
  ]
};

app.get("/", (req, res) => {
  res.json({
    service: "Custom Broker Service",
    status: "running"
  });
});

app.post("/publish", async (req, res) => {
  const { event, data } = req.body;

  if (!event) {
    return res.status(400).json({
      message: "event is required"
    });
  }

  console.log(`Event received: ${event}`);
  console.log(data);

  const eventSubscribers = subscribers[event] || [];

  const results = [];

  for (const subscriber of eventSubscribers) {
    try {
      const response = await fetch(subscriber, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event,
          data
        })
      });

      results.push({
        subscriber,
        success: response.ok
      });
    } catch (error) {
      console.error(
        `Failed to send ${event} to ${subscriber}`,
        error.message
      );

      results.push({
        subscriber,
        success: false,
        error: error.message
      });
    }
  }

  res.json({
    message: "Event processed by broker",
    event,
    subscribers: eventSubscribers.length,
    results
  });
});

app.listen(PORT, () => {
  console.log(`Custom Broker Service running on port ${PORT}`);
});