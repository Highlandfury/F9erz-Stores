import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User";

// Create a client to send and receive events
// Inngest requires a name in newer SDK versions. Provide a human-friendly
// name plus an id for identification in logs/console.
export const inngest = new Inngest({ name: "f9erz", id: "f9erz" });

// Ingest function to save user data to database
const withTimeout = (fn, ms = 30000) => async (args) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error(`Handler timeout after ${ms}ms`)), ms));
  return Promise.race([fn(args), timeout]);
};

export const syncUsercreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    name: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  withTimeout(async ({ event }) => {
    console.log("[inngest] syncUsercreation start", { eventId: event?.id, eventName: event?.name });
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    try {
      await dbConnect();
      await User.create(userData);
      const result = { success: true, id };
      console.log("[inngest] syncUsercreation complete", result);
      return result;
    } catch (err) {
      console.error("[inngest] syncUsercreation error", err);
      throw err;
    }
  })
);

// Ingest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    name: "update-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  withTimeout(async ({ event, step }) => {
    console.log("[inngest] syncUserUpdation start", { eventId: event?.id, eventName: event?.name });
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      name: first_name + " " + last_name,
      email: email_address[0].email_address,
      imageUrl: image_url,
    };
    try {
      await dbConnect();
      const res = await User.findByIdAndUpdate(id, userData, { new: true });
      const result = { success: true, id, updated: !!res };
      console.log("[inngest] syncUserUpdation complete", result);
      return result;
    } catch (err) {
      console.error("[inngest] syncUserUpdation error", err);
      throw err;
    }
  })
);

// Ingest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    name: "delete-user-from-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  withTimeout(async ({ event }) => {
    console.log("[inngest] syncUserDeletion start", { eventId: event?.id, eventName: event?.name });
    const { id } = event.data;
    try {
      await dbConnect();
      const res = await User.findByIdAndDelete(id);
      const result = { success: true, deletedId: id, deleted: !!res };
      console.log("[inngest] syncUserDeletion complete", result);
      return result;
    } catch (err) {
      console.error("[inngest] syncUserDeletion error", err);
      throw err;
    }
  })
);
// You can add more functions here to handle other events from Clerk
// like 'clerk/user.deleted', 'clerk/user.suspended', etc.
// Just follow the same pattern as above
// and adjust the logic as needed for each event type.
