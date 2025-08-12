import {z} from "zod";

export const messageSchema = z.object({
  content: z.string().min(20, {error: "Message must be at least 20 character long"}).max(300, {error: "Message must be at most 300 character long"}).trim()
})