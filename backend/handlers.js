"use strict";

const { MongoClient } = require("mongodb");
require("dotenv").config();
const MONGO_URI =
  "mongodb+srv://Ramil1988:Ramil1988@cluster0.6u2bmta.mongodb.net/?retryWrites=true&w=majority";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

// returns an array of all flight numbers
const getFlights = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();

  const db = client.db("slingair");
  const collection = db.collection("flights");

  const result = await collection.find({}).toArray();

  if (!result) {
    res
      .status(404)
      .json({ status: 404, message: "No flights found in the database" });
  }
  try {
    const flights = result.map((item) => ({ flight: item.flight }));
    res.status(200).json({ status: 200, flights: flights });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();

  const flightNumber = req.params.flight;

  const db = client.db("slingair");
  const collection = db.collection("flights");

  const result = await collection.find({}).toArray();

  if (!result) {
    res
      .status(404)
      .json({ status: 404, message: "No seats found in the database" });
  }
  try {
    const matchedFlight = result.filter(
      (flight) => flight.flight === flightNumber
    );
    const seats = matchedFlight[0].seats;

    res.status(200).json({ status: 200, seats: [{ seats }] });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// returns all reservations
const getReservations = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("slingair");

  const collection = db.collection("reservations");
  const result = await collection.find({}).toArray();

  if (!result) {
    res
      .status(404)
      .json({ status: 404, message: "No reservations found in the database" });
  }
  try {
    const reservation = result.map((item) => ({ reservation: item }));
    res.status(200).json({ status: 200, reservation: reservation });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// returns a single reservation
const getSingleReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("slingair");
    const reservationToGet = req.params.reservation;
    const matchedReservation = await db
      .collection("reservations")
      .findOne({ _id: reservationToGet });
    if (!matchedReservation) {
      res.status(404).json({
        status: 404,
        message: "Reservation not found",
      });
    } else {
      res.status(200).json({
        status: 200,
        reservation: matchedReservation,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// creates a new reservation
const addReservation = async (req, res) => {
  const { flight, seat, givenName, surname, email } = req.body;
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingair");
    const reservationsData = await db
      .collection("reservations")
      .findOne({ seat: seat });

    if (reservationsData) {
      res.status(400).json({
        status: 400,
        data: "This seat is already booked.",
      });
    } else if (!givenName || !surname || !email) {
      res.status(400).json({
        status: 400,
        data: "Please provide your contact information.",
      });
    } else {
      const flightsSeat = await db
        .collection("flights")
        .updateOne(
          { flight: flight, "seats.id": seat },
          { $set: { "seats.$.isAvailable": false } }
        );

      const result = await db.collection("reservations").insertOne({
        _id: uuidv4(),
        flight: flight,
        seat: seat,
        givenName: givenName,
        surname: surname,
        email: email,
      });

      if (result.acknowledged || flightsSeat.acknowledged) {
        res.status(200).json({
          status: 200,
          data: result,
          message: `You have successfully booked the seat № ${seat} of flight number ${flight}`,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// updates a specified reservation
const updateReservation = async (req, res) => {
  const { flight, seat, givenName, surname, email } = req.body;
  const { reservation } = req.params;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to connect to the database, try again",
    });
    return;
  }

  const db = client.db("slingair");

  try {
    const reservationToUpdate = await db
      .collection("reservations")
      .findOne({ _id: reservation });

    if (!reservationToUpdate) {
      res.status(404).json({
        status: 404,
        message: `Reservation with id ${reservation} not found.`,
      });
      return;
    }

    if (flight) {
      const flightDoc = await db
        .collection("flights")
        .findOne({ flight: flight });
      if (!flightDoc || !flightDoc.seats) {
        res.status(404).json({
          status: 404,
          message: `Flight №${flight} not found or has no seats.`,
        });
        return;
      }
    }

    if (seat) {
      const existingReservation = await db
        .collection("reservations")
        .findOne({ flight: reservationToUpdate.flight, seat: seat });

      if (existingReservation && existingReservation._id !== reservation) {
        res.status(400).json({
          status: 400,
          message: `This seat №${seat} of flight №${reservationToUpdate.flight} is already booked.`,
        });
        return;
      }
    }

    const updateFields = {
      ...(flight && { flight }),
      ...(seat && { seat }),
      ...(givenName && { givenName }),
      ...(surname && { surname }),
      ...(email && { email }),
    };

    const result = await db
      .collection("reservations")
      .updateOne({ _id: reservation }, { $set: updateFields });

    if (seat) {
      // Set the old seat to be available
      await db.collection("flights").updateOne(
        {
          flight: reservationToUpdate.flight,
          "seats.id": reservationToUpdate.seat,
        },
        { $set: { "seats.$.isAvailable": true } }
      );

      // Set the new seat to be unavailable
      await db
        .collection("flights")
        .updateOne(
          { flight: reservationToUpdate.flight, "seats.id": seat },
          { $set: { "seats.$.isAvailable": false } }
        );
    }

    if (result.acknowledged) {
      res.status(200).json({
        status: 200,
        message: `You have successfully updated the reservation with id ${reservation}.`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const { reservation } = req.params;
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingair");
    const reservationToDelete = await db
      .collection("reservations")
      .findOne({ _id: reservation });

    if (!reservationToDelete) {
      res.status(400).json({
        status: 400,
        data: "This reservation does not exist.",
      });
    } else {
      const flightsSeat = await db.collection("flights").updateOne(
        {
          flight: reservationToDelete.flight,
          "seats.id": reservationToDelete.seat,
        },
        { $set: { "seats.$.isAvailable": true } }
      );

      const result = await db
        .collection("reservations")
        .deleteOne({ _id: reservation });

      if (result.acknowledged && flightsSeat.acknowledged) {
        res.status(200).json({
          status: 200,
          data: `You have successfully cancelled the reservation for ${reservationToDelete.givenName} ${reservationToDelete.surname} on seat ${reservationToDelete.seat} of flight ${reservationToDelete.flight}`,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong in Database, try again",
    });
  } finally {
    client.close();
  }
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
