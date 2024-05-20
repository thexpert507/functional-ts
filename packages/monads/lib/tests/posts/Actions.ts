import { all, describe } from "../../monads";
import { Email, Post, User } from "./interfaces";

const findAllPosts = describe<Post[]>("find-all-posts").make();

const findUserByPost = (post: Post) => describe<User>("find-user-by-post").setPayload(post).make();

const makeEmail = (user: User): Email => {
  return {
    name: user.name,
    email: user.email,
    body: `Hello ${user.name},\n\nI hope you are doing well.`,
  };
};

const sendEmail = (email: Email) => describe<void>("send-email").setPayload(email).make();

export const SendEmailFromAllPosts = findAllPosts.chain((posts) => {
  return all(...posts.map((post) => findUserByPost(post)))
    .map((users) => users.map(makeEmail))
    .chain((emails) => all(...emails.map(sendEmail)));
});
