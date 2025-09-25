import { Inngest } from "inngest";
import dbConnect from "./db";
import mongoose from "mongoose";

// Create a client to send and receive events
export const inngest = new Inngest({
  name: process.env.INNGEST_NAME || "F9erz",
});

// helper to safely resolve a registered User model
const getUserModel = () => mongoose.models?.User || null;

// Inngest function to save user data to a database
export const syncUsercreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { events: ["clerk/user.created"] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event?.data || {};
    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };
    await dbConnect();
    const User = getUserModel();
    if (!User) return;
    await User.create(userData);
  }
);

// Inngest function to update user data in a database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-from-clerk" },
  { events: ["clerk/user.updated"] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event?.data || {};
    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };
    await dbConnect();
    const User = getUserModel();
    if (!User) return;
    await User.findByIdAndUpdate(id, userData, { new: true, upsert: false });
  }
);

// Inngest function to delete user data from a database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { events: ["clerk/user.deleted"] },
  async ({ event }) => {
    const { id } = event?.data || {};
    if (!id) return;
    await dbConnect();
    const User = getUserModel();
    if (!User) return;
    await User.findByIdAndDelete(id);
  }
);
// ...existing code...