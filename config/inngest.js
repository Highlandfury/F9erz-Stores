import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "f9erz" });

// Ingest function to save user data to database
export const syncUsercreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await dbConnect();
    await User.create(userData);
  }
);

// Ingest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
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
    await dbConnect();
    await User.findByIdAndUpdate(id, userData);
  }
);

// Ingest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { id } = event.data
    await dbConnect();
    await User.findByIdAndDelete(id);
  }
);
// You can add more functions here to handle other events from Clerk
// like 'clerk/user.deleted', 'clerk/user.suspended', etc.
// Just follow the same pattern as above
// and adjust the logic as needed for each event type.
