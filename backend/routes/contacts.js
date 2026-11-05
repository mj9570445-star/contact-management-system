const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");

// Update Contact
router.put("/:id", async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.status(200).json(updatedContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add New Contact
router.post("/", async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        const savedContact = await newContact.save();

        res.status(201).json(savedContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Contacts
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Contact
router.delete("/:id", async (req, res) => {
    console.log("DELETE ROUTE HIT");
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);

        if (!deletedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({
            message: "Contact Deleted Successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
