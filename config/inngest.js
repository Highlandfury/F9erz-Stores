import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User";

// Create a client to send and receive events
// Inngest requires a name in newer SDK versions. Provide a human-friendly
// name plus an id for identification in logs/console.
export const inngest = new Inngest({ name: "f9erz", id: "f9erz" });

// Ingest function to save user data to database
export const syncUsercreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    name: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
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
      return { success: true, id };
    } catch (err) {
      // Let Inngest mark the function as failed so it's visible in the UI/logs.
      throw err;
    }
  }
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
  async ({ event, step }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      name: first_name + " " + last_name,
      email: email_address[0].email_address,
      imageUrl: image_url,
    };
    try {
      await dbConnect();
      const res = await User.findByIdAndUpdate(id, userData, { new: true });
      return { success: true, id, updated: !!res };
    } catch (err) {
      throw err;
    }
  }
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
  async ({ event }) => {
    const { id } = event.data;
    try {
      await dbConnect();
      const res = await User.findByIdAndDelete(id);
      return { success: true, deletedId: id, deleted: !!res };
    } catch (err) {
      throw err;
    }
  }
);
// You can add more functions here to handle other events from Clerk
// like 'clerk/user.deleted', 'clerk/user.suspended', etc.
// Just follow the same pattern as above
// and adjust the logic as needed for each event type.
