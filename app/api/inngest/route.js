import { serve } from "inngest/next";
import { inngest, syncUsercreation, syncUserDeletion, syncUserUpdation } from "@/config/inngest";

const functions = [syncUsercreation, syncUserDeletion, syncUserUpdation];

export const { GET, POST, PUT } = serve(inngest, functions);